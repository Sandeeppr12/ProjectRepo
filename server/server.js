const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();
const { db, isFirebaseConfigured } = require('./firebase');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'digital_vistara_secret_key_2026';
const ADMIN_EMAIL = typeof process.env.ADMIN_EMAIL === 'string'
  ? process.env.ADMIN_EMAIL.trim().toLowerCase()
  : '';
const isAuthorizedAdmin = (user) => user.role === 'admin'
  && user.adminManaged === true
  && Boolean(ADMIN_EMAIL)
  && user.email === ADMIN_EMAIL;
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Set JWT_SECRET before starting the production server.');
}
if (process.env.NODE_ENV === 'production' && !/^\S+@\S+\.\S+$/.test(ADMIN_EMAIL)) {
  throw new Error('Set ADMIN_EMAIL to the authorized administrator before starting the production server.');
}
const PORT = process.env.PORT || 5000;
const REGISTRATION_OTP_TTL_MS = 10 * 60 * 1000;
const REGISTRATION_OTP_RESEND_MS = 60 * 1000;
const REGISTRATION_OTP_MAX_ATTEMPTS = 5;
const USE_MOCK_PAYMENTS = process.env.NODE_ENV !== 'production'
  && (!process.env.PAYMENT_MODE || process.env.PAYMENT_MODE === 'mock');
const PAYMENT_CATALOG = {
  'pvr-1': { price: 2999, services: ['Website Development', 'SEO & Google Ads Management', 'Social Media Management'] },
  'pvr-2': { price: 750, services: ['Physiotherapy at Home', 'Nurse at Home', 'Elderly Care & Attendant'] },
  'pvr-3': { price: 500, services: ['Mathematics Tutor', 'Coding Tutor', 'Competitive Exam Mentor', 'Science Tutor'] },
  'pvr-4': { price: 499, services: ['AC Repair & Service', 'Electrician Services', 'Deep Home Cleaning'] },
  'pvr-5': { price: 15000, services: ['Wedding Photography & Videography', 'Wedding Planning & Decoration'] },
  'pvr-6': { price: 3499, services: ['Website Development', 'Social Media Management'] }
};
const pendingPaymentOrders = new Map();
let registrationMailTransport;
let registrationSmsClient;

const getRazorpayClient = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const documentData = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

const listCollection = async (name) => {
  const snapshot = await db.collection(name).get();
  return snapshot.docs.map(documentData);
};

const publicUser = (user) => {
  const { passwordHash, adminManaged, ...safeUser } = user;
  return safeUser;
};

const signUserToken = (user) => jwt.sign(
  { sub: user.id, role: user.role, email: user.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const getRegistrationMailTransport = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }
  if (!registrationMailTransport) {
    registrationMailTransport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE.toLowerCase() === 'true'
        : port === 465,
      auth: { user, pass }
    });
  }
  return registrationMailTransport;
};

const getRegistrationSmsClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid)) return null;
  if (!registrationSmsClient) registrationSmsClient = twilio(accountSid, authToken);
  return {
    client: registrationSmsClient,
    fromNumber,
    messagingServiceSid
  };
};

const toSmsNumber = (mobile) => {
  const compact = mobile.replace(/[\s().-]/g, '');
  if (/^\+[1-9]\d{7,14}$/.test(compact)) return compact;
  if (/^\d{10}$/.test(compact)) return `+91${compact}`;
  if (/^91\d{10}$/.test(compact)) return `+${compact}`;
  return null;
};

const sendRegistrationSms = async (sms, to, body) => {
  const message = {
    to,
    body,
    ...(sms.messagingServiceSid
      ? { messagingServiceSid: sms.messagingServiceSid }
      : { from: sms.fromNumber })
  };
  return sms.client.messages.create(message);
};

const registrationOtpHash = (email, otp) => crypto
  .createHmac('sha256', JWT_SECRET)
  .update(`${email}:${otp}`)
  .digest('hex');

const emailDocumentId = (email) => crypto.createHash('sha256').update(email).digest('hex');

const createProviderProfile = (user, category) => ({
  id: `provider-${user.id}`,
  userId: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  avatar: user.avatar,
  category: category || 'HOME SERVICES',
  servicesOffered: [],
  skills: [],
  qualification: '',
  experienceYears: 0,
  city: user.city,
  serviceArea: user.city,
  maxRadiusKm: 10,
  hourlyRate: 0,
  startingPrice: 0,
  verificationStatus: 'PENDING',
  rating: 0,
  reviewCount: 0,
  completedJobs: 0,
  bio: '',
  availabilityDays: [],
  availableToday: false,
  responseTimeMinutes: 60,
  portfolio: []
});

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });

  try {
    const claims = jwt.verify(token, JWT_SECRET);
    const userSnapshot = await db.collection('users').doc(claims.sub).get();
    if (!userSnapshot.exists) return res.status(401).json({ error: 'Account not found.' });
    req.user = { ...documentData(userSnapshot), id: userSnapshot.id };
    if (req.user.role === 'admin' && !isAuthorizedAdmin(req.user)) {
      return res.status(403).json({ error: 'This administrator account is not authorized.' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Your session expired. Sign in again.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission for this action.' });
  next();
};

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: isFirebaseConfigured ? 'firestore' : 'demo',
    message: 'DIGITAL VISTARA Backend API Server Running',
    timestamp: new Date()
  });
});

const validateRegistrationInput = (body) => {
  const normalizedEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = body?.role || 'customer';
  if (typeof body?.name !== 'string' || body.name.trim().length < 2
      || !/^\S+@\S+\.\S+$/.test(normalizedEmail)
      || typeof body?.password !== 'string' || body.password.length < 8
      || typeof body?.mobile !== 'string' || !body.mobile.trim()
      || !['customer', 'provider'].includes(role)
      || typeof body?.city !== 'string' || !body.city.trim()) {
    return null;
  }
  const smsNumber = toSmsNumber(body.mobile.trim());
  if (!smsNumber) return null;

  return {
    name: body.name.trim(),
    email: normalizedEmail,
    password: body.password,
    role,
    city: body.city.trim(),
    mobile: body.mobile.trim(),
    smsNumber,
    category: typeof body.category === 'string' ? body.category : ''
  };
};

app.post('/api/auth/register/request-otp', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Firebase is not configured on the server.' });
  const mailTransport = getRegistrationMailTransport();
  const sms = getRegistrationSmsClient();
  if (!mailTransport || !sms) {
    return res.status(503).json({
      error: 'Email and SMS verification are not fully configured. Contact the site administrator.'
    });
  }

  const registration = validateRegistrationInput(req.body);
  if (!registration) {
    return res.status(400).json({
      error: 'Enter valid registration details and a 10-digit Indian mobile number or an international number in +country-code format.'
    });
  }
  if (ADMIN_EMAIL && registration.email === ADMIN_EMAIL) {
    return res.status(403).json({ error: 'This email is reserved for the administrator account.' });
  }

  try {
    const existing = await db.collection('users').where('email', '==', registration.email).limit(1).get();
    if (!existing.empty) return res.status(409).json({ error: 'An account with this email already exists.' });

    const { password: registrationPassword, smsNumber, ...pendingRegistration } = registration;
    const passwordHash = await bcrypt.hash(registrationPassword, 12);
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = registrationOtpHash(registration.email, otp);
    const now = Date.now();
    const pendingRef = db.collection('pendingRegistrations').doc(emailDocumentId(registration.email));
    const emailRef = db.collection('userEmails').doc(emailDocumentId(registration.email));
    const transactionResult = await db.runTransaction(async (transaction) => {
      const [pendingSnapshot, emailSnapshot] = await Promise.all([
        transaction.get(pendingRef),
        transaction.get(emailRef)
      ]);
      if (emailSnapshot.exists) {
        if (pendingSnapshot.exists) transaction.delete(pendingRef);
        return { status: 'duplicate' };
      }
      if (pendingSnapshot.exists) {
        const retryAt = (pendingSnapshot.data().lastSentAt || 0) + REGISTRATION_OTP_RESEND_MS;
        if (retryAt > now) return { status: 'cooldown', retryAfterSeconds: Math.ceil((retryAt - now) / 1000) };
      }
      transaction.set(pendingRef, {
        ...pendingRegistration,
        passwordHash,
        otpHash,
        attempts: 0,
        createdAt: now,
        expiresAt: now + REGISTRATION_OTP_TTL_MS,
        lastSentAt: now
      });
      return { status: 'sent' };
    });
    if (transactionResult.status === 'duplicate') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    if (transactionResult.status === 'cooldown') {
      return res.status(429).json({
        error: `Please wait ${transactionResult.retryAfterSeconds} seconds before requesting another code.`
      });
    }

    const deliveryResults = await Promise.allSettled([
      mailTransport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: registration.email,
        subject: 'Your Digital Vistara verification code',
        text: `Hello ${registration.name},\n\nYour Digital Vistara verification code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.\n\nIf you did not request this code, you can ignore this email.`
      }),
      sendRegistrationSms(
        sms,
        smsNumber,
        `Your Digital Vistara verification code is ${otp}. It expires in 10 minutes. Do not share it with anyone.`
      )
    ]);
    const failedDeliveries = deliveryResults
      .map((result, index) => ({ result, channel: index === 0 ? 'email' : 'SMS' }))
      .filter(({ result }) => result.status === 'rejected');
    if (failedDeliveries.length) {
      for (const { result, channel } of failedDeliveries) {
        console.error(`Registration OTP ${channel} delivery failed:`, result.reason?.message || 'Unknown delivery error');
      }
      await db.runTransaction(async (transaction) => {
        const pendingSnapshot = await transaction.get(pendingRef);
        if (pendingSnapshot.exists && pendingSnapshot.data().otpHash === otpHash) {
          transaction.delete(pendingRef);
        }
      });
      return res.status(502).json({
        error: 'Could not deliver the verification code to both email and mobile. Check the email and SMS service settings and try again.'
      });
    }

    res.status(200).json({
      message: `A verification code was sent to your email and mobile ending in ${smsNumber.slice(-4)}.`
    });
  } catch (error) {
    console.error('Registration verification request failed:', error.message);
    res.status(500).json({ error: 'Could not start registration. Please try again.' });
  }
});

app.post('/api/auth/register/verify-otp', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Firebase is not configured on the server.' });
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'Enter the email address and the 6-digit verification code.' });
  }

  try {
    const pendingRef = db.collection('pendingRegistrations').doc(emailDocumentId(email));
    const transactionResult = await db.runTransaction(async (transaction) => {
      const pendingSnapshot = await transaction.get(pendingRef);
      if (!pendingSnapshot.exists) return { status: 'missing' };

      const pending = pendingSnapshot.data();
      const now = Date.now();
      if (pending.expiresAt <= now) {
        transaction.delete(pendingRef);
        return { status: 'expired' };
      }
      if (pending.attempts >= REGISTRATION_OTP_MAX_ATTEMPTS) return { status: 'locked' };

      const submittedHash = Buffer.from(registrationOtpHash(email, otp), 'hex');
      const expectedHash = Buffer.from(pending.otpHash, 'hex');
      if (submittedHash.length !== expectedHash.length || !crypto.timingSafeEqual(submittedHash, expectedHash)) {
        transaction.update(pendingRef, { attempts: pending.attempts + 1 });
        return { status: 'invalid' };
      }

      const emailRef = db.collection('userEmails').doc(emailDocumentId(email));
      const emailSnapshot = await transaction.get(emailRef);
      if (emailSnapshot.exists) {
        transaction.delete(pendingRef);
        return { status: 'duplicate' };
      }

      const userRef = db.collection('users').doc();
      const user = {
        id: userRef.id,
        name: pending.name,
        email,
        mobile: pending.mobile,
        role: pending.role,
        city: pending.city,
        avatar: '',
        favorites: [],
        emailVerified: true,
        createdAt: new Date().toISOString(),
        passwordHash: pending.passwordHash
      };
      transaction.create(userRef, user);
      transaction.create(emailRef, { email, userId: userRef.id });
      if (user.role === 'provider') {
        const providerRef = db.collection('providers').doc(`provider-${userRef.id}`);
        transaction.create(providerRef, createProviderProfile(user, pending.category));
      }
      transaction.delete(pendingRef);
      return { status: 'created', user };
    });

    if (transactionResult.status === 'missing') {
      return res.status(400).json({ error: 'No active verification code was found. Request a new code.' });
    }
    if (transactionResult.status === 'expired') {
      return res.status(400).json({ error: 'The verification code expired. Request a new code.' });
    }
    if (transactionResult.status === 'locked') {
      return res.status(429).json({ error: 'Too many incorrect codes. Request a new code and try again.' });
    }
    if (transactionResult.status === 'invalid') {
      return res.status(400).json({ error: 'That verification code is incorrect.' });
    }
    if (transactionResult.status === 'duplicate') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const { user } = transactionResult;
    res.status(201).json({ user: publicUser(user), token: signUserToken(user) });
  } catch (error) {
    console.error('Registration OTP verification failed:', error.message);
    res.status(500).json({ error: 'Could not verify your email. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Firebase is not configured on the server.' });

  const normalizedEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (!normalizedEmail || typeof password !== 'string') {
    return res.status(400).json({ error: 'Enter your email and password.' });
  }

  try {
    const snapshot = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();
    if (snapshot.empty) return res.status(401).json({ error: 'Email or password is incorrect.' });

    const user = documentData(snapshot.docs[0]);
    if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    if (user.role === 'admin' && !isAuthorizedAdmin(user)) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    res.json({ user: publicUser(user), token: signUserToken(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(500).json({ error: 'Could not sign in. Please try again.' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get('/api/catalog', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Firebase is not configured on the server.' });
  try {
    const [categories, services, providers, reviews] = await Promise.all([
      listCollection('categories'), listCollection('services'), listCollection('providers'), listCollection('reviews')
    ]);
    res.json({ categories, services, providers, reviews });
  } catch (error) {
    console.error('Catalog load failed:', error.message);
    res.status(500).json({ error: 'Could not load the service catalog.' });
  }
});

app.get('/api/app-data', requireAuth, async (req, res) => {
  try {
    const [allBookings, allComplaints, allNotifications, allMessages, reviews, providers, platformSettings] = await Promise.all([
      listCollection('bookings'), listCollection('complaints'), listCollection('notifications'),
      listCollection('messages'), listCollection('reviews'), listCollection('providers'),
      db.collection('settings').doc('platform').get()
    ]);
    const provider = providers.find((item) => item.userId === req.user.id);
    const bookings = req.user.role === 'admin'
      ? allBookings
      : allBookings.filter((booking) => booking.customerId === req.user.id || booking.providerId === provider?.id);
    const bookingIds = new Set(bookings.map((booking) => booking.id));
    const complaints = req.user.role === 'admin'
      ? allComplaints
      : allComplaints.filter((complaint) => complaint.customerId === req.user.id);
    const notifications = req.user.role === 'admin'
      ? allNotifications
      : allNotifications.filter((notification) => notification.userId === req.user.id);
    const messages = allMessages.filter((message) => bookingIds.has(message.bookingId));

    res.json({
      bookings,
      complaints,
      notifications,
      messages,
      reviews,
      providers: req.user.role === 'admin' ? providers : providers.filter((item) => item.userId === req.user.id),
      favorites: req.user.favorites || [],
      commissionPercentage: Number(platformSettings.data()?.commissionPercentage ?? 10)
    });
  } catch (error) {
    console.error('App data load failed:', error.message);
    res.status(500).json({ error: 'Could not load your account data.' });
  }
});

app.get('/api/admin/records', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const [storedUsers, storedPayments, bookings, providers] = await Promise.all([
      listCollection('users'),
      listCollection('payments'),
      listCollection('bookings'),
      listCollection('providers')
    ]);

    const users = storedUsers.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role: user.role || 'customer',
      city: user.city || '',
      createdAt: user.createdAt || ''
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const usersById = new Map(users.map((user) => [user.id, user]));
    const providersById = new Map(providers.map((provider) => [provider.id, provider]));
    const bookingsByPaymentId = new Map(
      bookings.filter((booking) => booking.paymentId).map((booking) => [booking.paymentId, booking])
    );
    const paymentIds = new Set(storedPayments.map((payment) => payment.id));

    const transactions = [
      ...storedPayments.map((payment) => {
        const booking = bookingsByPaymentId.get(payment.id);
        const customer = usersById.get(payment.customerId);
        const provider = providersById.get(payment.providerId);
        return {
          id: payment.id,
          orderId: payment.orderId || '',
          bookingCode: booking?.bookingCode || '',
          customerName: customer?.name || booking?.customerName || '',
          customerEmail: customer?.email || booking?.customerEmail || '',
          providerName: provider?.name || booking?.providerName || '',
          serviceName: payment.serviceName || booking?.serviceName || '',
          amountRupees: Number(payment.amountRupees ?? Number(payment.amountPaise || 0) / 100),
          currency: payment.currency || 'INR',
          method: payment.method || booking?.paymentMethod || 'Other',
          status: payment.status || 'UNKNOWN',
          testMode: payment.testMode === true,
          bookingStatus: booking?.status || '',
          createdAt: payment.createdAt || booking?.createdAt || ''
        };
      }),
      ...bookings.filter((booking) => !booking.paymentId || !paymentIds.has(booking.paymentId)).map((booking) => ({
        id: booking.paymentId || `booking:${booking.id}`,
        orderId: '',
        bookingCode: booking.bookingCode || '',
        customerName: booking.customerName || '',
        customerEmail: booking.customerEmail || '',
        providerName: booking.providerName || '',
        serviceName: booking.serviceName || '',
        amountRupees: Number(booking.totalAmount || 0),
        currency: 'INR',
        method: booking.paymentMethod || 'Other',
        status: booking.paymentStatus || 'UNKNOWN',
        testMode: false,
        bookingStatus: booking.status || '',
        createdAt: booking.createdAt || ''
      }))
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({ users, transactions });
  } catch (error) {
    console.error('Admin records load failed:', error.message);
    res.status(500).json({ error: 'Could not load user and transaction records.' });
  }
});

app.post('/api/admin/providers', requireAuth, requireRole('admin'), async (req, res) => {
  const {
    name, email, mobile, password, city, categoryId, servicesOffered,
    qualification, experienceYears, startingPrice, serviceArea, bio
  } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedMobile = typeof mobile === 'string' ? mobile.trim() : '';
  const normalizedCity = typeof city === 'string' ? city.trim() : '';
  const years = Number(experienceYears);
  const price = Number(startingPrice);

  if (normalizedName.length < 2 || !/^\S+@\S+\.\S+$/.test(normalizedEmail)
      || typeof password !== 'string' || password.length < 12
      || normalizedMobile.length < 8 || !normalizedCity
      || !Number.isFinite(years) || years < 0 || years > 80
      || !Number.isFinite(price) || price <= 0
      || !Array.isArray(servicesOffered) || servicesOffered.length === 0
      || typeof categoryId !== 'string') {
    return res.status(400).json({ error: 'Provide valid provider details, a password of at least 12 characters, a category, services, experience, and a starting price.' });
  }
  if (ADMIN_EMAIL && normalizedEmail === ADMIN_EMAIL) {
    return res.status(403).json({ error: 'This email is reserved for the administrator account.' });
  }

  try {
    const [categorySnapshot, matchingServices] = await Promise.all([
      db.collection('categories').doc(categoryId).get(),
      listCollection('services')
    ]);
    if (!categorySnapshot.exists) return res.status(400).json({ error: 'Choose an existing category.' });
    const category = documentData(categorySnapshot);
    const selectedServices = [...new Set(servicesOffered.filter((service) => typeof service === 'string'))];
    const availableServices = new Set(
      matchingServices.filter((service) => service.categoryId === categoryId).map((service) => service.name)
    );
    if (selectedServices.length !== servicesOffered.length
        || selectedServices.some((service) => !availableServices.has(service))) {
      return res.status(400).json({ error: 'Choose services that belong to the selected category.' });
    }

    const userRef = db.collection('users').doc();
    const emailRef = db.collection('userEmails')
      .doc(crypto.createHash('sha256').update(normalizedEmail).digest('hex'));
    const providerRef = db.collection('providers').doc(`provider-${userRef.id}`);
    const now = new Date().toISOString();
    const user = {
      id: userRef.id,
      name: normalizedName,
      email: normalizedEmail,
      mobile: normalizedMobile,
      role: 'provider',
      city: normalizedCity,
      avatar: '',
      favorites: [],
      createdAt: now,
      passwordHash: await bcrypt.hash(password, 12)
    };
    const provider = {
      id: providerRef.id,
      userId: userRef.id,
      name: normalizedName,
      email: normalizedEmail,
      mobile: normalizedMobile,
      avatar: '',
      category: category.name,
      servicesOffered: selectedServices,
      skills: selectedServices,
      qualification: typeof qualification === 'string' ? qualification.trim() : '',
      experienceYears: years,
      city: normalizedCity,
      serviceArea: typeof serviceArea === 'string' && serviceArea.trim() ? serviceArea.trim() : normalizedCity,
      maxRadiusKm: 10,
      hourlyRate: price,
      startingPrice: price,
      verificationStatus: 'PENDING',
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      bio: typeof bio === 'string' ? bio.trim() : '',
      availabilityDays: [],
      availableToday: false,
      responseTimeMinutes: 60,
      portfolio: [],
      createdAt: now
    };

    await db.runTransaction(async (transaction) => {
      const emailSnapshot = await transaction.get(emailRef);
      if (emailSnapshot.exists) {
        const duplicateError = new Error('An account with this email already exists.');
        duplicateError.code = 'ACCOUNT_EXISTS';
        throw duplicateError;
      }
      transaction.create(userRef, user);
      transaction.create(emailRef, { email: normalizedEmail, userId: userRef.id });
      transaction.create(providerRef, provider);
    });
    res.status(201).json({ provider });
  } catch (error) {
    if (error.code === 'ACCOUNT_EXISTS') return res.status(409).json({ error: error.message });
    console.error('Provider account creation failed:', error.message);
    res.status(500).json({ error: 'Could not create this provider account.' });
  }
});

const notifyUser = async (userId, title, message, link, type = 'booking') => {
  const ref = db.collection('notifications').doc();
  await ref.set({
    id: ref.id, userId, title, message, link, type, isRead: false,
    timestamp: new Date().toISOString()
  });
};

app.post('/api/bookings', requireAuth, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers can create bookings.' });
  const { providerId, serviceName, date, timeSlot, address, city, pincode, requirements, paymentId, paymentMethod, paymentStatus } = req.body;

  if (![providerId, serviceName, date, timeSlot, address, city, pincode].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Complete all required booking details.' });
  }

  try {
    const providerSnapshot = await db.collection('providers').doc(providerId).get();
    if (!providerSnapshot.exists) return res.status(404).json({ error: 'Professional not found.' });
    const provider = documentData(providerSnapshot);
    if (!provider.servicesOffered.includes(serviceName) || !provider.startingPrice) {
      return res.status(400).json({ error: 'This service is not currently bookable.' });
    }

    const price = Number(provider.startingPrice);
    const commissionSnapshot = await db.collection('settings').doc('platform').get();
    const commissionPercentage = Number(commissionSnapshot.data()?.commissionPercentage ?? 10);
    const commissionAmount = Number(((price * commissionPercentage) / 100).toFixed(2));
    const isPayAfterService = paymentMethod === 'PayAfterService' && paymentStatus === 'PENDING';

    if (!isPayAfterService) {
      const paymentSnapshot = paymentId ? await db.collection('payments').doc(paymentId).get() : null;
      const payment = paymentSnapshot?.data();
      if (!paymentSnapshot?.exists || payment.status !== 'CAPTURED' || payment.customerId !== req.user.id
        || payment.providerId !== providerId || payment.serviceName !== serviceName || payment.amountRupees !== price) {
        return res.status(402).json({ error: 'A verified payment is required before this booking can be confirmed.' });
      }
    }

    const now = new Date().toISOString();
    const bookingRef = req.body.id ? db.collection('bookings').doc(String(req.body.id)) : db.collection('bookings').doc();
    const booking = {
      id: bookingRef.id,
      bookingCode: `DV-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`,
      customerId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerMobile: req.user.mobile,
      providerId,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      providerCategory: provider.category,
      serviceId: 'srv-custom',
      serviceName,
      date,
      timeSlot,
      address,
      city,
      pincode,
      requirements: typeof requirements === 'string' ? requirements : '',
      totalAmount: price,
      commissionPercentage,
      commissionAmount,
      providerEarnings: Number((price - commissionAmount).toFixed(2)),
      paymentId: isPayAfterService ? undefined : paymentId,
      paymentMethod: isPayAfterService ? 'PayAfterService' : paymentMethod,
      paymentStatus: isPayAfterService ? 'PENDING' : 'PAID',
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      statusLogs: [{ status: 'PENDING', timestamp: now, note: 'Booking submitted by customer' }]
    };
    const notificationRef = db.collection('notifications').doc();

    await db.runTransaction(async (transaction) => {
      transaction.create(bookingRef, booking);
      transaction.create(notificationRef, {
        id: notificationRef.id,
        userId: provider.userId,
        title: 'New Booking Request',
        message: `${req.user.name} requested ${serviceName} on ${date}.`,
        link: `/provider/booking/${booking.id}`,
        type: 'booking',
        isRead: false,
        timestamp: now
      });
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation failed:', error.message);
    res.status(500).json({ error: 'Could not create the booking.' });
  }
});

app.patch('/api/bookings/:id/status', requireAuth, async (req, res) => {
  const { status, note } = req.body;
  const allowedStatuses = ['ACCEPTED', 'CONFIRMED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'];
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid booking status.' });

  try {
    const bookingRef = db.collection('bookings').doc(req.params.id);
    const bookingSnapshot = await bookingRef.get();
    if (!bookingSnapshot.exists) return res.status(404).json({ error: 'Booking not found.' });
    const booking = documentData(bookingSnapshot);
    const providerSnapshot = await db.collection('providers').where('userId', '==', req.user.id).limit(1).get();
    const isBookingProvider = !providerSnapshot.empty && providerSnapshot.docs[0].id === booking.providerId;
    if (req.user.role !== 'admin' && !isBookingProvider) return res.status(403).json({ error: 'Only the assigned professional or an admin can update this booking.' });

    const now = new Date().toISOString();
    const statusLog = { status, timestamp: now, note: typeof note === 'string' ? note : `Status updated to ${status}` };
    await bookingRef.update({ status, updatedAt: now, statusLogs: [...(booking.statusLogs || []), statusLog] });
    await notifyUser(booking.customerId, `Booking ${status.replace('_', ' ')}`, `Your ${booking.serviceName} booking is now ${status.toLowerCase()}.`, `/customer/booking/${booking.id}`);
    res.json({ ...booking, status, updatedAt: now, statusLogs: [...(booking.statusLogs || []), statusLog] });
  } catch (error) {
    console.error('Booking status update failed:', error.message);
    res.status(500).json({ error: 'Could not update this booking.' });
  }
});

app.post('/api/reviews', requireAuth, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers can write reviews.' });
  const { bookingId, rating, qualityRating, professionalismRating, timelinessRating, comment } = req.body;
  if (!bookingId || !Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ error: 'Provide a booking, a 1-5 rating, and a review.' });
  }

  try {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnapshot = await bookingRef.get();
    if (!bookingSnapshot.exists) return res.status(404).json({ error: 'Booking not found.' });
    const booking = documentData(bookingSnapshot);
    if (booking.customerId !== req.user.id || booking.status !== 'COMPLETED') {
      return res.status(403).json({ error: 'Reviews are available only for your completed bookings.' });
    }
    const existing = await db.collection('reviews').where('bookingId', '==', bookingId).limit(1).get();
    if (!existing.empty) return res.status(409).json({ error: 'This booking already has a review.' });

    const providerRef = db.collection('providers').doc(booking.providerId);
    const providerSnapshot = await providerRef.get();
    if (!providerSnapshot.exists) return res.status(404).json({ error: 'Professional not found.' });
    const provider = documentData(providerSnapshot);
    const count = Number(provider.reviewCount || 0);
    const newCount = count + 1;
    const newRating = Number((((provider.rating || 0) * count + rating) / newCount).toFixed(2));
    const reviewRef = db.collection('reviews').doc();
    const review = {
      id: reviewRef.id, bookingId, providerId: booking.providerId, customerId: req.user.id,
      customerName: req.user.name, rating,
      qualityRating: Number(qualityRating) || rating,
      professionalismRating: Number(professionalismRating) || rating,
      timelinessRating: Number(timelinessRating) || rating,
      comment: comment.trim(), createdAt: new Date().toISOString()
    };
    const batch = db.batch();
    batch.set(reviewRef, review);
    batch.update(providerRef, { rating: newRating, reviewCount: newCount });
    await batch.commit();
    res.status(201).json(review);
  } catch (error) {
    console.error('Review creation failed:', error.message);
    res.status(500).json({ error: 'Could not save this review.' });
  }
});

app.post('/api/complaints', requireAuth, async (req, res) => {
  const { bookingId, category, description, expectedResolution } = req.body;
  if (!bookingId || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Provide a booking and describe the issue.' });
  }

  try {
    const bookingSnapshot = await db.collection('bookings').doc(bookingId).get();
    if (!bookingSnapshot.exists) return res.status(404).json({ error: 'Booking not found.' });
    const booking = documentData(bookingSnapshot);
    if (req.user.role !== 'admin' && booking.customerId !== req.user.id) return res.status(403).json({ error: 'You can only report an issue on your own booking.' });
    const ref = db.collection('complaints').doc();
    const complaint = {
      id: ref.id, bookingId, customerId: booking.customerId, customerName: booking.customerName,
      providerId: booking.providerId, providerName: booking.providerName,
      category: typeof category === 'string' ? category : 'Other', description: description.trim(),
      expectedResolution: typeof expectedResolution === 'string' ? expectedResolution : '',
      status: 'OPEN', createdAt: new Date().toISOString()
    };
    await ref.set(complaint);
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Complaint creation failed:', error.message);
    res.status(500).json({ error: 'Could not submit this issue.' });
  }
});

app.patch('/api/complaints/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status, adminNotes } = req.body;
  if (!['UNDER_REVIEW', 'RESOLVED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Invalid complaint status.' });
  try {
    const ref = db.collection('complaints').doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Issue not found.' });
    await ref.update({ status, adminNotes: typeof adminNotes === 'string' ? adminNotes : '' });
    res.json({ ...documentData(snapshot), status, adminNotes });
  } catch (error) {
    console.error('Complaint update failed:', error.message);
    res.status(500).json({ error: 'Could not update this issue.' });
  }
});

app.post('/api/messages', requireAuth, async (req, res) => {
  const { bookingId, text, imageUrl } = req.body;
  if (!bookingId || typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'Write a message first.' });
  try {
    const bookingSnapshot = await db.collection('bookings').doc(bookingId).get();
    if (!bookingSnapshot.exists) return res.status(404).json({ error: 'Booking not found.' });
    const booking = documentData(bookingSnapshot);
    const providerSnapshot = await db.collection('providers').doc(booking.providerId).get();
    const providerUserId = providerSnapshot.data()?.userId;
    if (![booking.customerId, providerUserId].includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only people on this booking can message.' });
    }
    const ref = db.collection('messages').doc();
    const message = {
      id: ref.id, bookingId, senderId: req.user.id, senderRole: req.user.role,
      senderName: req.user.name, text: text.trim(), imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
      timestamp: new Date().toISOString(), isRead: false
    };
    await ref.set(message);
    const recipientId = req.user.id === booking.customerId ? providerUserId : booking.customerId;
    if (recipientId) await notifyUser(recipientId, 'New booking message', `${req.user.name} sent you a message.`, `/customer/booking/${bookingId}`, 'system');
    io.to(bookingId).emit('receive_chat_message', message);
    res.status(201).json(message);
  } catch (error) {
    console.error('Message send failed:', error.message);
    res.status(500).json({ error: 'Could not send this message.' });
  }
});

app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('notifications').doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Notification not found.' });
    if (snapshot.data().userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your notification.' });
    await ref.update({ isRead: true });
    res.json({ id: req.params.id, isRead: true });
  } catch (error) {
    console.error('Notification update failed:', error.message);
    res.status(500).json({ error: 'Could not update this notification.' });
  }
});

app.patch('/api/users/me/favorites', requireAuth, async (req, res) => {
  const { favorites } = req.body;
  if (!Array.isArray(favorites) || favorites.some((id) => typeof id !== 'string')) {
    return res.status(400).json({ error: 'Favorites must be a list of provider IDs.' });
  }
  try {
    await db.collection('users').doc(req.user.id).update({ favorites: [...new Set(favorites)] });
    res.json({ favorites: [...new Set(favorites)] });
  } catch (error) {
    console.error('Favorites update failed:', error.message);
    res.status(500).json({ error: 'Could not save favorites.' });
  }
});

app.patch('/api/providers/:id', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('providers').doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Professional profile not found.' });
    const provider = documentData(snapshot);
    const isOwner = provider.userId === req.user.id;
    if (req.user.role !== 'admin' && !(req.user.role === 'provider' && isOwner)) {
      return res.status(403).json({ error: 'You cannot edit this professional profile.' });
    }

    const allowedFields = [
      'name', 'mobile', 'avatar', 'category', 'servicesOffered', 'skills', 'qualification',
      'experienceYears', 'city', 'serviceArea', 'maxRadiusKm', 'hourlyRate', 'startingPrice',
      'bio', 'availabilityDays', 'availableToday', 'responseTimeMinutes', 'portfolio'
    ];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (req.user.role === 'admin' && ['VERIFIED', 'REJECTED', 'SUSPENDED', 'UNDER_REVIEW', 'PENDING'].includes(req.body.verificationStatus)) {
      updates.verificationStatus = req.body.verificationStatus;
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No editable profile fields were provided.' });
    await ref.update(updates);
    res.json({ ...provider, ...updates });
  } catch (error) {
    console.error('Provider update failed:', error.message);
    res.status(500).json({ error: 'Could not save this profile.' });
  }
});

app.post('/api/services', requireAuth, requireRole('admin'), async (req, res) => {
  const { categoryId, name, description, priceStartingFrom, unit, estimatedDuration, features, image, popular } = req.body || {};
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const price = Number(priceStartingFrom);
  if (typeof categoryId !== 'string' || !normalizedName || typeof description !== 'string'
      || !Number.isFinite(price) || price <= 0 || typeof unit !== 'string' || !unit.trim()
      || typeof estimatedDuration !== 'string' || !estimatedDuration.trim()) {
    return res.status(400).json({ error: 'Provide a category, service name, description, positive price, unit, and duration.' });
  }
  try {
    const categoryRef = db.collection('categories').doc(categoryId);
    const categorySnapshot = await categoryRef.get();
    if (!categorySnapshot.exists) return res.status(400).json({ error: 'Choose an existing category.' });
    const category = documentData(categorySnapshot);
    const ref = db.collection('services').doc();
    const service = {
      id: ref.id,
      categoryId,
      categoryName: category.name,
      name: normalizedName,
      slug: normalizedName.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: description.trim(),
      priceStartingFrom: price,
      unit: unit.trim(),
      estimatedDuration: estimatedDuration.trim(),
      features: Array.isArray(features) ? features.filter((feature) => typeof feature === 'string').map((feature) => feature.trim()).filter(Boolean) : [],
      image: typeof image === 'string' ? image.trim() : '',
      popular: popular === true
    };
    await db.runTransaction(async (transaction) => {
      transaction.create(ref, service);
      transaction.update(categoryRef, {
        subServices: [...new Set([...(category.subServices || []), normalizedName])],
        popularServices: [...new Set([...(category.popularServices || []), normalizedName])]
      });
    });
    res.status(201).json(service);
  } catch (error) {
    console.error('Service creation failed:', error.message);
    res.status(500).json({ error: 'Could not create this service.' });
  }
});

app.patch('/api/services/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const ref = db.collection('services').doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Service not found.' });
    await ref.update(req.body);
    res.json({ ...documentData(snapshot), ...req.body });
  } catch (error) {
    console.error('Service update failed:', error.message);
    res.status(500).json({ error: 'Could not update this service.' });
  }
});

app.delete('/api/services/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('services').doc(req.params.id).delete();
    res.status(204).end();
  } catch (error) {
    console.error('Service deletion failed:', error.message);
    res.status(500).json({ error: 'Could not delete this service.' });
  }
});

app.patch('/api/categories/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const ref = db.collection('categories').doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Category not found.' });
    await ref.update(req.body);
    res.json({ ...documentData(snapshot), ...req.body });
  } catch (error) {
    console.error('Category update failed:', error.message);
    res.status(500).json({ error: 'Could not update this category.' });
  }
});

app.post('/api/categories', requireAuth, requireRole('admin'), async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  const slug = typeof req.body?.slug === 'string' ? req.body.slug.trim().toLowerCase() : '';
  if (name.length < 2 || !description || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({ error: 'Provide a category name, description, and valid URL slug.' });
  }
  try {
    const existing = await db.collection('categories').where('slug', '==', slug).limit(1).get();
    if (!existing.empty) return res.status(409).json({ error: 'A category with this URL slug already exists.' });
    const ref = db.collection('categories').doc(`cat-${slug}`);
    const category = {
      id: ref.id,
      name,
      slug,
      description,
      iconName: typeof req.body.iconName === 'string' ? req.body.iconName.trim() : 'Layers',
      popularServices: [],
      subServices: [],
      bannerImage: typeof req.body.bannerImage === 'string' ? req.body.bannerImage.trim() : ''
    };
    await ref.create(category);
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 6) return res.status(409).json({ error: 'A category with this URL slug already exists.' });
    console.error('Category creation failed:', error.message);
    res.status(500).json({ error: 'Could not create this category.' });
  }
});

app.patch('/api/settings/platform', requireAuth, requireRole('admin'), async (req, res) => {
  const rate = Number(req.body.commissionPercentage);
  if (!Number.isFinite(rate) || rate < 0 || rate > 50) return res.status(400).json({ error: 'Commission must be between 0 and 50 percent.' });
  try {
    await db.collection('settings').doc('platform').set({ commissionPercentage: rate }, { merge: true });
    res.json({ commissionPercentage: rate });
  } catch (error) {
    console.error('Platform settings update failed:', error.message);
    res.status(500).json({ error: 'Could not update platform settings.' });
  }
});

app.post('/api/payments/orders', ...(isFirebaseConfigured ? [requireAuth] : []), async (req, res) => {
  const { providerId, serviceName } = req.body;
  if (typeof providerId !== 'string' || typeof serviceName !== 'string') {
    return res.status(400).json({ error: 'Choose a valid service and professional.' });
  }

  if (!USE_MOCK_PAYMENTS && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) {
    return res.status(503).json({ error: 'Payments are not configured. Add Razorpay test keys to server/.env.' });
  }

  try {
    let provider;
    if (db) {
      const providerSnapshot = await db.collection('providers').doc(providerId).get();
      if (providerSnapshot.exists) {
        const providerData = providerSnapshot.data();
        provider = { price: Number(providerData.startingPrice), services: providerData.servicesOffered || [] };
      }
    } else if (Object.prototype.hasOwnProperty.call(PAYMENT_CATALOG, providerId)) {
      provider = PAYMENT_CATALOG[providerId];
    }

    if (!provider || !provider.services.includes(serviceName) || !Number.isFinite(provider.price) || provider.price <= 0) {
      return res.status(400).json({ error: 'Choose a valid service and professional.' });
    }

    const now = Date.now();
    for (const [orderId, order] of pendingPaymentOrders) {
      if (now - order.createdAt > 30 * 60 * 1000) pendingPaymentOrders.delete(orderId);
    }

    const amount = provider.price * 100;
    if (USE_MOCK_PAYMENTS) {
      const id = `order_test_${crypto.randomBytes(8).toString('hex')}`;
      const testPaymentId = `pay_test_${crypto.randomBytes(8).toString('hex')}`;
      const testToken = crypto.randomBytes(32).toString('hex');
      pendingPaymentOrders.set(id, {
        amount, providerId, serviceName, customerId: req.user?.id,
        createdAt: now, mode: 'mock', testPaymentId, testToken
      });
      return res.json({ id, amount, currency: 'INR', mode: 'mock', testPaymentId, testToken });
    }

    const order = await getRazorpayClient().orders.create({
      amount,
      currency: 'INR',
      receipt: `dv_${now}_${crypto.randomBytes(3).toString('hex')}`,
      notes: { providerId, serviceName }
    });

    pendingPaymentOrders.set(order.id, {
      amount, providerId, serviceName, customerId: req.user?.id, createdAt: now, mode: 'razorpay'
    });
    res.json({ id: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, mode: 'razorpay' });
  } catch (error) {
    console.error('Razorpay order creation failed:', error.message);
    res.status(502).json({ error: 'Could not start checkout. Please try again.' });
  }
});

app.post('/api/payments/verify', ...(isFirebaseConfigured ? [requireAuth] : []), async (req, res) => {
  const { mode, orderId: mockOrderId, paymentId: mockPaymentId, testToken } = req.body;

  if (mode === 'mock') {
    if (!USE_MOCK_PAYMENTS) {
      return res.status(403).json({ error: 'Simulated payments are only available in development.' });
    }

    const pendingOrder = pendingPaymentOrders.get(mockOrderId);
    if (!pendingOrder || pendingOrder.mode !== 'mock' || pendingOrder.testPaymentId !== mockPaymentId) {
      return res.status(400).json({ error: 'Test payment details are invalid or the order has expired.' });
    }
    if (db && pendingOrder.customerId !== req.user?.id) {
      return res.status(403).json({ error: 'This test payment belongs to another account.' });
    }

    if (Date.now() - pendingOrder.createdAt > 30 * 60 * 1000) {
      pendingPaymentOrders.delete(mockOrderId);
      return res.status(400).json({ error: 'This test checkout has expired. Start a new payment.' });
    }

    const expectedToken = Buffer.from(pendingOrder.testToken, 'hex');
    const receivedToken = Buffer.from(typeof testToken === 'string' ? testToken : '', 'hex');
    if (receivedToken.length !== expectedToken.length || !crypto.timingSafeEqual(receivedToken, expectedToken)) {
      return res.status(400).json({ error: 'Test payment could not be verified.' });
    }

    if (db) {
      await db.collection('payments').doc(mockPaymentId).set({
        id: mockPaymentId,
        orderId: mockOrderId,
        customerId: pendingOrder.customerId || req.user?.id,
        providerId: pendingOrder.providerId,
        serviceName: pendingOrder.serviceName,
        amountPaise: pendingOrder.amount,
        amountRupees: pendingOrder.amount / 100,
        currency: 'INR',
        method: 'upi',
        status: 'CAPTURED',
        testMode: true,
        createdAt: new Date().toISOString()
      });
    }

    pendingPaymentOrders.delete(mockOrderId);
    return res.json({
      verified: true,
      testMode: true,
      paymentId: mockPaymentId,
      amount: pendingOrder.amount,
      paymentMethod: 'UPI',
      providerId: pendingOrder.providerId,
      serviceName: pendingOrder.serviceName
    });
  }

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;

  if ([orderId, paymentId, signature].some((value) => typeof value !== 'string')) {
    return res.status(400).json({ error: 'Payment details are missing or invalid.' });
  }

  const pendingOrder = pendingPaymentOrders.get(orderId);

  if (!pendingOrder) {
    return res.status(400).json({ error: 'Payment details are missing or the order has expired.' });
  }
  if (db && pendingOrder.customerId !== req.user?.id) {
    return res.status(403).json({ error: 'This payment belongs to another account.' });
  }

  if (Date.now() - pendingOrder.createdAt > 30 * 60 * 1000) {
    pendingPaymentOrders.delete(orderId);
    return res.status(400).json({ error: 'This checkout has expired. Start a new payment.' });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Payment verification is not configured on the server.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const receivedSignature = Buffer.from(signature, 'hex');

  if (receivedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(receivedSignature, expectedSignature)) {
    return res.status(400).json({ error: 'Payment signature could not be verified.' });
  }

  try {
    const razorpay = getRazorpayClient();
    let payment = await razorpay.payments.fetch(paymentId);

    if (payment.order_id !== orderId || payment.amount !== pendingOrder.amount || payment.currency !== 'INR') {
      return res.status(400).json({ error: 'The payment does not match this booking.' });
    }

    if (payment.status === 'authorized') {
      payment = await razorpay.payments.capture(paymentId, pendingOrder.amount, 'INR');
    }

    if (payment.status !== 'captured') {
      return res.status(409).json({ error: 'Payment has not been captured. Please contact support before retrying.' });
    }

    if (db) {
      await db.collection('payments').doc(payment.id).set({
        id: payment.id,
        orderId,
        customerId: pendingOrder.customerId || req.user?.id,
        providerId: pendingOrder.providerId,
        serviceName: pendingOrder.serviceName,
        amountPaise: payment.amount,
        amountRupees: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        status: 'CAPTURED',
        testMode: false,
        createdAt: new Date().toISOString()
      });
    }

    pendingPaymentOrders.delete(orderId);
    const paymentMethods = { upi: 'UPI', card: 'Card', netbanking: 'NetBanking', wallet: 'Wallet' };
    res.json({
      verified: true,
      paymentId: payment.id,
      amount: payment.amount,
      paymentMethod: Object.hasOwn(paymentMethods, payment.method) ? paymentMethods[payment.method] : 'Other',
      providerId: pendingOrder.providerId,
      serviceName: pendingOrder.serviceName
    });
  } catch (error) {
    console.error('Razorpay payment verification failed:', error.message);
    res.status(502).json({ error: 'Could not verify payment with Razorpay. Please contact support.' });
  }
});

// Categories & Services Routes
app.get('/api/categories', async (req, res) => {
  try {
    res.json(await listCollection('categories'));
  } catch (error) {
    console.error('Category list failed:', error.message);
    res.status(500).json({ error: 'Could not load categories.' });
  }
});

// Real-Time Socket.io Connection
io.on('connection', (socket) => {
  console.log('Client connected to real-time socket:', socket.id);

  socket.on('join_booking_room', (bookingId) => {
    socket.join(bookingId);
    console.log(`Socket ${socket.id} joined booking room ${bookingId}`);
  });

  socket.on('send_chat_message', (data) => {
    io.to(data.bookingId).emit('receive_chat_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`DIGITAL VISTARA Backend API listening on port ${PORT}`);
  console.log(`"One Platform. Every Essential Service."`);
  console.log(`====================================================`);
});

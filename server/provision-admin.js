require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('./firebase');

const provisionAdmin = async () => {
  const email = typeof process.env.ADMIN_EMAIL === 'string'
    ? process.env.ADMIN_EMAIL.trim().toLowerCase()
    : '';
  const password = process.env.ADMIN_PASSWORD;
  const isLocalEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Set ADMIN_EMAIL to the administrator email in server/.env.');
  }
  if (isLocalEmulator && typeof password === 'string' && /^\d{8}$/.test(password)) {
    // An 8-digit PIN is permitted only for the local emulator at the owner's request.
  } else if (typeof password !== 'string' || password.length < 12) {
    throw new Error(isLocalEmulator
      ? 'Use exactly 8 digits for the local emulator password, or a password of at least 12 characters.'
      : 'Set ADMIN_PASSWORD to a unique password of at least 12 characters.');
  }
  if (!db) throw new Error('Firestore is not configured or available.');

  const existing = await db.collection('users').where('email', '==', email).limit(1).get();
  const userRef = existing.empty
    ? db.collection('users').doc()
    : existing.docs[0].ref;
  const current = existing.empty ? {} : existing.docs[0].data();
  const emailRef = db.collection('userEmails').doc(crypto.createHash('sha256').update(email).digest('hex'));
  const user = {
    ...current,
    id: userRef.id,
    name: current.name || process.env.ADMIN_NAME || email.split('@')[0],
    email,
    mobile: current.mobile || '',
    role: 'admin',
    city: current.city || '',
    avatar: current.avatar || '',
    favorites: current.favorites || [],
    createdAt: current.createdAt || new Date().toISOString(),
    passwordHash: await bcrypt.hash(password, 12),
    adminManaged: true
  };

  await db.runTransaction(async (transaction) => {
    const emailSnapshot = await transaction.get(emailRef);
    if (emailSnapshot.exists && emailSnapshot.data().userId !== userRef.id) {
      throw new Error('The admin email index points to a different account. Resolve that record before provisioning.');
    }
    transaction.set(userRef, user);
    transaction.set(emailRef, { email, userId: userRef.id });
  });

  console.log(`Administrator account provisioned for ${email}.`);
};

provisionAdmin().catch((error) => {
  console.error('Administrator provisioning failed:', error.message);
  process.exitCode = 1;
});

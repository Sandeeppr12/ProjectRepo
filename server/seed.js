require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('./firebase');

const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, clean(item)])
    );
  }
  return value;
};

const seed = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Refusing to seed demo accounts in production.');
  }
  if (!db) throw new Error('Firebase is not configured. Add Firebase Admin credentials to server/.env.');

  const {
    MOCK_USERS,
    MOCK_PROVIDERS,
    MOCK_CATEGORIES,
    MOCK_SERVICES,
    MOCK_BOOKINGS,
    MOCK_REVIEWS,
    MOCK_COMPLAINTS,
    MOCK_NOTIFICATIONS,
    MOCK_MESSAGES
  } = await import('../client/src/data/mockData.ts');

  const demoPasswordHash = await bcrypt.hash('password123', 12);
  const collections = {
    users: MOCK_USERS.map((user) => ({ ...user, passwordHash: demoPasswordHash })),
    providers: MOCK_PROVIDERS,
    categories: MOCK_CATEGORIES,
    services: MOCK_SERVICES,
    bookings: MOCK_BOOKINGS,
    reviews: MOCK_REVIEWS,
    complaints: MOCK_COMPLAINTS,
    notifications: MOCK_NOTIFICATIONS,
    messages: MOCK_MESSAGES
  };

  for (const [name, records] of Object.entries(collections)) {
    const collection = db.collection(name);
    const existing = await collection.limit(1).get();
    if (!existing.empty) {
      console.log(`Skipped ${name}; it already contains data.`);
      continue;
    }

    const batch = db.batch();
    records.forEach((record) => batch.set(collection.doc(String(record.id)), clean(record)));
    await batch.commit();
    console.log(`Seeded ${records.length} ${name}.`);
  }

  const platformSettings = db.collection('settings').doc('platform');
  const platformSnapshot = await platformSettings.get();
  if (!platformSnapshot.exists) await platformSettings.set({ commissionPercentage: 10 });
  console.log('Demo accounts use password: password123');
};

seed().catch((error) => {
  console.error('Firestore seeding failed:', error.message);
  process.exitCode = 1;
});
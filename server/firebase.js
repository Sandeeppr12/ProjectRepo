const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

let db = null;

if (emulatorHost && projectId) {
  if (!admin.apps.length) admin.initializeApp({ projectId });
  db = admin.firestore();
} else if (projectId && clientEmail && privateKey) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
  }
  db = admin.firestore();
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('Configure Firebase Admin credentials before starting production.');
}

if (db) db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db, isFirebaseConfigured: Boolean(db) };
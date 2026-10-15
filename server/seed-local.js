require('dotenv').config();

process.env.NODE_ENV = 'development';
process.env.FIREBASE_PROJECT_ID = 'demo-digital-vistara';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

require('./seed');
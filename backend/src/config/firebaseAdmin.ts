import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let isFirebaseInitialized = false;

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.log('ℹ️ Firebase credentials not provided, running in mock/demo fallback mode');
    }
  } catch (error) {
    console.warn('⚠️ Firebase Admin init error, falling back to mock mode:', error);
  }
}

export const adminAuth = isFirebaseInitialized ? admin.auth() : null;
export const adminDb = isFirebaseInitialized ? admin.firestore() : null;
export { isFirebaseInitialized };


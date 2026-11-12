const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS
    initializeApp();
  }
} catch (error) {
  console.warn('Firebase Admin initialization warning: Please ensure GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT is set.', error.message);
}

// Export the auth service and db
module.exports = {
  auth: getAuth,
  db: getFirestore
};

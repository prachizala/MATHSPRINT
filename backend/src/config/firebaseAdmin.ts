import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getDatabase, Database } from 'firebase-admin/database';
import { env } from './env';

let isFirebaseAdminInitialized = false;
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminFirestore: Firestore | null = null;
let adminRtdb: Database | null = null;

export const initFirebaseAdmin = () => {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    isFirebaseAdminInitialized = true;
    adminAuth = getAuth(adminApp);
    adminFirestore = getFirestore(adminApp);
    try {
      adminRtdb = getDatabase(adminApp);
    } catch {
      // RTDB optional
    }
    return;
  }

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
        databaseURL: env.FIREBASE_DATABASE_URL || `https://${env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
      });

      adminAuth = getAuth(adminApp);
      adminFirestore = getFirestore(adminApp);
      try {
        adminRtdb = getDatabase(adminApp);
      } catch (rtdbErr) {
        console.warn('[FirebaseAdmin] RTDB init warning:', rtdbErr);
      }

      isFirebaseAdminInitialized = true;
      console.log('🔥 [FirebaseAdmin] Connected to project:', env.FIREBASE_PROJECT_ID);
    } catch (err) {
      console.warn('[FirebaseAdmin] Initialization failed, falling back to development store:', err);
    }
  } else {
    console.log('ℹ️ [FirebaseAdmin] Running in development store mode. Set FIREBASE_* env vars to connect to live Firebase.');
  }
};

initFirebaseAdmin();

export { adminAuth, adminFirestore, adminRtdb, isFirebaseAdminInitialized };

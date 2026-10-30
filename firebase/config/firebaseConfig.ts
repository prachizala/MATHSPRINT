import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { config, isFirebaseConfigured } from '../../src/constants/config';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

export const initFirebase = () => {
  if (!isFirebaseConfigured()) {
    console.log('[Firebase] Running in mock/development mode. Configure .env with valid credentials for live Firebase sync.');
    return { app: null, auth: null, db: null, rtdb: null };
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config.firebase);
    } else {
      firebaseApp = getApp();
    }

    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    rtdb = getDatabase(firebaseApp);

    return { app: firebaseApp, auth, db, rtdb };
  } catch (error) {
    console.warn('[Firebase] Initialization warning:', error);
    return { app: null, auth: null, db: null, rtdb: null };
  }
};

const instances = initFirebase();

export { firebaseApp, auth, db, rtdb };

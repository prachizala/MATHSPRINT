"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseAdminInitialized = exports.adminRtdb = exports.adminFirestore = exports.adminAuth = exports.initFirebaseAdmin = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const database_1 = require("firebase-admin/database");
const env_1 = require("./env");
let isFirebaseAdminInitialized = false;
exports.isFirebaseAdminInitialized = isFirebaseAdminInitialized;
let adminApp = null;
let adminAuth = null;
exports.adminAuth = adminAuth;
let adminFirestore = null;
exports.adminFirestore = adminFirestore;
let adminRtdb = null;
exports.adminRtdb = adminRtdb;
const initFirebaseAdmin = () => {
    if ((0, app_1.getApps)().length > 0) {
        adminApp = (0, app_1.getApps)()[0];
        exports.isFirebaseAdminInitialized = isFirebaseAdminInitialized = true;
        exports.adminAuth = adminAuth = (0, auth_1.getAuth)(adminApp);
        exports.adminFirestore = adminFirestore = (0, firestore_1.getFirestore)(adminApp);
        try {
            exports.adminRtdb = adminRtdb = (0, database_1.getDatabase)(adminApp);
        }
        catch {
            // RTDB optional
        }
        return;
    }
    if (env_1.env.FIREBASE_PROJECT_ID && env_1.env.FIREBASE_CLIENT_EMAIL && env_1.env.FIREBASE_PRIVATE_KEY) {
        try {
            adminApp = (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId: env_1.env.FIREBASE_PROJECT_ID,
                    clientEmail: env_1.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: env_1.env.FIREBASE_PRIVATE_KEY,
                }),
                databaseURL: env_1.env.FIREBASE_DATABASE_URL || `https://${env_1.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
            });
            exports.adminAuth = adminAuth = (0, auth_1.getAuth)(adminApp);
            exports.adminFirestore = adminFirestore = (0, firestore_1.getFirestore)(adminApp);
            try {
                exports.adminRtdb = adminRtdb = (0, database_1.getDatabase)(adminApp);
            }
            catch (rtdbErr) {
                console.warn('[FirebaseAdmin] RTDB init warning:', rtdbErr);
            }
            exports.isFirebaseAdminInitialized = isFirebaseAdminInitialized = true;
            console.log('🔥 [FirebaseAdmin] Connected to project:', env_1.env.FIREBASE_PROJECT_ID);
        }
        catch (err) {
            console.warn('[FirebaseAdmin] Initialization failed, falling back to development store:', err);
        }
    }
    else {
        console.log('ℹ️ [FirebaseAdmin] Running in development store mode. Set FIREBASE_* env vars to connect to live Firebase.');
    }
};
exports.initFirebaseAdmin = initFirebaseAdmin;
(0, exports.initFirebaseAdmin)();

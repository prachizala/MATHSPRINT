"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStudent = exports.requireTeacher = exports.requireAuth = void 0;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const firestoreDataService_1 = require("../services/firestoreDataService");
const responseHelper_1 = require("../utils/responseHelper");
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // In local development mode without token, allow a mock demo user context
        if (!firebaseAdmin_1.isFirebaseAdminInitialized) {
            const devRole = req.headers['x-user-role'] || 'student';
            const devUid = req.headers['x-user-id'] || (devRole === 'teacher' ? 'teacher-demo-1' : 'student-demo-1');
            req.user = {
                uid: devUid,
                email: `${devRole}@mathsprint.edu`,
                role: devRole,
                name: devRole === 'teacher' ? 'Prof. Sarah Miller' : 'Alex Rivera',
                class: 'Class 10-A',
            };
            return next();
        }
        (0, responseHelper_1.sendError)(res, 'Authorization token required. Use format: Bearer <ID_TOKEN>', 401);
        return;
    }
    const token = authHeader.split('Bearer ')[1].trim();
    // If live Firebase Admin is initialized, verify token cryptographically
    if (firebaseAdmin_1.isFirebaseAdminInitialized && firebaseAdmin_1.adminAuth) {
        try {
            const decoded = await firebaseAdmin_1.adminAuth.verifyIdToken(token);
            const userProfile = await firestoreDataService_1.FirestoreDataService.getUser(decoded.uid);
            req.user = {
                uid: decoded.uid,
                email: decoded.email,
                role: userProfile?.role || 'student',
                name: userProfile?.name || decoded.name || decoded.email?.split('@')[0] || 'User',
                class: userProfile?.class,
            };
            return next();
        }
        catch (err) {
            console.warn('[authMiddleware] Token verification failed:', err.message);
            (0, responseHelper_1.sendError)(res, `Invalid or expired Firebase ID token: ${err.message}`, 401);
            return;
        }
    }
    // Development / fallback mode token parsing
    const devRole = req.headers['x-user-role'] || (token.includes('teacher') ? 'teacher' : 'student');
    const devUid = req.headers['x-user-id'] || (token.startsWith('user-') ? token : `dev-${devRole}-1`);
    req.user = {
        uid: devUid,
        email: `${devRole}@mathsprint.edu`,
        role: devRole,
        name: devRole === 'teacher' ? 'Prof. Sarah Miller' : 'Alex Rivera',
        class: 'Class 10-A',
    };
    next();
};
exports.requireAuth = requireAuth;
/**
 * Enforce Teacher-only access
 */
const requireTeacher = (req, res, next) => {
    if (!req.user) {
        (0, responseHelper_1.sendError)(res, 'Authentication required', 401);
        return;
    }
    if (req.user.role !== 'teacher') {
        (0, responseHelper_1.sendError)(res, 'Teacher access required for this operation', 403);
        return;
    }
    next();
};
exports.requireTeacher = requireTeacher;
/**
 * Enforce Student-only access
 */
const requireStudent = (req, res, next) => {
    if (!req.user) {
        (0, responseHelper_1.sendError)(res, 'Authentication required', 401);
        return;
    }
    if (req.user.role !== 'student') {
        (0, responseHelper_1.sendError)(res, 'Student access required for this operation', 403);
        return;
    }
    next();
};
exports.requireStudent = requireStudent;

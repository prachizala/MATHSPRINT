"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = exports.loginController = exports.getMeController = exports.syncUserProfileController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const firestoreDataService_1 = require("../services/firestoreDataService");
const syncUserProfileController = async (req, res) => {
    try {
        const { name, role, className } = req.body;
        const uid = req.user?.uid;
        if (!uid) {
            return (0, responseHelper_1.sendError)(res, 'Unauthenticated user', 401);
        }
        const existingUser = await firestoreDataService_1.FirestoreDataService.getUser(uid);
        const userRecord = {
            userId: uid,
            name: name || existingUser?.name || req.user?.name || 'User',
            email: req.user?.email || existingUser?.email || `${uid}@mathsprint.edu`,
            role: role || existingUser?.role || req.user?.role || 'student',
            class: className || existingUser?.class,
            createdAt: existingUser?.createdAt || Date.now(),
        };
        await firestoreDataService_1.FirestoreDataService.setUser(userRecord);
        return (0, responseHelper_1.sendSuccess)(res, userRecord, 'User profile synchronized');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.syncUserProfileController = syncUserProfileController;
const getMeController = async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            return (0, responseHelper_1.sendError)(res, 'Unauthenticated user', 401);
        }
        let user = await firestoreDataService_1.FirestoreDataService.getUser(uid);
        if (!user) {
            user = {
                userId: uid,
                name: req.user?.name || 'User',
                email: req.user?.email || `${uid}@mathsprint.edu`,
                role: req.user?.role || 'student',
                class: req.user?.class,
                createdAt: Date.now(),
            };
            await firestoreDataService_1.FirestoreDataService.setUser(user);
        }
        return (0, responseHelper_1.sendSuccess)(res, user);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getMeController = getMeController;
const loginController = async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) {
        return (0, responseHelper_1.sendError)(res, 'Email and password are required', 400);
    }
    const userId = `user-${Date.now()}`;
    const userRecord = {
        userId,
        name: email.split('@')[0],
        email,
        role: role || 'student',
        createdAt: Date.now(),
    };
    await firestoreDataService_1.FirestoreDataService.setUser(userRecord);
    return (0, responseHelper_1.sendSuccess)(res, {
        ...userRecord,
        token: `mock-token-${userId}`,
    }, 'Logged in successfully');
};
exports.loginController = loginController;
const registerController = async (req, res) => {
    const { email, name, role, className } = req.body;
    const userId = `user-${Date.now()}`;
    const userRecord = {
        userId,
        name: name || email?.split('@')[0] || 'User',
        email: email || `${userId}@mathsprint.edu`,
        role: role || 'student',
        class: className,
        createdAt: Date.now(),
    };
    await firestoreDataService_1.FirestoreDataService.setUser(userRecord);
    return (0, responseHelper_1.sendSuccess)(res, userRecord, 'Registered successfully', 201);
};
exports.registerController = registerController;

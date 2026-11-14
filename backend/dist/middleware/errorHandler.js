"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const errorHandler = (err, req, res, next) => {
    console.error('[Backend Error]:', err.stack || err.message || err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    (0, responseHelper_1.sendError)(res, message, status);
};
exports.errorHandler = errorHandler;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const createApp = () => {
    const app = (0, express_1.default)();
    // Middlewares
    app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Root health & meta
    app.get('/', (req, res) => {
        res.json({
            name: 'MATHSPRINT API',
            tagline: 'Learn • Compete • Improve',
            version: '1.0.0',
            health: '/api/health',
        });
    });
    // Mount modular API routes
    app.use('/api', routes_1.default);
    // Centralized error handling
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
const startServer = (port = env_1.env.PORT) => {
    const app = (0, exports.createApp)();
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`⚡ [MATHSPRINT Backend] Running on http://localhost:${port}`);
        console.log(`📡 [MATHSPRINT Backend] Health check: http://localhost:${port}/api/health`);
    });
    return { app, server };
};
exports.startServer = startServer;
// Start automatically if run directly
if (process.env.NODE_ENV !== 'test' && require.main === module) {
    (0, exports.startServer)();
}
exports.default = (0, exports.createApp)();

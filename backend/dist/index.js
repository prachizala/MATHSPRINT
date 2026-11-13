"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const app = (0, server_1.createApp)();
if (process.env.NODE_ENV !== 'test') {
    (0, server_1.startServer)();
}
exports.default = app;

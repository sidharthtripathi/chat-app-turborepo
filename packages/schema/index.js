"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentMessageSchema = exports.loginSignupSchema = exports.jwtPayloadSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.jwtPayloadSchema = zod_1.default.object({
    userId: zod_1.default.string()
});
exports.loginSignupSchema = zod_1.default.object({
    userId: zod_1.default.string().min(1),
    password: zod_1.default.string().min(8),
});
exports.sentMessageSchema = zod_1.default.object({
    id: zod_1.default.string(),
    to: zod_1.default.string(),
    content: zod_1.default.string(),
    createdAt: zod_1.default.number()
});

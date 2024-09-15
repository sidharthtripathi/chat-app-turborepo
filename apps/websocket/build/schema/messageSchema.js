"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = void 0;
const zod_1 = require("zod");
exports.messageSchema = zod_1.z.object({
    to: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
    type: zod_1.z.enum(["personal", "group"]),
    timestamp: zod_1.z.number().positive().int()
});

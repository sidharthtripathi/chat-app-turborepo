"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const zod_1 = __importDefault(require("zod"));
const querySchema = zod_1.default.object({
    createdAt: zod_1.default.string(),
    conversationId: zod_1.default.string()
});
const chatRouter = (0, express_1.Router)();
exports.chatRouter = chatRouter;
chatRouter.get('/chats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // getting all the chats from DB and redis
    if (!redis_1.redisDB.isOpen)
        yield redis_1.redisDB.connect();
    const redisMsgs = yield redis_1.redisDB.ft.search("idx:messages", `(@from:${res.locals.userId}) | (@to:${res.locals.userId})`, { SORTBY: { BY: "createdAt", DIRECTION: "ASC" }, LIMIT: { from: 0, size: 10000 } });
    const dbMsgs = yield prisma_1.prisma.message.findMany({
        where: { OR: [{ fromUserId: res.locals.userId }, { toUserId: res.locals.userId }] },
        select: { content: true, createdAt: true, fromUserId: true, toUserId: true, id: true },
        orderBy: { createdAt: "asc" }
    });
    const jsonRes = [];
    dbMsgs.forEach(msg => {
        jsonRes.push({ id: msg.id, from: msg.fromUserId, to: msg.toUserId, content: msg.content, createdAt: msg.createdAt });
    });
    if (redisMsgs.total > 0) {
        redisMsgs.documents.forEach(doc => {
            jsonRes.push({ id: doc.id, content: doc.value.content, from: doc.value.from, to: doc.value.to, createdAt: new Date(parseInt(doc.value.createdAt)) });
        });
    }
    return res.json(jsonRes);
}));
chatRouter.get('/chats/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    // getting all chats with userId from DB and redis
}));

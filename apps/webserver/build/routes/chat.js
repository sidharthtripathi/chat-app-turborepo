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
const main_1 = require("../main");
const zod_1 = __importDefault(require("zod"));
const querySchema = zod_1.default.object({
    createdAt: zod_1.default.string(),
    conversationId: zod_1.default.string()
});
const chatRouter = (0, express_1.Router)();
exports.chatRouter = chatRouter;
chatRouter.get('/chats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield prisma_1.prisma.user.findUnique({
        where: { id: res.locals.id },
        select: {
            conversations: {
                select: {
                    id: true,
                    members: {
                        select: {
                            username: true,
                        },
                        where: { NOT: { id: res.locals.id } }
                    },
                    messages: {
                        select: {
                            content: true,
                        },
                        orderBy: { createdAt: "asc" },
                        take: 1
                    }
                }
            }
        }
    });
    return res.json(conversations);
}));
chatRouter.get("/chats/:chatid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the user is part of convo or not
    // getting particular chat from redis
    try {
        const { createdAt, conversationId } = querySchema.parse(req.query);
        return (yield getMessages(createdAt, conversationId));
    }
    catch (error) {
        return res.json("INVALID INPUT").status(400);
    }
}));
function getMessages(createdAt, converstaionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield main_1.redisDB.ft.search("idx:messages", `@createdAt:[* ${parseInt(createdAt)}] @conversationId:${converstaionId} SORTBY createdAt ASC LIMIT 0 50`);
        if (messages.total == 50)
            return messages.documents;
        const dbMessages = yield prisma_1.prisma.conversation.findUnique({
            where: { id: converstaionId, createdAt },
            select: {
                messages: {
                    select: {
                        content: true,
                        createdAt: true,
                        id: true,
                        senderId: true,
                    },
                    take: 50 - messages.total,
                    orderBy: { createdAt: "asc" }
                }
            }
        });
        //  return messages.documents.concat(dbMessages?.messages)
    });
}

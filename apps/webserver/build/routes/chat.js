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
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const chatRouter = (0, express_1.Router)();
exports.chatRouter = chatRouter;
chatRouter.get("/chats", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const convos = yield prisma_1.prisma.privateConversation.findMany({
        where: {
            members: {
                some: {
                    userId: res.locals.userId,
                },
            },
        },
        select: {
            members: {
                where: {
                    userId: {
                        not: res.locals.userId,
                    },
                },
                take: 1,
                select: { userId: true },
            },
        },
    });
    const redisResult = yield redis_1.redisDB.sMembers(`users:${res.locals.userId}`);
    const result = convos.map((convo) => convo.members[convo.members.length - 1].userId);
    return res.json([...new Set(redisResult.concat(result))]);
}));
chatRouter.get("/chats/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const time = req.query.time;
    const isTimeValid = !isNaN(new Date(time).getTime());
    const userId = req.params.userId;
    // use new Date().toISOString() to get string from time
    // getting chats from Redis
    // getting chats from DB
    const conversation = yield prisma_1.prisma.privateConversation.findFirst({
        where: {
            AND: [
                {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
                {
                    members: {
                        some: {
                            userId: res.locals.userId,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
            privateMessages: {
                where: {
                    createdAt: {
                        lt: isTimeValid ? new Date(time) : new Date(),
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
                select: {
                    content: true,
                    to: true,
                    from: true,
                    id: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!conversation)
        return res.sendStatus(403);
    else
        return res.json(conversation);
}));

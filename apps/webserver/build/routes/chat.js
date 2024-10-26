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
const schema_1 = require("schema");
const chatRouter = (0, express_1.Router)();
exports.chatRouter = chatRouter;
chatRouter.get('/chats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const convos = yield prisma_1.prisma.privateConversation.findMany({
        where: {
            members: {
                some: {
                    userId: res.locals.userId
                }
            }
        },
        select: {
            id: true,
            members: {
                where: {
                    userId: {
                        not: res.locals.userId
                    }
                },
                select: { userId: true }
            }
        }
    });
    const result = convos.map(convo => ({ id: convo.id, userId: convo.members[convo.members.length - 1].userId }));
    return res.json(result);
}));
chatRouter.get('/chats/:conversationId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const time = req.query.time;
    const isTimeValid = !isNaN((new Date(time)).getTime());
    const conversationId = req.params.conversationId;
    if (!isTimeValid)
        return res.json({ conversationId, privateMessages: [] });
    // use new Date().toISOString() to get string from time
    // getting chats from Redis
    // getting chats from DB
    const conversation = yield prisma_1.prisma.privateConversation.findUnique({
        where: {
            id: conversationId,
            members: {
                some: {
                    userId: res.locals.userId
                }
            }
        },
        select: {
            id: true,
            privateMessages: {
                where: {
                    createdAt: {
                        lt: new Date(time)
                    }
                },
                orderBy: {
                    createdAt: "asc"
                },
                select: {
                    content: true,
                    to: true,
                    from: true,
                    id: true,
                    createdAt: true,
                }
            }
        }
    });
    if (!conversation)
        return res.sendStatus(403);
    else
        return res.json(conversation);
}));
chatRouter.post('/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // only to be made from the websocket server
    try {
        const { serverSecret, members } = schema_1.createConversationSchema.parse(req.body);
        if (serverSecret !== process.env.SERVER_SECRET)
            return res.status(401).end();
        const conversation = yield prisma_1.prisma.privateConversation.findFirst({
            where: {
                AND: [{ members: { some: { userId: members.at(-1) } } }, { members: { some: { userId: members.at(-2) } } }]
            },
            select: { id: true }
        });
        if (conversation)
            return res.json(conversation);
        const newConversation = yield prisma_1.prisma.privateConversation.create({
            data: {
                members: {
                    connect: [{ userId: members.at(-1) }, { userId: members.at(-2) }]
                }
            },
            select: {
                id: true
            }
        });
        return res.json(newConversation);
    }
    catch (error) {
        return res.status(400).end();
    }
}));

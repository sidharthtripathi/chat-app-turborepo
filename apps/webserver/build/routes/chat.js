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
const chatRouter = (0, express_1.Router)();
exports.chatRouter = chatRouter;
chatRouter.get('/chats/:conversationId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const time = req.query.time;
    const isTimeValid = !isNaN((new Date(time)).getTime());
    const conversationId = req.params.conversationId;
    if (!isTimeValid)
        return res.json({ conversationId, privateMessages: [] });
    else
        return res.json({ ok: "done" });
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

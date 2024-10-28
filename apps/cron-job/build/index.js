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
const redis_1 = require("redis");
const prisma_1 = require("./lib/prisma");
const db = (0, redis_1.createClient)({
    url: process.env.REDISDB_URL
});
function job() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.connect();
        const res = yield db.ft.search("idx:messages", `@createdAt : [0 ${Date.now()}]`);
        if (res.total > 0) {
            const msgs = res.documents;
            const msgIds = [];
            for (let i = 0; i < msgs.length; i++) {
                msgIds.push(msgs[i].id);
                const msg = { id: msgs[i].id, content: msgs[i].value.content, from: msgs[i].value.from, to: msgs[i].value.to, createdAt: msgs[i].value.createdAt };
                // check if such conversation exists or not 
                const convo = yield prisma_1.prisma.privateConversation.findFirst({
                    where: {
                        AND: [
                            {
                                members: {
                                    some: {
                                        userId: msg.from
                                    }
                                }
                            },
                            {
                                members: {
                                    some: {
                                        userId: msg.to
                                    }
                                }
                            }
                        ]
                    },
                    select: { id: true }
                });
                let convoId;
                if (!convo) {
                    const convo = yield prisma_1.prisma.privateConversation.create({
                        data: {
                            members: {
                                connect: [{ userId: msg.from }, { userId: msg.to }]
                            }
                        },
                        select: { id: true }
                    });
                    convoId = convo.id;
                }
                else {
                    convoId = convo.id;
                }
                // now create the msg for this conversation
                yield prisma_1.prisma.privateMessage.create({
                    data: {
                        privateConversationId: convoId,
                        content: msg.content,
                        to: msg.to,
                        from: msg.from,
                        createdAt: new Date(parseInt(msg.createdAt))
                    }
                });
            }
            yield db.del(msgIds);
        }
        yield db.disconnect();
    });
}
setInterval(job, 1000 * 5);
// 600000

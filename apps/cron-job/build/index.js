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
const db = (0, redis_1.createClient)();
function job() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.connect();
        const res = yield db.ft.search("idx:messages", `@createdAt : [0 ${Date.now()}]`);
        const msgs = [];
        const msgIds = [];
        if (res.total > 0) {
            res.documents.forEach((doc) => {
                msgs.push({ id: doc.value.id, content: doc.value.content, createdAt: new Date(parseInt(doc.value.createdAt)), fromUserId: doc.value.from, toUserId: doc.value.to });
                msgIds.push(doc.id);
            });
            yield prisma_1.prisma.message.createMany({
                data: msgs
            });
            yield db.del(msgIds);
        }
        yield db.disconnect();
    });
}
setInterval(job, 600000);

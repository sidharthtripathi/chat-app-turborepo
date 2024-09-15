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
const cookie_1 = __importDefault(require("cookie"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const messageSchema_1 = require("./schema/messageSchema");
const zod_1 = require("zod");
const ioredis_1 = require("ioredis");
const pubClient = new ioredis_1.Redis();
const subClient = new ioredis_1.Redis();
const redisDB = new ioredis_1.Redis();
const connectedSocket = new Map();
dotenv_1.default.config();
const server = http_1.default.createServer();
server.on('upgrade', (req, socket, head) => {
    console.log("req came");
    if (!(req.headers.cookie))
        return socket.end();
    const cookies = cookie_1.default.parse(req.headers.cookie);
    const accesstoken = cookies["access-token"];
    try {
        const payload = jsonwebtoken_1.default.verify(accesstoken, process.env.JWT_SECRET);
        req.username = payload.username;
        req.id = payload.id;
    }
    catch (error) {
        socket.end();
    }
});
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (socket, req) => {
    socket.username = req.username;
    socket.id = req.id;
    connectedSocket.set(socket.username, socket);
    // when socket goes offline
    socket.onclose = (e) => {
        connectedSocket.delete(socket.username);
    };
    socket.onmessage = (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const msg = messageSchema_1.messageSchema.parse(e.data);
            // check if socket is online
            if (connectedSocket.has(msg.to))
                (_a = connectedSocket.get(msg.to)) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(Object.assign(Object.assign({}, msg), { from: socket.username })));
            // else publish to redis
            pubClient.publish("message", JSON.stringify(Object.assign(Object.assign({}, msg), { from: socket.username })));
            // save msg to redis hash
            yield redisDB.hset("messages:messageId", {
                id: "id",
                content: "some msg",
                from: "someone",
                conversationId: "someconvoId",
                createdAt: Date.now()
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                console.log("INVALID SCHEMA");
        }
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield subClient.connect();
        subClient.subscribe('message');
        subClient.on("message", (ch, message) => {
            var _a;
            const msg = JSON.parse(message);
            // check if socket is connected to this
            if (connectedSocket.has(msg.to))
                (_a = connectedSocket.get(msg.to)) === null || _a === void 0 ? void 0 : _a.send(message);
        });
        server.listen(3000, () => {
            console.log("server: http://localhost:3000");
        });
    });
}
main();

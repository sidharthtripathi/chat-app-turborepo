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
const schema_1 = require("schema");
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const schema_2 = require("schema");
const ioredis_1 = require("ioredis");
dotenv_1.default.config();
const pubClient = new ioredis_1.Redis();
const subClient = new ioredis_1.Redis();
const redisDB = new ioredis_1.Redis();
const connectedSocket = new Map();
const server = http_1.default.createServer();
server.on('upgrade', (req, socket, head) => {
    if (!(req.headers.cookie))
        return socket.end();
    const cookies = cookie_1.default.parse(req.headers.cookie);
    const accesstoken = cookies["access-token"];
    try {
        const { userId } = schema_1.jwtPayloadSchema.parse(jsonwebtoken_1.default.verify(accesstoken, process.env.JWT_SECRET));
        req.userId = userId;
    }
    catch (error) {
        socket.end();
    }
});
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (socket, req) => {
    socket.userId = req.userId;
    connectedSocket.set(socket.userId, socket);
    // when socket goes offline
    socket.onclose = (e) => {
        connectedSocket.delete(socket.userId);
    };
    socket.onmessage = (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // check the payload
        try {
            const msg = schema_2.sentMessageSchema.parse(JSON.parse(e.data));
            // send the msg
            // check if reciever is online
            const payload = JSON.stringify(Object.assign(Object.assign({}, msg), { from: socket.userId }));
            if (connectedSocket.has(msg.to)) {
                (_a = connectedSocket.get(msg.to)) === null || _a === void 0 ? void 0 : _a.send(payload);
            }
            else {
                // publish to redis
                pubClient.publish('message', payload);
            }
            // save the msg to redis hash
            yield redisDB.hset(`messages:${msg.id}`, Object.assign(Object.assign({}, msg), { from: socket.userId }));
            console.log('saved to redis');
        }
        catch (error) {
            console.log(error);
        }
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        subClient.subscribe('message');
        subClient.on("message", (ch, message) => {
            var _a;
            const msg = JSON.parse(message);
            (_a = connectedSocket.get(msg.to)) === null || _a === void 0 ? void 0 : _a.send(message);
        });
        server.listen(4000, () => {
            console.log("server: http://localhost:3000");
        });
    });
}
main();

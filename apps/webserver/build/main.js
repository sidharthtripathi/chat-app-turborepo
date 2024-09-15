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
exports.redisDB = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = require("./routes/auth");
const chat_1 = require("./routes/chat");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("redis");
const redisDB = (0, redis_1.createClient)();
exports.redisDB = redisDB;
const server = (0, express_1.default)();
// cors
server.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
}));
server.use((0, cookie_parser_1.default)());
server.use(body_parser_1.default.json());
// routes
server.use("/api", auth_1.authRouter);
server.use('/api', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.cookies["access-token"];
    if (!accessToken)
        return res.json('INVALID TOKEN').status(401);
    try {
        const { username, id } = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        res.locals = { username, id };
        next();
    }
    catch (error) {
        return res.json('INVALID TOKEN').status(401);
    }
}), chat_1.chatRouter);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // creating the index for messages hash
        try {
            yield redisDB.ft.create("idx:messages", {
                content: {
                    type: redis_1.SchemaFieldTypes.TEXT,
                },
                from: {
                    type: redis_1.SchemaFieldTypes.TEXT,
                },
                conversationId: {
                    type: redis_1.SchemaFieldTypes.TEXT,
                },
                createdAt: {
                    type: redis_1.SchemaFieldTypes.NUMERIC,
                    SORTABLE: true
                }
            }, {
                ON: "HASH",
                PREFIX: "messages"
            });
        }
        catch (error) {
            console.log("some error occured");
        }
    });
}
server.listen(3000, () => {
    console.log("webserver started...");
});

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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = require("./routes/auth");
const chat_1 = require("./routes/chat");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const validToken_1 = require("./middlewares/validToken");
const redis_1 = require("redis");
const redis_2 = require("./lib/redis");
const profile_1 = require("./routes/profile");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = (0, express_1.default)();
// cors
server.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
server.use((0, cookie_parser_1.default)());
server.use(body_parser_1.default.json());
// routes
server.use("/api", auth_1.authRouter);
server.use('/api', validToken_1.validToken, chat_1.chatRouter);
server.use('/api', profile_1.profileRouter);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // creating the index for messages hash
        try {
            yield redis_2.redisDB.connect();
            yield redis_2.redisDB.ft.create("idx:messages", {
                id: {
                    type: redis_1.SchemaFieldTypes.TEXT,
                },
                content: {
                    type: redis_1.SchemaFieldTypes.TEXT,
                },
                from: {
                    type: redis_1.SchemaFieldTypes.TEXT,
                },
                to: {
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
            console.log(error);
        }
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log(`webser started at port: ${port}`);
        });
    });
}
main();

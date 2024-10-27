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
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const schema_1 = require("schema");
const prisma_1 = require("../lib/prisma");
const library_1 = require("@prisma/client/runtime/library");
const validToken_1 = require("../middlewares/validToken");
const authRouter = express_1.default.Router();
exports.authRouter = authRouter;
authRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, password } = schema_1.loginSignupSchema.parse(req.body);
        const user = yield prisma_1.prisma.user.findUnique({
            where: { userId },
            select: { userId: true, password: true }
        });
        if (!user) {
            res.statusMessage = "TRY WITH DIFFERENT CREDENTIALS";
            return res.status(400).end();
        }
        if (!bcrypt_1.default.compareSync(password, user.password)) {
            res.statusMessage = "TRY WITH DIFFERENT CREDENTIALS";
            return res.status(401).end();
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET);
        return res.cookie("access-token", accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: 'none', secure: true }).json({ userId }).status(201);
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError) {
            return res.status(400).end();
        }
        return res.status(500).end();
    }
}));
authRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, password } = schema_1.loginSignupSchema.parse(req.body);
        yield prisma_1.prisma.user.create({
            data: { userId, password: bcrypt_1.default.hashSync(password, 10) }
        });
        return res.status(201).end();
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError) {
            res.statusMessage = "INVALID PAYLOAD";
            return res.status(400).end();
        }
        else if (error instanceof library_1.PrismaClientKnownRequestError) {
            res.statusMessage = "USER ALREADY EXIST";
            return res.status(400).end();
        }
        else
            return res.status(500).end();
    }
}));
authRouter.post('/logout', (req, res) => {
    res.clearCookie("access-token");
    return res.sendStatus(200);
});
authRouter.get('/valid-token', validToken_1.validToken, (req, res) => {
    res.json({ userId: res.locals.userId });
});

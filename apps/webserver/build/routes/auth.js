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
const authSchema_1 = require("../schema/authSchema");
const prisma_1 = require("../lib/prisma");
const library_1 = require("@prisma/client/runtime/library");
const authRouter = express_1.default.Router();
exports.authRouter = authRouter;
authRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = authSchema_1.loginSignupSchema.parse(req.body);
        const user = yield prisma_1.prisma.user.findUnique({
            where: { username },
            select: { username: true, id: true, password: true }
        });
        if (!user || !(user && bcrypt_1.default.compareSync(password, user.password))) {
            res.statusMessage = "WRONG CREDENTIALS";
            return res.status(400).end();
        }
        const accessToken = jsonwebtoken_1.default.sign({ username, id: user.id }, process.env.JWT_SECRET);
        return res.json({ username, id: user.id }).cookie("access-token", accessToken).status(201).end();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.statusMessage = "INVALID PAYLOAD";
            res.status(400).end();
        }
        res.status(500).end();
    }
}));
authRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = authSchema_1.loginSignupSchema.parse(req.body);
        yield prisma_1.prisma.user.create({
            data: { username, password: bcrypt_1.default.hashSync(password, 10) }
        });
        return res.status(201).json({ username });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.statusMessage = "INVALID PAYLOAD";
            res.status(400).end();
        }
        else if (error instanceof library_1.PrismaClientKnownRequestError) {
            res.statusMessage = "USER ALREADY EXIST",
                res.status(400).end();
        }
        else
            return res.status(500).end();
    }
}));

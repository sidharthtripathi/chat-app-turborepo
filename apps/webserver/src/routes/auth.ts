import express from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { loginSignupSchema } from "schema";
import { prisma } from "../lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { validToken } from "../middlewares/validToken";
const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { userId, password } = loginSignupSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, password: true },
    });
    if (!user) {
      res.statusMessage = "TRY WITH DIFFERENT CREDENTIALS";
      return res.status(400).end();
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.statusMessage = "TRY WITH DIFFERENT CREDENTIALS";
      return res.status(400).end();
    }
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!,{expiresIn : "15m"});
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET!,{expiresIn : "30d"});
    res.cookie("access-token", accessToken, {
      httpOnly: true,
      maxAge: 900000,
    });
    res
      .cookie("refresh-token", refreshToken, {
        httpOnly: true,
        path: "/api/access-token",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({ userId })
      .status(201);
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      return res.status(400).end();
    }
    return res.status(500).end();
  }
});

authRouter.post("/signup", async (req, res) => {
  try {
    const { userId, password } = loginSignupSchema.parse(req.body);
    await prisma.user.create({
      data: { userId, password: bcrypt.hashSync(password, 10) },
    });
    return res.status(201).end();
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      res.statusMessage = "INVALID PAYLOAD";
      return res.status(400).end();
    } else if (error instanceof PrismaClientKnownRequestError) {
      res.statusMessage = "USER ALREADY EXIST";
      return res.status(400).end();
    } else return res.status(500).end();
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("access-token");
  return res.sendStatus(200);
});

authRouter.get("/valid-token", validToken, (req, res) => {
  res.json({ userId: res.locals.userId });
});


authRouter.get("/access-token", async (req, res) => {
  const refreshToken = req.cookies["refresh-token"];
  if (!refreshToken) {
    res.status(401)
    return res.end("Missing Refresh Token")
  }
  try {
    const { userId } = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
    return res
      .cookie("access-token", accessToken, { httpOnly: true, maxAge: 900000 })
      .end();
  } catch (error) {
    res.status(401)
    return res.end("Invalid refresh token")
  }
});


export { authRouter };
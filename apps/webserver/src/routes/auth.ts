import express from 'express'
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { loginSignupSchema } from 'schema';
import { prisma } from '../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
const authRouter = express.Router()


authRouter.post('/login',async(req,res)=>{
    try {
        const {userId,password} = loginSignupSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where : {userId},
            select:{userId:true,password:true}
        })
        if(!user || !(user && bcrypt.compareSync(password,user.password))){ 
            res.statusMessage = "WRONG CREDENTIALS"
            return res.status(400).end()
        }
        const accessToken = jwt.sign({userId},process.env.JWT_SECRET as string)

        return res.cookie("access-token",accessToken,{httpOnly:true,maxAge :1000*60*60*24*30,sameSite : 'none'}).json({userId}).status(201)
    } catch (error) {
        if(error instanceof ZodError){
            res.statusMessage = "INVALID PAYLOAD"
            res.status(400).end()
        }
        console.log(error)
        res.status(500).end()  
    }
    
})

authRouter.post('/signup',async (req,res)=>{
    try {
        const {userId,password} = loginSignupSchema.parse(req.body);
        await prisma.user.create({
            data : {userId,password : bcrypt.hashSync(password,10)}
        })
        return res.status(201).json({userId})
    } catch (error) {
        if(error instanceof ZodError){
            res.statusMessage = "INVALID PAYLOAD"
            res.status(400).end()
        }
        else if(error instanceof PrismaClientKnownRequestError){
            res.statusMessage = "USER ALREADY EXIST",
            res.status(400).end()
        }
        else return res.status(500).end()
    }
})


authRouter.post('/logout',(req,res)=>{
    res.clearCookie("access-token")
    res.sendStatus(200)
})

export {authRouter}
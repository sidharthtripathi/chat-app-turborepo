import express from 'express'
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { loginSignupSchema } from '../schema/authSchema';
import { prisma } from '../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
const authRouter = express.Router()


authRouter.post('/login',async(req,res)=>{
    try {
        const {username,password} = loginSignupSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where : {username},
            select:{username:true,id:true,password:true}
        })
        if(!user || !(user && bcrypt.compareSync(password,user.password))){ 
            res.statusMessage = "WRONG CREDENTIALS"
            return res.status(400).end()
        }
        const accessToken = jwt.sign({username,id:user.id},process.env.JWT_SECRET as string)

        return res.json({username,id:user.id}).cookie("access-token",accessToken).status(201).end()
    } catch (error) {
        if(error instanceof ZodError){
            res.statusMessage = "INVALID PAYLOAD"
            res.status(400).end()
        }
        res.status(500).end()  
    }
    
})

authRouter.post('/signup',async (req,res)=>{
    try {
        const {username,password} = loginSignupSchema.parse(req.body);
        await prisma.user.create({
            data : {username,password : bcrypt.hashSync(password,10)}
        })
        return res.status(201).json({username})
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

export {authRouter}
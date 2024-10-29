import express from 'express'
import { prisma } from '../lib/prisma';
export const profileRouter = express.Router()
profileRouter.get('/users',async(req,res)=>{
    const {q} = req.query;
    if(!q) return res.json([]);
    const query = q as string
    const profiles  = await prisma.user.findMany({
        where : {userId : {contains : query}},
        select : {userId:true}
    })
    return res.json(profiles)
})
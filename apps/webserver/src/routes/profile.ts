import express from 'express'
import { prisma } from '../lib/prisma';
import {z} from 'zod'
import {profileSchema} from 'schema'
type Profile = z.infer<typeof profileSchema>
export const profileRouter = express.Router()
profileRouter.get('/users',async(req,res)=>{
    const {q} = req.query;
    if(!q) return res.json([]);
    const query = q as string
    const profiles : Profile[]  = await prisma.user.findMany({
        where : {userId : {contains : query}},
        select : {userId:true}
    })
    return res.json(profiles)
})
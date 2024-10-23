import { Router } from "express";
import { prisma } from "../lib/prisma";
import { redisDB } from "../lib/redis";
import z from 'zod'
const querySchema = z.object({
    createdAt : z.string(),
    conversationId : z.string()
})
const chatRouter = Router()

chatRouter.get('/chats',async(req,res)=>{
    // getting all the chats from DB and redis
    if(!redisDB.isOpen) await redisDB.connect()
    const redisMsgs = await redisDB.ft.search("idx:messages",`(@from:${res.locals.userId}) | (@to:${res.locals.userId})`,{SORTBY : {BY : "createdAt",DIRECTION : "ASC"},LIMIT : {from : 0,size : 10000}})
    const dbMsgs = await prisma.message.findMany({
        where : {OR : [{fromUserId : res.locals.userId},{toUserId : res.locals.userId}]},
        select : {content : true,createdAt : true,fromUserId : true,toUserId : true,id : true},
        orderBy : {createdAt : "asc"}
    })
    const jsonRes : {id: string,content: string,from:string,to:string,createdAt : Date}[] = [];
    dbMsgs.forEach(msg=>{
        jsonRes.push({id:msg.id,from:msg.fromUserId,to:msg.toUserId,content:msg.content,createdAt: msg.createdAt})
    })
    if(redisMsgs.total > 0){
        redisMsgs.documents.forEach(doc=>{
            jsonRes.push({id: doc.id,content : doc.value.content as string, from : doc.value.from as string,to : doc.value.to as string,createdAt : new Date(parseInt(doc.value.createdAt as string))})
        })
    }
    return res.json(jsonRes)

})

chatRouter.get('/chats/:userId',async(req,res)=>{
    const userId = req.params.userId;
    // getting all chats with userId from DB and redis
})


export {chatRouter}
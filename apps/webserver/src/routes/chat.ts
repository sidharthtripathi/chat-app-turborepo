import { Router } from "express";
import { prisma } from "../lib/prisma";
import { redisDB } from "../main";
import z from 'zod'
const querySchema = z.object({
    createdAt : z.string(),
    conversationId : z.string()
})
const chatRouter = Router()

chatRouter.get('/chats',async(req,res)=>{
    const conversations = await prisma.user.findUnique({
        where : {id : res.locals.id},
        select : {
            conversations : {
                select : {
                    id : true,
                    members : {
                        select : {
                            username :true,
                        },
                        where : {NOT : {id : res.locals.id}}
                    },
                    messages: {
                        select : {
                            content : true,
                        },
                        orderBy : {createdAt : "asc"},
                        take : 1
                    }
                }
            }
        }
    })
    return res.json(conversations)
})

chatRouter.get("/chats/:chatid",async(req,res)=>{
    // check if the user is part of convo or not
    // getting particular chat from redis

    try {
        const {createdAt,conversationId} = querySchema.parse(req.query)
        return (await getMessages(createdAt,conversationId))
    } catch (error) {
        return res.json("INVALID INPUT").status(400)
    }
})


async function getMessages(createdAt : string,converstaionId : string){
    
    const messages = await redisDB.ft.search("idx:messages",`@createdAt:[* ${parseInt(createdAt)}] @conversationId:${converstaionId} SORTBY createdAt ASC LIMIT 0 50`)
    if(messages.total == 50) return messages.documents;
    const dbMessages = await prisma.conversation.findUnique({
        where : {id : converstaionId,createdAt},
        select : {
            messages : {
                select : {
                    content : true,
                    createdAt : true,
                    id : true,
                    senderId : true,
                },
                take : 50-messages.total,
                orderBy : {createdAt : "asc"}
            }
        }

    })
    //  return messages.documents.concat(dbMessages?.messages)
}

export {chatRouter}
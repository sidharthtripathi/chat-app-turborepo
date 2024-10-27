import { Router } from "express";
import { prisma } from "../lib/prisma";
import {Conversation, CreateConversation} from 'schema'
const chatRouter = Router()
chatRouter.get('/chats',async(req,res)=>{
    const convos = await prisma.privateConversation.findMany({
        where : {
            members : {
                some : {
                    userId : res.locals.userId
                }
            }
        },
        select : {
            members : {
                where : {
                    userId : {
                        not : res.locals.userId
                    }
                },
                take : 1,
                select : {userId:true}
            }
        }
    })
    const result  = convos.map(convo=>(convo.members[convo.members.length-1].userId))
    return res.json(result)
})

chatRouter.get('/chats/:conversationId',async(req,res)=>{
    const time = req.query.time as string
    const isTimeValid = !isNaN((new Date(time)).getTime())
    const conversationId = req.params.conversationId;
    // use new Date().toISOString() to get string from time

    // getting chats from Redis

    // getting chats from DB
    const conversation : Conversation = await prisma.privateConversation.findUnique({
        where : {
            id : conversationId,
            members : {
                some : {
                    userId : res.locals.userId
                }
            }
        },
        select : {
            id : true,
            privateMessages : {
                where : {
                    createdAt : {
                        lt : isTimeValid ? new Date(time) : new Date()
                    }
                },
                orderBy : {
                    createdAt : "asc"
                },
                select : {
                    content : true,
                    to : true,
                    from : true,
                    id : true,
                    createdAt : true,
                }
            }

        }
    })
    if(!conversation) return res.sendStatus(403)
    else return res.json(conversation)
})

chatRouter.post('/chat',async(req,res)=>{
    // only to be made from the websocket server
    try {
        const {serverSecret,sender,receiver} = req.body as CreateConversation
        if(serverSecret!==process.env.SERVER_SECRET) return res.status(401).end()
        const conversation = await prisma.privateConversation.findFirst({
            where : {
                AND : [{members : {some : {userId : sender}}},{members : {some : {userId : receiver}}}]
            },
            select : {id : true}
        })
        if(conversation) return res.json({id : conversation.id,userId : receiver })
        const newConversation =  await prisma.privateConversation.create({
            data : {
                members : {
                    connect : [{userId : sender},{userId : receiver}]
                }
            },
            select : {
                id : true
            }
        })
        return res.json({id : newConversation.id,userId : receiver})
    } catch (error) {
        return res.status(400).end()
    }
})


export {chatRouter}
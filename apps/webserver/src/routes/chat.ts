import { Router } from "express";
import { prisma } from "../lib/prisma";
import {conversationSchema,conversationsSchema, createConversationSchema} from 'schema'
import {z} from 'zod'
const chatRouter = Router()
type Conversation = z.infer<typeof conversationSchema>
type Conversations = z.infer<typeof conversationsSchema>
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
            id : true,
            members : {
                where : {
                    userId : {
                        not : res.locals.userId
                    }
                },
                select : {userId:true}
            }
        }
    })
    const result : Conversations = convos.map(convo=>({id : convo.id,userId : convo.members[convo.members.length-1].userId}))
    return res.json(result)
})

chatRouter.get('/chats/:conversationId',async(req,res)=>{
    const time = req.query.time as string
    const isTimeValid = !isNaN((new Date(time)).getTime())
    const conversationId = req.params.conversationId;
    if(!isTimeValid) return res.json({conversationId,privateMessages : []})
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
                        lt : new Date(time)
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
        const {serverSecret,members} = createConversationSchema.parse(req.body)
        if(serverSecret!==process.env.SERVER_SECRET) return res.status(401).end()
        const conversation = await prisma.privateConversation.findFirst({
            where : {
                AND : [{members : {some : {userId : members.at(-1)}}},{members : {some : {userId : members.at(-2)}}}]
            },
            select : {id : true}
        })
        if(conversation) return res.json(conversation)
        const newConversation =  await prisma.privateConversation.create({
            data : {
                members : {
                    connect : [{userId : members.at(-1) },{userId : members.at(-2)}]
                }
            },
            select : {
                id : true
            }
        })
        return res.json(newConversation)
    } catch (error) {
        return res.status(400).end()
    }
})


export {chatRouter}
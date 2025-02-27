import { Router } from "express";
import { prisma } from "../lib/prisma";
import { redisDB } from "../lib/redis";
const chatRouter = Router();
chatRouter.get("/chats", async (req, res) => {
  const convos = await prisma.privateConversation.findMany({
    where: {
      members: {
        some: {
          userId: res.locals.userId,
        },
      },
    },
    select: {
      members: {
        where: {
          userId: {
            not: res.locals.userId,
          },
        },
        take: 1,
        select: { userId: true },
      },
    },
  });
  const redisResult = await redisDB.sMembers(`users:${res.locals.userId}`)
  const result = convos.map(
    (convo) => convo.members[convo.members.length - 1].userId
  );

  return res.json([...new Set(redisResult.concat(result))]);
});

chatRouter.get("/chats/:userId", async (req, res) => {
  const time = req.query.time as string;
  const isTimeValid = !isNaN(new Date(time).getTime());
  const userId = req.params.userId;
  // use new Date().toISOString() to get string from time

  const currentTime = Date.now()
  // getting chats from Redis 
  const redisChats = await redisDB.ft.search("idx:messages",`((@from:${res.locals.userId} @to:${userId}) | (@from:${userId} @to:${res.locals.userId})) @createdAt:[-inf ${isTimeValid ? new Date(time).getTime() : currentTime}]`,{LIMIT : {from : 0,size : 10000},SORTBY : {BY  : "createdAt",DIRECTION :"ASC"}})
  const rChats : {content : string,id:string,from:string,to:string, createdAt : Date}[] = []
  if(redisChats.total > 0){
    for(let i = 0 ; i<redisChats.documents.length ; i++){
      const msg = {id:redisChats.documents[i].id,content : redisChats.documents[i].value.content as string,from:redisChats.documents[i].value.from as string,to:redisChats.documents[i].value.to as string,createdAt : new Date(parseInt(redisChats.documents[i].value.createdAt as string))}
      rChats.push(msg)
    }
  }
  // getting chats from DB
  const conversation = await prisma.privateConversation.findFirst(
    {
      where: {
        AND: [
          {
            members: {
              some: {
                userId,
              },
            },
          },
          {
            members: {
              some: {
                userId: res.locals.userId,
              },
            },
          },
        ],
      },
      select: {
        privateMessages: {
          where: {
            createdAt: {
              lt: isTimeValid ? new Date(time) : new Date(currentTime),
            },
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            content: true,
            to: true,
            from: true,
            id: true,
            createdAt: true,
          },
        },
      },
    }
  );
  if (!conversation) return res.json(rChats);
  else{ 
    conversation.privateMessages.concat(rChats)
    return res.json(conversation.privateMessages);
  }
});


export { chatRouter };

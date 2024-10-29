import {createClient} from 'redis'
import { prisma } from './lib/prisma';
const db = createClient({
    url : process.env.REDISDB_URL
})
type RedisMsg = {
    id : string,
    createdAt : string,
    content : string,
    from : string,
    to : string
}

async function job(){
    const res = await db.ft.search("idx:messages",`@createdAt : [0 ${Date.now()}]`)
    if(res.total > 0){
        const msgs = res.documents
        const msgIds : string[] = []
        for(let i = 0 ; i < msgs.length ; i++){
            msgIds.push(msgs[i].id)
            const msg : RedisMsg = {id:msgs[i].id,content:msgs[i].value.content as string,from:msgs[i].value.from as string,to:msgs[i].value.to as string,createdAt : msgs[i].value.createdAt as string}
            // check if such conversation exists or not 
            const convo = await prisma.privateConversation.findFirst({
                where : {
                    AND : [
                        {
                            members : {
                                some : {
                                    userId : msg.from
                                }
                            }
                        },
                        {
                            members : {
                                some : {
                                    userId : msg.to
                                }
                            }
                        }
                    ]
                },
                select : {id : true}
            })
            let convoId : string;
            if(!convo){
                const convo = await prisma.privateConversation.create({
                    data : {
                        members : {
                            connect : [{userId : msg.from},{userId : msg.to}]
                        }
                    },
                    select : {id:true}
                })
                convoId = convo.id
            }
            else{
                convoId = convo.id
            }

            // now create the msg for this conversation
            await prisma.privateMessage.create({
                data : {
                    privateConversationId : convoId,
                    content : msg.content,
                    to : msg.to,
                    from : msg.from,
                    createdAt : new Date(parseInt(msg.createdAt))
                }
            })


        }
        await db.del(msgIds)
    }

}

async function main() {
    await db.connect()
    setInterval(job,600000)
}

main()
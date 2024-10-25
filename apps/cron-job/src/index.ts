import {createClient} from 'redis'
import { prisma } from './lib/prisma';
const db = createClient({
    url : process.env.REDISDB_URL
})
type DBMessage = {
    id : string,
    createdAt : Date,
    content : string,
    fromUserId : string,
    toUserId : string
}
async function job(){
    await db.connect();
    const res = await db.ft.search("idx:messages",`@createdAt : [0 ${Date.now()}]`)
    const msgs :DBMessage[] = []
    const msgIds:string[] = []
    if(res.total > 0){
        res.documents.forEach((doc : any)=>{
            msgs.push({id : doc.value.id,content: doc.value.content,createdAt: new Date(parseInt(doc.value.createdAt)), fromUserId : doc.value.from,toUserId : doc.value.to})
            msgIds.push(doc.id)
        })
        await prisma.message.createMany({
            data : msgs
        })
        await db.del(msgIds)
    }
    await db.disconnect()

}

setInterval(job,600000)
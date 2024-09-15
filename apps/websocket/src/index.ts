import cookie from 'cookie'
import dotenv from 'dotenv'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import http from 'http'
import { HTTPRequest,Socket } from './types/types'
import { messageSchema } from './schema/messageSchema'
import { ZodError } from 'zod'
import { Redis } from 'ioredis'
const pubClient = new Redis()
const subClient = new Redis()
const redisDB = new Redis()
const connectedSocket = new Map<string,Socket>()
dotenv.config()
const server = http.createServer()
server.on('upgrade',(req:HTTPRequest,socket,head)=>{
    console.log("req came")
    if(!(req.headers.cookie)) return socket.end()
    const cookies = cookie.parse(req.headers.cookie)
    const accesstoken = cookies["access-token"]
    try {
        const payload = jwt.verify(accesstoken,process.env.JWT_SECRET as string) as JwtPayload
        req.username = payload.username
        req.id = payload.id
    } catch (error) {
        socket.end()
    }
})
const wss = new WebSocketServer({server})
wss.on('connection',(socket:Socket,req:HTTPRequest)=>{
    socket.username = req.username
    socket.id = req.id
    connectedSocket.set(socket.username,socket);

    // when socket goes offline
    socket.onclose = (e)=>{
        connectedSocket.delete(socket.username)
    }
    socket.onmessage = async(e)=>{
        try {
            const msg = messageSchema.parse(e.data)
            // check if socket is online
            if(connectedSocket.has(msg.to)) connectedSocket.get(msg.to)?.send(JSON.stringify({...msg,from:socket.username}))
            // else publish to redis
            pubClient.publish("message",JSON.stringify({...msg,from:socket.username}))

            // save msg to redis hash
            await redisDB.hset("messages:messageId",{
                id : "id",
                content : "some msg",
                from : "someone",
                conversationId : "someconvoId",
                createdAt : Date.now()
            })
        } catch (error) {
            if(error instanceof ZodError) console.log("INVALID SCHEMA")
        }
    }


})

async function main() {
    await subClient.connect();
    subClient.subscribe('message')
    subClient.on("message",(ch,message)=>{
        const msg = JSON.parse(message)
        // check if socket is connected to this
        if(connectedSocket.has(msg.to)) connectedSocket.get(msg.to)?.send(message)
    })
    server.listen(3000,()=>{
        console.log("server: http://localhost:3000")
    })
}

main()
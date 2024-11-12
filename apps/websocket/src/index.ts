import cookie from 'cookie'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import http from 'http'
import { HTTPRequest,Socket } from './types/types'
import {sentMessageSchema} from 'schema'
import { Redis } from 'ioredis'
dotenv.config()
const pubClient = new Redis(process.env.REDIS_PUBSUB_URL as string)
const subClient = new Redis(process.env.REDIS_PUBSUB_URL as string)
const redisDB = new Redis(process.env.REDISDB_URL as string)
const connectedSocket = new Map<string,Socket>()
const server = http.createServer()

server.on('upgrade',(req:HTTPRequest,socket,head)=>{
    const accessToken = req.headers['sec-websocket-protocol']
    if(!accessToken) return socket.end()
    try {
        const {userId} = jwt.verify(accessToken,process.env.JWT_SECRET!) as {userId : string}
        req.userId = userId
    } catch (error) {
        socket.end()
    }
})
const wss = new WebSocketServer({server})
wss.on('connection',(socket:Socket,req:HTTPRequest)=>{
    socket.userId = req.userId
    connectedSocket.set(socket.userId,socket);

    // when socket goes offline
    socket.onclose = (e)=>{
        connectedSocket.delete(socket.userId)
    }
    socket.onmessage = async(e)=>{
        // check the payload
        try {
            const msg = sentMessageSchema.parse(JSON.parse(e.data))
            const payload = JSON.stringify({...msg,from:socket.userId})
            if(connectedSocket.has(msg.to)){
                connectedSocket.get(msg.to)?.send(payload)
            }
            else{
                // publish to redis
                pubClient.publish('message',payload)
            }
            // save the msg to redis hash
            await redisDB.hset(`messages:${msg.id}`,{...msg,from:socket.userId})
            await redisDB.sadd(`users:${msg.to}`,[socket.userId])
            await redisDB.sadd(`users:${socket.userId}`,[msg.to])

        } catch (error) {
            console.log(error)
        }
    }


})

async function main() {
 
    subClient.subscribe('message')
    subClient.on("message",(ch,message)=>{
        const msg = JSON.parse(message)
        connectedSocket.get(msg.to)?.send(message)
    })
    const port = process.env.PORT || 4000;
    server.listen(port,()=>{
        console.log(`ws server started at: ${port}`)
    })
}

main()
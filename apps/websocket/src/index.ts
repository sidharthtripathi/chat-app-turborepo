import cookie from 'cookie'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import {jwtPayloadSchema} from 'schema'
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
    if(!(req.headers.cookie)) return socket.end()
    const cookies = cookie.parse(req.headers.cookie)
    const accesstoken = cookies["access-token"]
    try {
        const {userId} = jwtPayloadSchema.parse(jwt.verify(accesstoken,process.env.JWT_SECRET as string))
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
    server.listen(process.env.PORT || 4000,()=>{
        console.log("ws server is up")
    })
}

main()
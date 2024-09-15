import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { authRouter } from './routes/auth'
import { chatRouter } from './routes/chat'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import {createClient, SchemaFieldTypes} from 'redis'
const redisDB = createClient()
const server = express()
// cors
server.use(cors({
    origin : "http://localhost:5173",
    methods : ["GET","POST"]
}))
server.use(cookieParser())
server.use(bodyParser.json())

// routes

server.use("/api",authRouter)

server.use('/api',async(req,res,next)=>{
    const accessToken = req.cookies["access-token"]
    if(!accessToken) return res.json('INVALID TOKEN').status(401)
    try {
        const {username,id} = jwt.verify(accessToken,process.env.JWT_SECRET as string) as jwt.JwtPayload
        res.locals = {username,id}
        next()
    } catch (error) {
        return res.json('INVALID TOKEN').status(401)
    }
},chatRouter)


async function main(){
    // creating the index for messages hash
    try {
        await redisDB.ft.create("idx:messages",{
            content : {
                type : SchemaFieldTypes.TEXT,
            },
            from : {
                type : SchemaFieldTypes.TEXT,
            },
            conversationId : {
                type : SchemaFieldTypes.TEXT,
            },
            createdAt : {
                type : SchemaFieldTypes.NUMERIC,
                SORTABLE : true
            }
        },{
            ON : "HASH",
            PREFIX : "messages"
        })
        
    } catch (error) {
        console.log("some error occured")
    }   
}
server.listen(3000,()=>{
    console.log("webserver started...")
})
// main()
export {redisDB}
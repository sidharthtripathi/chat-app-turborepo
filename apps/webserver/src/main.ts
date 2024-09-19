import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { authRouter } from './routes/auth'
import { chatRouter } from './routes/chat'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import {SchemaFieldTypes} from 'redis'
import {jwtPayloadSchema} from 'schema'
import { redisDB } from './lib/redis'
import { profileRouter } from './routes/profile'
const server = express()
// cors
server.use(cors({
    origin : "http://localhost:5173",
    methods : ["GET","POST"],
    credentials : true
}))
server.use(cookieParser())
server.use(bodyParser.json())

// routes

server.use("/api",authRouter)

server.use('/api',async(req,res,next)=>{
    const accessToken = req.cookies["access-token"]
    if(!accessToken) return res.json('INVALID TOKEN').status(401)
    try {
        const payload = jwt.verify(accessToken,process.env.JWT_SECRET as string) as jwt.JwtPayload
        const {userId} = jwtPayloadSchema.parse(payload)
        res.locals = {userId}
        next()
    } catch (error) {
        return res.json('INVALID TOKEN').status(401)
    }
},chatRouter)

server.use('/api',profileRouter)


async function main(){
    // creating the index for messages hash
    try { 
        await redisDB.connect()
        await redisDB.ft.create("idx:messages",{
            id : {
                type : SchemaFieldTypes.TEXT,
            },
            content : {
                type : SchemaFieldTypes.TEXT,
            },
            from : {
                type : SchemaFieldTypes.TEXT,
            },
            to : {
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
        console.log(error)
        console.log("some error occured")
    }
    server.listen(3000,()=>{
        console.log("webserver started...")
    })
}

main()
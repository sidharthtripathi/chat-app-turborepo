import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { authRouter } from './routes/auth'
import { chatRouter } from './routes/chat'
import cookieParser from 'cookie-parser'
import { validToken } from './middlewares/validToken'
import {SchemaFieldTypes} from 'redis'
import { redisDB } from './lib/redis'
import { profileRouter } from './routes/profile'
import dotenv from 'dotenv'
dotenv.config()
const server = express()
// cors
server.use(cors({
    origin : [process.env.FRONTEND_URL as string,process.env.FRONTEND_URL_DEV as string],
    methods : ["GET","POST","PUT","DELETE"],
    credentials : true
}))

server.use(cookieParser())
server.use(bodyParser.json())

// routes

server.use("/api",authRouter)

server.use('/api',validToken,chatRouter)

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
    }
    const port = process.env.PORT || 3000
    server.listen(port,()=>{
        console.log(`webser started at port: ${port}`)
    })
}

main()
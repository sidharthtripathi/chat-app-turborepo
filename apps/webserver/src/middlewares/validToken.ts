import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
export async function validToken(req:Request,res : Response,next : NextFunction){
    const accessToken = req.cookies["access-token"]
    if(!accessToken){
        res.statusMessage = 'INVALID ACCESS TOKEN'
        return res.status(401).end()
    }
    try {
        const payload = jwt.verify(accessToken,process.env.JWT_SECRET!) as jwt.JwtPayload
        res.locals = {userId : payload.userId,token : accessToken}
        next()
    } catch (error) {
        res.statusMessage = 'INVALID ACCESS TOKEN'
        return res.status(401).end()
    }
    
}

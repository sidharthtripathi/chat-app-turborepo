import z from 'zod'
export const jwtPayloadSchema = z.object({
userId:z.string()
})

export const loginSignupSchema = z.object({
    userId : z.string().min(1),
    password : z.string().min(8),
})

export const sentMessageSchema = z.object({
    id : z.string(),
    to : z.string(),
    content : z.string(),
    createdAt : z.number()

})
import z from 'zod'

export const profileSchema = z.object({
    userId : z.string()
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

export const conversationSchema = z.object({
    id : z.string(),
    privateMessages : z.array(z.object({
        content : z.string(),
        to : z.string(),
        from : z.string(),
        createdAt : z.date(),
        id : z.string()
    }))
}).nullable()
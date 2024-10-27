import z from 'zod'

export const loginSignupSchema = z.object({
    userId : z.string().min(1),
    password : z.string().min(8),
})

export const sentMessageSchema = z.object({
    id : z.string(),
    to : z.string(),
    content : z.string(),
    createdAt : z.date()
})

export type RecievedClientMessage = {
    id : string;
    from : string;
    content : string;
    createdAt : Date
}

export type CreateConversation = {
    sender : string,
    receiver : string,
    serverSecret : string
}

export type Conversation = {
    id : string,
    privateMessages : {
        content : string,
        to : string,
        from : string,
        createdAt : Date,
        id : string
    }[]
} | null

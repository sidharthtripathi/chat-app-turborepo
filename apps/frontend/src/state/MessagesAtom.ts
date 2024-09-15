import { atomFamily } from "recoil";
type Message = {
    id : string,
    conversationId : string,
    content : string,
    sender : string,
    createdAt:Date
}
export const MessagesFamily = atomFamily({
    key :"messages",
    default : (conversationId : string) : Message[]=>([])
})
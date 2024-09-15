import { atom, atomFamily } from "recoil";
type Conversation = {
    id : string,
    username : string,
    avatar : string,
    lastMessage : string
}
export const conversationsAtom = atom<Conversation[]>({
    key : "conversations",
    default : []
})

export const conversationFamily = atomFamily({
    key : "conversation",
    default : (conversationId: string) : Conversation=>({
        id : conversationId,
        avatar : "",
        username : "",
        lastMessage : ""
    })
})

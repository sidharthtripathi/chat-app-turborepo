import { atomFamily } from "recoil";
export type Message = {
    id : string, 
    content : string,
    from : string, 
    to : string,
    createdAt : number;
}
export const messagesFamily = atomFamily({
    key : "messages",
    default : (userId : string) : Message[]=>{
        console.log(userId)
        return []
    }
})
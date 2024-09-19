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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default : (userId : string) : Message[]=>([])
})
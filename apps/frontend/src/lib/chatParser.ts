import { messagesFamily } from "@/state/messagesAtom"
import { setRecoil } from "recoil-nexus"
import type { Message } from "@/state/messagesAtom"
import { profilesAtom } from "@/state/profileAtom";

type Conversations =  {
    [key: string]:Message[];
  }
export async function parser(msgs:Message[],id:string){

    const conversations : Conversations = {}
    msgs.forEach(msg=>{
        if(msg.from===id){
            if(!conversations[msg.to]) conversations[msg.to] = [msg]
            else conversations[msg.to].push(msg)
        }
        else if(msg.to===id){
            if(!conversations[msg.from]) conversations[msg.from] = [msg]
            else conversations[msg.from].push(msg)
        }
    })
    const userIds : string[] = [];
    for(const key in conversations){
        userIds.push(key)
        setRecoil(messagesFamily(key),conversations[key])
    }
    setRecoil(profilesAtom,userIds)

}
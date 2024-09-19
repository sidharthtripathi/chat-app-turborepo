import { atom } from "recoil";
import { Message, messagesFamily } from "./messagesAtom";
import { getRecoil, setRecoil } from "recoil-nexus";
import { profilesAtom } from "./profileAtom";
function getSocket(){
    const ws = new WebSocket("ws://localhost:4000")
    ws.onmessage = (e)=>{
        const msg = JSON.parse(e.data) as Message
        setRecoil(messagesFamily(msg.from),p=>([...p,msg]))
        const userIds = getRecoil(profilesAtom)
        const exists = userIds.find(userId=>(userId===msg.from))
        if(!exists){
            setRecoil(profilesAtom,(p)=>([...p,msg.from]))
        }
    }
    return ws
}
export const socketState  = atom({
    key : 'socketstate',
    default : getSocket()
})
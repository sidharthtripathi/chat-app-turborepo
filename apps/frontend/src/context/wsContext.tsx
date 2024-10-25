
import { messagesFamily, type Message } from "@/state/messagesAtom"
import { profilesAtom } from "@/state/profileAtom"
import { createContext, ReactNode } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { setRecoil } from "recoil-nexus"
export const WebSocketContext = createContext<null | WebSocket>(null)

export function WebSocketProvider({children} : {children : ReactNode}){
    const userIds = useRecoilValue(profilesAtom)
    const setProfiles = useSetRecoilState(profilesAtom)
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)
    ws.onmessage = (e)=>{
        
        const msg = JSON.parse(e.data) as Message
        console.log(msg)
        setRecoil(messagesFamily(msg.from),p=>([...p,msg]))
        const exists = userIds.find(userId=>(userId===msg.from))
        if(!exists){
            setProfiles((p)=>([...p,msg.from]))
        }
    }
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}

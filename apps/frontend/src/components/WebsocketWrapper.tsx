import { WebSocketContext } from "@/context/wsContext"
import { messagesFamily } from "@/state/messagesAtom"
import { usersAtom } from "@/state/profileAtom"
import { useRecoilState } from "recoil"
import {setRecoil} from 'recoil-nexus'
import type { RecievedClientMessage } from "schema"
export function WebsocketWrapper({children} : {children : React.ReactNode}){
    const [users,setUsers] = useRecoilState(usersAtom)
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)
    ws.onmessage = (msg)=>{
        const lastMsg = JSON.parse(msg.data) as RecievedClientMessage
        const userExists = users.includes(lastMsg.from)
        if(!userExists) setUsers((p)=>([...p,lastMsg.from]))
        setRecoil(messagesFamily(lastMsg.from),(p)=>([...p,{...lastMsg,to:"self"}]))
    }
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}
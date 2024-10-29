import { WebSocketContext } from "@/context/wsContext"
import { messagesFamily } from "@/state/messagesAtom"
import { usersAtom } from "@/state/profileAtom"
import { useRecoilState } from "recoil"
import {setRecoil} from 'recoil-nexus'
import type { RecievedClientMessage } from "schema"
import ReconnectingWebSocket from 'reconnecting-websocket';
export function WebsocketWrapper({children} : {children : React.ReactNode}){
    console.log("websocket wrapper called")
    // enter ws url here
    const ws = new ReconnectingWebSocket(import.meta.env.VITE_WEBSOCKET_URL)
    return <WebSocketProvider ws={ws}>{children}</WebSocketProvider>
}

function WebSocketProvider({children,ws} : {children : React.ReactNode,ws:ReconnectingWebSocket}){
    const [users,setUsers] = useRecoilState(usersAtom)
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
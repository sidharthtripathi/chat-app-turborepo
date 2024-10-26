import { useContext } from "react"
import { WebSocketContext } from "@/context/wsContext"
export function useSocket(){
    const ws = useContext(WebSocketContext)
    if(!ws) throw new Error("wrap the component in WebSocketWrapper")
    else return ws
}
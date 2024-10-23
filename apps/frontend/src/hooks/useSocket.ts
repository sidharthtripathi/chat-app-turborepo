import { WebSocketContext } from "@/context/wsContext";
import { useContext } from "react";

export function useSocket(){
    const ws = useContext(WebSocketContext)
    if(!ws) throw new Error("wrap the component in WebSocketProvider")
    else return ws
}
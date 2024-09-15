import { atom } from "recoil";
import webSocket from 'reconnecting-websocket'
export function getWebSocket(){
    const ws = new webSocket("ws://localhost:3000")
    ws.onmessage = (message)=>{
        // handling msgs here
        console.log(message)
    }
    return ws;
}

export const wsState = atom({
    key : "websocket",
    default : getWebSocket()
})

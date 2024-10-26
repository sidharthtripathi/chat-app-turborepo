import { WebSocketContext } from "@/context/wsContext"
export function WebsocketWrapper({children} : {children : React.ReactNode}){
    const ws = new WebSocket("https://echo.websocket.org/")
    ws.onmessage = (msg)=>{
        console.log(msg)
    }
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}
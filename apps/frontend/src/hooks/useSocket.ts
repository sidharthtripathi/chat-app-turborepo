export function useSocket(){
    const ws = new WebSocket("ws://localhost:4000")
    return ws;
}
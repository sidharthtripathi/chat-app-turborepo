import { IncomingMessage } from "http";

export type HTTPRequest = {
    id: string
    username : string
} & IncomingMessage
export type Socket = {
    username: string;
    id:string
  } & WebSocket;
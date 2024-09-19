import { IncomingMessage } from "http";

export type HTTPRequest = {
    userId : string
} & IncomingMessage
export type Socket = {
    userId : string
  } & WebSocket;
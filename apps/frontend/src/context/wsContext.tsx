import { createContext } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
export const WebSocketContext = createContext<ReconnectingWebSocket | null>(null)
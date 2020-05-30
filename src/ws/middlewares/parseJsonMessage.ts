import { WebSocket } from "uWebSockets.js";
import { WebsocketHandlerContext } from "../carousel";

export default async (ws: WebSocket, message: ArrayBuffer, isBinary: boolean, context: WebsocketHandlerContext) => {
    const parsedMessage = JSON.parse( Buffer.from( message ).toString()  )

    context["message"] = parsedMessage;
}
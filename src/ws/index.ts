import uWS from "uWebSockets.js";

import schema, { TWebsocketEvent } from "./schema";

export default ({ eventHandlers, fallback, binaryHandler, errorHandler }: TWebsocketCarouselOptions) => {

    return function websocketCarousel(ws: uWS.WebSocket, message: ArrayBuffer, isBinary: boolean) {

        try {
            if(isBinary) {
                if(!binaryHandler)
                    return;
                else
                    return binaryHandler(ws, message);
            }
        
            const parsedMessage = JSON.parse(Buffer.from(message).toString());

            const resolvedMessage = schema.websocketEvent.validateSync(parsedMessage)

            if((!eventHandlers[resolvedMessage.type])) {
                if(!fallback)
                    return;
                else
                    return fallback(ws, resolvedMessage);
            }

            return eventHandlers[resolvedMessage.type](ws, resolvedMessage.data);
        }
        catch ( error ) {
            errorHandler(error, ws, message, isBinary);
        }

    }
}

type TWebsocketCarouselOptions = {
    eventHandlers: {
        [key: string]: TWebsocketEventHandler;
    };
    fallback?: (ws: uWS.WebSocket, message: TWebsocketEvent) => void;
    binaryHandler?: (ws: uWS.WebSocket, message: ArrayBuffer) => void;
    errorHandler: (err: any, ws: uWS.WebSocket, message: ArrayBuffer, isBinary: boolean) => void;
}

type TWebsocketEventHandler = (ws: uWS.WebSocket, data: TWebsocketEvent["data"]) => void;


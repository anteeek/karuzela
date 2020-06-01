import { WebSocket, WebSocketBehavior } from "uWebSockets.js";

type WebsocketHandler = (
    ws: WebSocket, 
    message: ArrayBuffer, 
    isBinary: boolean, 
    context: WebsocketHandlerContext
) => void;

type WebsocketErrorHandler = (
    err: any, 
    ws: WebSocket, 
    message: ArrayBuffer, 
    isBinary: boolean, 
    context?: WebsocketHandlerContext
) => void;

export type WebsocketHandlerContext = { [key: string]: any };

type WebsocketCarousel = (eventHandler: WebsocketHandler) => WebSocketBehavior["message"];

interface IWebsocketCarouselOptions {
    middlewares: Array< WebsocketHandler >;
    errorHandler: WebsocketErrorHandler;
}


export default function WebsocketCarouselFactory({
    middlewares,
    errorHandler,
}: IWebsocketCarouselOptions): WebsocketCarousel  {
    
    return function(eventHandler: WebsocketHandler): WebSocketBehavior["message"] {

        const context = {};

        return (ws: WebSocket, message: ArrayBuffer, isBinary: boolean) => {
    
            
            try {
                for(let i=0; i < middlewares.length; i++) 
                    middlewares[i](ws, message, isBinary, context);
                
                eventHandler(ws, message, isBinary, context);
            }
            catch(error) {
                
                errorHandler(error, ws, message, isBinary, context);

            }

        }

    
    }   
}
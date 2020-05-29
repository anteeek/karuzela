import { HttpRequest } from "uWebSockets.js";

type WebsocketHandler = (ws: WebSocket, req: HttpRequest) => void;

type WebsocketErrorHandler = (err: any, ws: WebSocket, req: HttpRequest) => void;

type WebsocketCarousel = (eventHandler: WebsocketHandler) => WebsocketHandler;

interface IWebsocketCarouselOptions {
    middlewares: Array<WebsocketHandler>;
    errorHandler: WebsocketErrorHandler;
}

export default function WebsocketCarouselFactory({
    middlewares,
    errorHandler,
}: IWebsocketCarouselOptions): WebsocketCarousel  {
    
    return function(eventHandler: WebsocketHandler): WebsocketHandler {


        return (ws: WebSocket, req: HttpRequest) => {
    
            
            try {
                for(let i=0; i < middlewares.length; i++) 
                    middlewares[i](ws, req);
                
                eventHandler(ws, req);
            }
            catch(error) {
                
                errorHandler(error, ws, req);

            }

        }

    
    }   
}
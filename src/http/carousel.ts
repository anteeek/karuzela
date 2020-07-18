import isPromise from "is-promise";
import { HttpRequest, HttpResponse } from "uWebSockets.js";

type HttpRequestHandler = (res: HttpResponse, req: HttpRequest) => void | Promise<void | HttpResponse>;

type HttpErrorHandler = (err: any, res: HttpResponse, req: HttpRequest) => void | HttpResponse | Promise<void | HttpResponse>;

type HttpCarousel = (middlewares: Array<HttpRequestHandler>) => HttpRequestHandler;

interface HttpCarouselFactoryOptions {
    globalMiddlewares: Array<HttpRequestHandler>;
    errorHandler: HttpErrorHandler;
}

type TOnAbortedHandler = () => any;

export default function HttpCarouselFactory({
    globalMiddlewares,
    errorHandler,
}: HttpCarouselFactoryOptions): HttpCarousel  {
    
    return function(routeMiddlewares: Array<HttpRequestHandler>): HttpRequestHandler {

        const middlewares: Array<HttpRequestHandler> = globalMiddlewares.concat(routeMiddlewares); 

        return async (res: HttpResponse, req: HttpRequest) => {
        
            monkeypatchRes(res);

            try {
    
                for(let i=0; i < middlewares.length; i++) {

                    if(res.done)
                        break;
                    
                    const middlewareReturnValue = middlewares[i](res, req);

                    if(isPromise(middlewareReturnValue))
                        await middlewareReturnValue;
                }
                
            }
            catch(error) {
    
                if( !res.done )
                    errorHandler(error, res, req);
            
            }
            
        }
    
    }   
}

function monkeypatchRes(res: HttpResponse) {
    res._end = res.end;

    res.end = (body: string) => {
        if(res.done) {
            console.error("warning: called res.end multiple times");
            return res
        }
        res.done = true
        return res._end(body)
    }

    res._writeStatus = res.writeStatus;

    res.writeStatus = (status: string) => {
        if(res.done) {
            console.error("warning: called res.writeStatus after request is done");
            return res;
        }
        if(res.hasWrittenStatus) {
            console.error("warning: called res.writeStatus multiple times");
            return res;
        }
        res.hasWrittenStatus = true;

        return res.writeStatus(status);
    }

    /**
     * TODO: Possibly res.writeHeader ?????????
     */

    res.onAborted(() => {
        res.done = true;
        if(res.onAbortedHandlers) 
            res.onAbortedHandlers.forEach((f: TOnAbortedHandler) => f());
        
    });
    
    res.onAbortedHandlers = (handler: TOnAbortedHandler) => {
        res.onAbortedHandlers = res.onAbortedHandlers || [];
        res.onAbortedHandlers.push(handler)
        return res;
    }
}

/**
 * Amazing monkeypatches adapted/taken from https://dev.to/mattkrick/replacing-express-with-uwebsockets-48ph
 * res.end -> res._end 
 * and
 * onAborted
 */
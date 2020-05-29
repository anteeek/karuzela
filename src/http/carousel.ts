import { HttpRequest, HttpResponse } from "uWebSockets.js";

type HttpRequestHandler = (res: HttpResponse, req: HttpRequest) => Promise<void | HttpResponse>;

type HttpErrorHandler = (err: any, res: HttpResponse, req: HttpRequest) => Promise<void | HttpResponse>;

type HttpCarousel = (middlewares: Array<HttpRequestHandler>) => HttpRequestHandler;

interface HttpCarouselFactoryOptions {
    globalMiddlewares: Array<HttpRequestHandler>;
    errorHandler: HttpErrorHandler;
}

export default function HttpCarouselFactory({
    globalMiddlewares,
    errorHandler,
}: HttpCarouselFactoryOptions): HttpCarousel  {
    
    return function(routeMiddlewares: Array<HttpRequestHandler>): HttpRequestHandler {

        const middlewares: Array<HttpRequestHandler> = globalMiddlewares.concat(routeMiddlewares); 

        return async (res: HttpResponse, req: HttpRequest) => {
    
            res.onAborted(() => {
                res.aborted = true;
            });
    
            try {
    
                for(let i=0; i < middlewares.length; i++) {

                    if(res.aborted)
                        break;
                    
                    const middlewareResult: HttpResponse | void = await middlewares[i](res, req);
    
                    if(didEndRequest(middlewareResult))
                        break;

                }
                
            }
            catch(error) {
    
                if( !res.aborted )
                    return await errorHandler(error, res, req);
            
            }
            
        }
    
    }   
}


function didEndRequest(result: HttpResponse | void): result is HttpResponse {
    return (typeof result) !== 'undefined'; 
}
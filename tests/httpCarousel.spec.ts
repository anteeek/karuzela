import { MakeHttpCarousel } from "../src";

import uWS, { HttpResponse, HttpRequest } from "uWebSockets.js";
import fetch from "node-fetch";

describe("HTTP Carousel", () => {


    const app = uWS.App();
    const listeningPort = 25000;
    const baseUrl = `http://localhost:${listeningPort}`;

    const fetcher = 
        (path: string, options?: any) => fetch(baseUrl+path, options);

    beforeAll( async () => {
        return new Promise( (resolve, reject) => {
            app.listen("127.0.0.1", listeningPort, (listenSocket: any) => {
                if(listenSocket)
                    resolve();
                else
                    reject();
            });
        })
    });

    const globalMiddleware = jest.fn();
    const errorHandler = jest.fn((error: any, res: HttpResponse, req: HttpRequest) => {
        res.writeStatus("400 Bad Request");
        res.end(JSON.stringify({
            success: false,
            error: error.message
        }))
    });

    const carousel = MakeHttpCarousel({
        globalMiddlewares: [
            globalMiddleware
        ],
        errorHandler
    })
    
    it("Should just work", async () => {

        const sentText = "hehehe";

        const localMiddleware = jest.fn((res: HttpResponse, req: HttpRequest) => {
            res.end(sentText);
        });

        app.get("/text", carousel([
            localMiddleware
        ]));
        
        const result = await fetcher(`/text`, {
            method: "GET"
        }).then( response => response.text() );

        expect(result).toEqual(sentText);
        expect(localMiddleware).toHaveBeenCalledTimes(1); 
        expect(globalMiddleware).toHaveBeenCalledTimes(1);
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it("Should call onError handler with appropiate error", async () => {

        const errorMessage = "E";

        const failingController = jest.fn((res: HttpResponse, req: HttpRequest) => {
            throw new Error(errorMessage);
        });

        app.get(`/fail`, carousel([ failingController ]));

        const result = await fetcher(`/fail`);

        expect(result.statusText).toEqual(`Bad Request`);
        
        const body = await result.json();

        expect(body).toMatchObject({
            success: false,
            error: errorMessage
        });
    });
       
});
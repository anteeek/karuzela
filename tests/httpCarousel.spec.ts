import { MakeHttpCarousel } from "../src";

import uWS, { HttpResponse, HttpRequest } from "uWebSockets.js";
import fetch from "node-fetch";
import { createNoSubstitutionTemplateLiteral } from "typescript";
import { rejects } from "assert";

describe("HTTP Carousel", () => {


    const app = uWS.App();
    const listeningPort = 25000;
    const baseUrl = `http://localhost:${listeningPort}`;

    const fetcher = 
        (path: string, options: any) => fetch(baseUrl+path, options);

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
    
    it("Should just work", async () => {

        const globalMiddleware = jest.fn();
        const errorHandler = jest.fn();

        const carousel = MakeHttpCarousel({
            globalMiddlewares: [
                globalMiddleware
            ],
            errorHandler
        })

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
        expect(localMiddleware).toHaveBeenCalled(); 
    });
    
});
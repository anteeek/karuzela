import { MakeHttpCarousel } from "../src";

import uWS, { HttpResponse, HttpRequest } from "uWebSockets.js";
import fetch from "node-fetch";
import { createNoSubstitutionTemplateLiteral } from "typescript";
import { rejects } from "assert";

describe("HTTP Carousel", () => {


    const app = uWS.App();

    beforeAll( async () => {
        return new Promise( (resolve, reject) => {
            app.listen("127.0.0.1", 25000, (listenSocket: any) => {
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

        app.get("/api", carousel([
            localMiddleware
        ]));
        
        const result = await fetch(`http://localhost:25000/api`, {
            method: "GET"
        }).then( response => response.text() );

        expect(result).toEqual(sentText);
        expect(localMiddleware).toHaveBeenCalled(); 
    });
    
});
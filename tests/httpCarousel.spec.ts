import { MakeHttpCarousel } from "../src";

import { HttpResponse, HttpRequest } from "uWebSockets.js";
import setup, { TTestingResources } from "./setup";

describe("HTTP Carousel", () => {

    let resources: TTestingResources;

    beforeAll(async () => {
        resources = await setup(20055);
    })    

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

        resources.app.get("/text", carousel([
            localMiddleware
        ]));
        
        const result = await resources.fetcher(`/text`, {
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

        resources.app.get(`/fail`, carousel([ failingController ]));

        const result = await resources.fetcher(`/fail`);

        expect(result.statusText).toEqual(`Bad Request`);
        
        const body = await result.json();

        expect(body).toMatchObject({
            success: false,
            error: errorMessage
        });
    });
       
});
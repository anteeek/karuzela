import { MakeHttpCarousel, HttpMiddlewares as middlewares } from "../src";

import uWS, { HttpResponse, HttpRequest } from "uWebSockets.js";
import fetch from "node-fetch";

describe("HTTP Middlewares", () => {
    const app = uWS.App();
    const listeningPort = 25001;
    const baseUrl = `http://localhost:${listeningPort}`;

    const fetcher = 
        (path: string, options?: any) => fetch(baseUrl+path, options);

    beforeAll( async () => {
        return new Promise( (resolve, reject) => {
            app.listen("127.0.0.1", listeningPort, (listenSocket: any) => {
                if(listenSocket)
                    resolve();
                else
                    reject("Failed to app.listen");
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

    let controller: jest.Mock;

    beforeEach(() => {
        controller = jest.fn((res: HttpResponse) => {
            res.end();
        });
    })
    
    describe("Middlewares.parseBody", () => {

        it("Should parse valid JSON body", async () => {

            app.post(`/json`, carousel([
                middlewares.parseBody,
                controller
            ]));

            const sentObject = {
                "yes": "no"
            }

            await fetcher(`/json`, {
                method: "POST",
                body: JSON.stringify(sentObject)
            });

            const calledWithBody = controller.mock.calls[0][0]["body"];

            expect(typeof calledWithBody).toEqual("object");
            expect(calledWithBody).toEqual(sentObject);
        });

        it("Should fail before controller on not-valid json body", async () => {

            app.post(`/json`, carousel([
                middlewares.parseBody,
                controller
            ]));

            const result = await fetcher(`/json`, {
                method: "POST",
                body: "fake json"
            });

            expect(controller).not.toHaveBeenCalled();
            expect(result.statusText).toEqual(`Bad Request`)
        });
    });

    describe("Extract headers", () => {

        it("Should extract only provided headers", async () => {
            
            const sentHeaders = {
                "Authorization": "123",
                "Authentication": "321"
            }
            app.get(`/headers`, carousel([
                middlewares.extractHeaders(
                    Object.keys(sentHeaders)
                ),
                controller
            ]));

            await fetcher(`/headers`, {
                headers: sentHeaders
            });

            const calledWithRes = controller.mock.calls[0][0];

            expect(
                calledWithRes.headers
            ).toEqual(
                sentHeaders
            );
        });

    });
       
});
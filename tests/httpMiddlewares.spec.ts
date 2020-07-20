import { MakeHttpCarousel, HttpMiddlewares as middlewares } from "../src";

import { HttpResponse, HttpRequest } from "uWebSockets.js";

import setup, { TTestingResources } from "./setup";

describe("HTTP Middlewares", () => {

    let resources: TTestingResources;

    beforeAll(async () => {
        resources = await setup(20005);
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

    let controller: jest.Mock;

    beforeEach(() => {
        controller = jest.fn((res: HttpResponse) => {
            res.end();
        });
    })
    
    describe("Middlewares.parseBody", () => {

        it("Should parse valid JSON body", async () => {

            resources.app.post(`/json`, carousel([
                middlewares.parseBody,
                controller
            ]));

            const sentObject = {
                "yes": "no"
            }

            await resources.fetcher(`/json`, {
                method: "POST",
                body: JSON.stringify(sentObject)
            });

            const calledWithBody = controller.mock.calls[0][0]["body"];

            expect(typeof calledWithBody).toEqual("object");
            expect(calledWithBody).toEqual(sentObject);
        });

        it("Should fail before controller on not-valid json body", async () => {

            resources.app.post(`/json`, carousel([
                middlewares.parseBody,
                controller
            ]));

            const result = await resources.fetcher(`/json`, {
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
            resources.app.get(`/headers`, carousel([
                middlewares.extractHeaders(
                    Object.keys(sentHeaders)
                ),
                controller
            ]));

            await resources.fetcher(`/headers`, {
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

    describe("parseParams middleware", () => {

        it("Should extract provided middlewares in the correct order", async () => {


            resources.app.get(`/:firstParam/:secondParam`, carousel([
                middlewares.parseParams([
                    "firstParam", "secondParam"
                ]),
                controller
            ]));

            const firstParamValue = "hehehe";
            const secondParamValue = "isPies";

            await resources.fetcher(`/${firstParamValue}/${secondParamValue}`);

            const calledWithRes = controller.mock.calls[0][0];

            expect(
                calledWithRes.params
            ).toEqual({
                firstParam: firstParamValue,
                secondParam: secondParamValue
            });

        })

    })
       
});
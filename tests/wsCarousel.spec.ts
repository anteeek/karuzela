import { MakeWsCarousel } from "../src";

import WebSocket from "ws";
import setup, { TTestingResources } from "./setup";
import uWS from "uWebSockets.js";

describe("WebSocket Carousel", () => {

    let resources: TTestingResources;
    let wsClient: WebSocket;

    const pingHandler = jest.fn();
    const errorHandler = jest.fn();
    const fallback = jest.fn();

    beforeAll(async () => {
        resources = await setup(20075);

        const wsCarousel = MakeWsCarousel({
            eventHandlers: {
                "ping": pingHandler
            },
            fallback,
            errorHandler
        });
           
        resources.app.ws(`/ws`, {
            message: wsCarousel
        });

        wsClient = await resources.getWsClient(`/ws`);
    })      

    it("Should call fallback when unknown event type is sent", async () => {

        const wsClient = await resources.getWsClient("/ws");

        const sentEvent = {
            type: "unkwonkwakodawdidawo", 
            data: {
                ping: "pong"
            }
        }

        wsClient.send(JSON.stringify(sentEvent));

        await sleep(50);

        const calledWithEvent = fallback.mock.calls[0][1];

        expect(
            calledWithEvent
        )
        .toEqual(
            sentEvent
        );
    })

    it("Should call eventHandler with event data", async () => {

        const wsClient = await resources.getWsClient("/ws");

        const sentData = {
            ping: "pong"
        }

        wsClient.send(JSON.stringify({ 
            type: "ping", 
            data: sentData
        }));

        await sleep(50);

        expect(
            pingHandler.mock.calls[0][1]
        )
        .toEqual(
            sentData
        );
    })

    it("Should call errorHandler when error occurrs in the controller", async () => {

        const wsClient = await resources.getWsClient("/ws");

        const sentData = {
            ping: "pong"
        }

        const thrownError = new Error("intentional");

        pingHandler.mockImplementationOnce((ws: uWS.WebSocket, data: any) => {
            throw thrownError;
        })

        wsClient.send(JSON.stringify({ 
            type: "ping", 
            data: sentData
        }));

        await sleep(50);

        expect(errorHandler).toHaveBeenCalled();

        const calledWithError = errorHandler.mock.calls[0][0];

        expect(
            calledWithError
        )
        .toEqual(
            thrownError
        )
    })
});

async function sleep(time: number) {
    return new Promise( (resolve) => {
        setTimeout(resolve, time);
    })
}
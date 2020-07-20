import uWS from "uWebSockets.js";
import fetch from "node-fetch";
import WebSocket from "ws";

export type TTestingResources = {
    app: uWS.TemplatedApp,
    fetcher: (path: string, options?: any) => Promise<any>;
    getWsClient: (path: string) => Promise<WebSocket>;
}

export default async (listeningPort: number): Promise<TTestingResources> => {
    const app = uWS.App();
    const baseUrl = `http://localhost:${listeningPort}`;

    new Promise( (resolve, reject) => {
        app.listen("127.0.0.1", listeningPort, (listenSocket: any) => {
            if(listenSocket)
                resolve();
            else
                reject();
        });
    });

    async function fetcher(path: string, options?: any) {
        return fetch(baseUrl+path, options);
    }

    async function getWsClient(path: string): Promise<WebSocket> {
        return new Promise( (resolve) => {
            const wsClient = new WebSocket(baseUrl+path);

            wsClient.on("open", () => resolve(wsClient));
        });
    }

    return {
        app,
        fetcher,
        getWsClient
    }
}


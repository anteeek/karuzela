import { HttpResponse, HttpRequest } from "uWebSockets.js";

interface ICorsOptions {
    allowOrigin: string;
    allowCredentials?: boolean;
}

export default ({ allowOrigin, allowCredentials=false  }: ICorsOptions) => {
    return async (res: HttpResponse, req: HttpRequest) => {
        
        res.writeHeader(`Access-Control-Allow-Origin`, allowOrigin);
        res.writeHeader(`Access-Control-Allow-Credentials`, allowCredentials ? "true" : "false" );
        res.writeHeader(`Access-Control-Max-Age`, `-1`);
    }
}
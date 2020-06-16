import { HttpResponse, HttpRequest } from "uWebSockets.js";


export default (headerNames: Array<string>) => async (res: HttpResponse, req: HttpRequest): Promise<any> => {

    if(!res.headers)
        res.headers = {};

    headerNames.forEach( headerName => {
        res.headers[headerName] = req.getHeader( headerName.toLowerCase() );
    });
}
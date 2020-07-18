import { HttpResponse, HttpRequest } from "uWebSockets.js";

export default (paramNames: Array<string>) => async function parseParams(res: HttpResponse, req: HttpRequest): Promise<any> {
    
    let i=0;
    res.params = {};

    while(req.getParameter(i) !== "") {
        res.params[paramNames[i]] = req.getParameter(i);
        i++;
    }
    
}
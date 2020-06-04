import { HttpResponse, HttpRequest } from "uWebSockets.js";

import cookie from "cookie";

export default async (res: HttpResponse, req: HttpRequest): Promise<any> => {
    
    let i=0;
    res.params = [];

    while(req.getParameter(i) !== "")
        res.params.push(req.getParameter(i));
    
}
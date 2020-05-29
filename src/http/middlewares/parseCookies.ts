import { HttpResponse, HttpRequest } from "uWebSockets.js";

import cookie from "cookie";

export default async (res: HttpResponse, req: HttpRequest): Promise<any> => {
    res.cookies = cookie.parse( req.getHeader(`cookie`) )
}
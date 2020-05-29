/**
     * original code: https://github.com/uNetworking/uWebSockets.js/blob/master/examples/JsonPost.js
     * modifications: added types; wrapped in a Promise
     */

import { HttpResponse, HttpRequest } from "uWebSockets.js";


export default async (res: HttpResponse, req: HttpRequest): Promise<any> => {

  const parsedBody = await new Promise( ( resolve ) => {

    let buffer: Buffer;

    res.onData((ab, isLast) => {
      let chunk = Buffer.from(ab);
      if (isLast) {
          
        if (buffer) 
          resolve( JSON.parse( Buffer.concat([buffer, chunk]).toString() ) );
         else 
          resolve( JSON.parse( chunk.toString() ) );
        
      } else {

        if (buffer) 
          buffer = Buffer.concat([buffer, chunk]);
        else 
          buffer = Buffer.concat([chunk]);
        
      }
    });
    
  });

  res["body"] = parsedBody;
  
}
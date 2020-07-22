# Karuzela

[![Build Status](https://travis-ci.org/anteeek/karuzela.svg?branch=master)](https://travis-ci.org/anteeek/karuzela)

First instantiate the carousel. This resembles `app.use` from express.js, but be careful with spamming it with async handlers - each time an `async` middleware is present, `uws` has to return to c++ code, making it less performant (if I'm not wrong)

```js

import { MakeHttpCarousel, HttpMiddlewares  as  middlewares } from  "karuzela";

export  default  MakeHttpCarousel({

        globalMiddlewares: [
            middlewares.extractHeaders(["Authorization"]),
            middlewares.cors({
             allowOrigin:  "https://example.com",
                allowCredentials:  true
            }),
            async (res: HttpResponse, req: HttpRequest) => {
                Logger.info(`${req.getMethod().toUpperCase()}  ${req.getUrl()}`);
            }
        ],

        errorHandler:  async (error: any, res: HttpResponse, req: HttpRequest) =>         {
            Logger.error(error.name+": ", error);
            
            res.writeStatus(`400 Bad Request`);
                res.end(JSON.stringify({    
                    success:  false,
                    error:  error.message
                }))
            }
        }

});
```

You can then use the previously instantiated karuzela like so:



```js

app.post(`/api/echoJson`, 
        carousel([
                middlewares.parseBody,
                Controller.echoJson
        ])
);

```

 # Karuzela

 It all boils down to:

 ![Instancing a Carousel](https://ibb.co/CtBKGP0 "Instancing a carousel")

 ![Filling it with your middlewares/controllers](https://ibb.co/YRB7Z7h "Filling it with your middlewares/controllers")

A library wrapping the most common uWebSockets utilites
Includes a JSON body parser, cookie parser and a CORS handler (with possibly more to come)
Respects the philosophy of the library (at least I hope so) by NOT providing any defaults, and NOT trying to mimick express.js. Therefore it is *NOT* recommended to bloat it with many globalMiddleware functions. 
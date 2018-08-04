import { Application } from "express";
import { App } from "./App";
import { MongooseClient } from "./controllers/MongooseClient";

let app: Application;
try {
    // check PORT in env
    if (!process.env.PORT) {
        throw new Error("Env var PORT required to start express");
    }
    // init MongooseClient to prevent errors
    MongooseClient.getInstance();
    // init express app
    app = (new App()).getExpressApp();
} catch (err) {
    console.error(err);
    process.exit(1);
}

// mongo connection is ready
const port: number = parseInt(process.env.PORT, 10);
app.listen(port, () => {
    console.debug("Application is listening on port: " + process.env.PORT);
});

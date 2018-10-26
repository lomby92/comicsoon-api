import { Application } from "express";
import { App } from "./App";
import { MongooseClient } from "./controllers/MongooseClient";

let app: Application;

const checkMongoConnection = async (): Promise<void> => {

    // init MongooseClient to prevent errors
    await MongooseClient.getInstance().connect();

};

checkMongoConnection().then(() => {
    // check PORT in env
    if (!process.env.PORT) {
        throw new Error("Env var PORT required to start express");
    }
    // read port
    const port: number = parseInt(process.env.PORT, 10);
    // init express app
    app = (new App()).getExpressApp();
    // listening
    app.listen(port, () => {
        console.debug("Application is listening on port: " + process.env.PORT);
    });
}).catch(err => {
    console.error(err);
    process.exit(1);
});

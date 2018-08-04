import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";

export class App {

    private express: express.Application;

    public constructor() {
        this.express = express();
        this.express.set("etag", "strong");
        this.initMiddlewares();
        this.initRoutes();
    }

    public getExpressApp(): express.Application {
        return this.express;
    }

    private initMiddlewares(): void {
        this.express.use(cors());
        this.express.use(bodyParser.json());
    }

    private initRoutes(): void {
        this.express.all("*", (req: express.Request, res: express.Response) => {
            res.status(200).json({message: "App under development"});
        });
    }

}

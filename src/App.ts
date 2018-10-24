import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { MongooseClient } from "./controllers/MongooseClient";
import { IUserDocument } from "./models/User";
import { AbstractRouter } from "./routes/AbstractRouter";
import { ComicRouter } from "./routes/ComicRouter";
import { UserRouter } from "./routes/UserRouter";

interface IJWTPayload {
    iat: number;
    name: string;
    sub: string;
}

export class App {

    private express: express.Application;
    private routers: AbstractRouter[];

    public constructor() {
        this.routers = [];
        this.express = express();
        this.express.set("etag", "strong");
        this.initMiddlewares();
        this.initRoutes();
    }

    public getExpressApp(): express.Application {
        return this.express;
    }

    // tslint:disable-next-line:max-line-length
    private async checkAuthorization(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            if (req.headers.authorization !== undefined) {
                // get JWT from Authorization header (must be like 'Bearer <value>')
                const token: string = req.headers.authorization.trim().substring(7);
                // check JWT validity
                const jwtPayloadBase64: string = token.split(".")[1];
                const buffer: Buffer = Buffer.from(jwtPayloadBase64, "base64");
                const payload: IJWTPayload = JSON.parse(buffer.toString("ascii"));
                const userId: string = payload.sub;
                // get user
                const user: IUserDocument = await MongooseClient.getInstance().getUserModel().findById(userId).exec();
                // set user into 'res.locals.user'
                res.locals.user = user;
            } else {
                res.locals.user = undefined;
            }
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    private initMiddlewares(): void {
        // set CORS
        this.express.use(cors());
        // set JSON parsing of body
        this.express.use(bodyParser.json());
        // set JSON as preferred type of response
        this.express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.set("Content-Type", "application/json");
            next();
        });
        // set pagination
        this.express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.locals.ITEM_PER_PAGE = 50;
            next();
        });
        // check authorization
        this.express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.checkAuthorization(req, res, next);
        });
    }

    private initRoutes(): void {
        // create routers
        this.routers.push(new UserRouter());
        this.routers.push(new ComicRouter());
        // map of routers by iterating this.rating
        this.routers.forEach((router: AbstractRouter) => {
            this.express.use(
                router.getMountEntrypoint(),
                router.getRouter()
            );
        });
        // not found response
        this.express.all("*", (req: express.Request, res: express.Response) => {
            res.status(404).json({ message: "Resource not found" });
        });
    }

}

import { Router } from "express";

export abstract class AbstractRouter {

    protected mountEntrypoint: string;
    protected router: Router;

    public constructor() {
        this.setMountEntrypoint();
        this.router = Router();
        this.listen();
    }

    public getMountEntrypoint(): string {
        return this.mountEntrypoint;
    }

    public getRouter(): Router {
        return this.router;
    }

    protected abstract listen(): void;

    protected abstract setMountEntrypoint(): void;

}

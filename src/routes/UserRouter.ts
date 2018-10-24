import { Request, Response } from "express";
import { AbstractRouter } from "./AbstractRouter";

export class UserRouter extends AbstractRouter {

    protected listen(): void {
        this.router.get("/", (req: Request, res: Response) => this.getAllUsers(req, res));
        this.router.post("/", (req: Request, res: Response) => this.createUser(req, res));
        this.router.get("/:id", (req: Request, res: Response) => this.getUser(req, res));
        this.router.get("/me", (req: Request, res: Response) => this.getMe(req, res));
        this.router.post("/:id/change_password", (req: Request, res: Response) => this.changePassword(req, res));
        this.router.delete("/:id", (req: Request, res: Response) => this.removeUser(req, res));
        this.router.put("/:id", (req: Request, res: Response) => this.editUser(req, res));
    }

    protected setMountEntrypoint(): void {
        this.mountEntrypoint = "/users";
    }

    private changePassword(req: Request, res: Response): void {
        // an user can perform this call only if requested id is itself
        // TODO
    }

    private createUser(req: Request, res: Response): void {
        // TODO
    }

    private editUser(req: Request, res: Response): void {
        // only an user that is ADMINISTRATOR can do this, password cannot be changed
        // TODO
    }

    private getAllUsers(req: Request, res: Response): void {
        // only an user that is ADMINISTRATOR can receive response
        // TODO
    }

    private getMe(req: Request, res: Response): void {
        // TODO
    }

    private getUser(req: Request, res: Response): void {
        // an user can perform this call only if requested id is itself
        // TODO
    }

    private removeUser(req: Request, res: Response): void {
        // only an user that is ADMINISTRATOR can do this
        // TODO
    }

}

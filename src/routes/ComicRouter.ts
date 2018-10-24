import { Request, Response } from "express";
import { Model, Query } from "mongoose";
import { MongooseClient } from "../controllers/MongooseClient";
import { IComicDocument } from "../models/Comic";
import { IUserDocument } from "../models/User";
import { AbstractRouter } from "./AbstractRouter";

export class ComicRouter extends AbstractRouter {

    protected listen(): void {
        this.router.get("/", (req: Request, res: Response) => this.getAllComics(req, res));
        this.router.post("/", (req: Request, res: Response) => this.createComic(req, res));
        this.router.get("/:id", (req: Request, res: Response) => this.getComic(req, res));
        this.router.post("/:id/add_to_wishlist", (req: Request, res: Response) => this.addComicToWishlist(req, res));
        this.router.post("/:id/purchase", (req: Request, res: Response) => this.purchaseComic(req, res));
        this.router.delete("/:id", (req: Request, res: Response) => this.removeComic(req, res));
        this.router.put("/:id", (req: Request, res: Response) => this.editComic(req, res));
    }

    protected setMountEntrypoint(): void {
        this.mountEntrypoint = "/comics";
    }

    private async addComicToWishlist(req: Request, res: Response): Promise<void> {
        // only a logged user can perform this action
        try {

            if (res.locals.user === undefined) {
                throw new Error("Unauthorized");
            }

            // read comic id from url
            const requestedId: string = req.params.id;

            // search comic and check if exists
            const comicModel: Model<IComicDocument> = MongooseClient.getInstance().getComicModel();
            const comicFromDb = await comicModel.findById(requestedId).exec();
            if (comicFromDb === null) {
                throw new Error("Requested comic id does not exists");
            }

            // push comic into user wishlist
            const userModel: Model<IUserDocument> = MongooseClient.getInstance().getUserModel();
            const currentUser: IUserDocument = await userModel.findById(res.locals.user._id.toString());
            currentUser.comics_to_buy.push(comicFromDb._id.toString());
            await currentUser.save();

            res.json({ message: "Comic added to user wishlist" });
        } catch (err) {

            console.error(err);
            if (err.message === "Unauthorized") {
                res.status(403).json({ message: "Unauthorized" });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }

        }
    }

    private async createComic(req: Request, res: Response): Promise<void> {
        // only an ADMINISTRATOR can perform this operation
        try {

            if (res.locals.user === undefined) {
                throw new Error("Unauthorized");
            }
            if (!res.locals.user.is_admin) {
                throw new Error("Unauthorized");
            }

            const comicModel: Model<IComicDocument> = MongooseClient.getInstance().getComicModel();
            const newComic: IComicDocument = new comicModel(req.body);
            await newComic.save();

            res.json({
                created_id: newComic._id,
                message: "Comic created"
            });
        } catch (err) {

            console.error(err);
            if (err.message === "Unauthorized") {
                res.status(403).json({ message: "Unauthorized" });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }

        }
    }

    private async editComic(req: Request, res: Response): Promise<void> {
        // only an ADMINISTRATOR can perform this operation
        try {

            if (res.locals.user === undefined) {
                throw new Error("Unauthorized");
            }
            if (!res.locals.user.is_admin) {
                throw new Error("Unauthorized");
            }

            const comicModel: Model<IComicDocument> = MongooseClient.getInstance().getComicModel();
            await comicModel.findByIdAndUpdate(req.params.id, req.body).exec();

            res.json({ message: "Comic updated" });

        } catch (err) {

            console.error(err);
            if (err.message === "Unauthorized") {
                res.status(403).json({ message: "Unauthorized" });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }

        }
    }

    private async getAllComics(req: Request, res: Response): Promise<void> {

        try {

            const comicModel: Model<IComicDocument> = MongooseClient.getInstance().getComicModel();

            // check filters
            const page: number = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const title: string = req.query.title ? req.query.title : undefined;
            const publisher: string = req.query.publisher ? req.query.publisher : undefined;
            const authors: string[] = req.query.authors ? req.query.authors.split(",") : undefined;
            const fromDate: Date = req.query.from_date ? new Date(req.query.from_date) : undefined;
            const toDate: Date = req.query.to_date ? new Date(req.query.to_date) : undefined;
            const priceLessThan: number = req.query.price_less_than ? parseFloat(req.query.price_less_than) : undefined;
            const priceGreaterThan: number = req.query.price_greater_than ? parseFloat(
                req.query.price_greater_than) : undefined;

            // init query objects
            const query: Query<IComicDocument[]> = comicModel.find({});
            const countQuery: Query<IComicDocument[]> = comicModel.find({});

            // use filters if needed
            if (title !== undefined) {
                const titleRegex: RegExp = new RegExp(title, "i");
                query.where("title").regex(titleRegex);
                countQuery.where("title").regex(titleRegex);
            }
            if (publisher !== undefined) {
                const publisherRegex: RegExp = new RegExp(publisher, "i");
                query.where("publisher").regex(publisherRegex);
                countQuery.where("publisher").regex(publisherRegex);
            }
            if (authors !== undefined) {
                query.where("authors").elemMatch({ $in: authors });
                countQuery.where("authors").elemMatch({ $in: authors });
            }
            if (fromDate !== undefined) {
                query.find({ publish_date: { $gte: fromDate } });
                countQuery.find({ publish_date: { $gte: fromDate } });
            }
            if (toDate !== undefined) {
                query.find({ publish_date: { $lte: fromDate } });
                countQuery.find({ publish_date: { $lte: fromDate } });
            }
            if (priceLessThan !== undefined) {
                query.where("price").lte(priceLessThan);
                countQuery.where("price").lte(priceLessThan);
            }
            if (priceGreaterThan !== undefined) {
                query.where("price").gte(priceGreaterThan);
                countQuery.where("price").gte(priceGreaterThan);
            }

            // count objects and use page filter
            const totalNumberOfComics: number = await countQuery.count();
            const totalPages: number = Math.ceil(totalNumberOfComics / res.locals.ITEM_PER_PAGE);
            let currentPage: number = 1;
            if (page !== undefined) {
                currentPage = page > totalPages ? totalPages : page;
            }

            // return object
            const comicsToReturn: IComicDocument[] = await query
                .skip((page - 1) * res.locals.ITEM_PER_PAGE).limit(res.locals.ITEM_PER_PAGE).exec();

            res.json({
                comics: comicsToReturn,
                page: currentPage,
                pages: totalNumberOfComics
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }

    }

    private async getComic(req: Request, res: Response): Promise<void> {
        // PUBLIC METHOD

        try {

            // get comic model
            const comicModel: Model<IComicDocument> = MongooseClient.getInstance().getComicModel();

            // find by id
            const result: IComicDocument = await comicModel.findById(req.params.id).exec();

            // response
            res.json(result.toObject());

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }

    }

    private async purchaseComic(req: Request, res: Response): Promise<void> {
        // only a logged user can perform this action
        try {

            // check user login
            if (res.locals.user === undefined) {
                throw new Error("Unauthorized");
            }

            // get comic id
            const comicId: string = req.params.id;

            // get user from db
            const userModel: Model<IUserDocument> = MongooseClient.getInstance().getUserModel();
            const currentUser: IUserDocument = await userModel.findById(res.locals.user._id.toString());

            // add comic in purchased list
            currentUser.purchased_comics.push(comicId);

            // remove comic from wishlist if is in
            if (currentUser.comics_to_buy.indexOf(comicId) !== -1) {
                currentUser.comics_to_buy.splice(
                    currentUser.comics_to_buy.indexOf(comicId),
                    1
                );
            }

            // update user data in database
            await currentUser.save();

            // response
            res.json({ message: "Comic purchased" });

        } catch (err) {

            console.error(err);
            if (err.message === "Unauthorized") {
                res.status(403).json({ message: "Unauthorized" });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }

        }
    }

    private async removeComic(req: Request, res: Response): Promise<void> {
        // only an ADMINISTRATOR can perform this operation
        try {

            if (res.locals.user === undefined) {
                throw new Error("Unauthorized");
            }
            if (!res.locals.user.is_admin) {
                throw new Error("Unauthorized");
            }

            const comicModel: Model<IComicDocument> = MongooseClient.getInstance().getComicModel();
            await comicModel.findByIdAndRemove(req.params.id).exec();

            res.json({ message: "Comic deleted" });

        } catch (err) {

            console.error(err);
            if (err.message === "Unauthorized") {
                res.status(403).json({ message: "Unauthorized" });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }

        }
    }

}

import * as mongoose from "mongoose";
import { ComicModel, IComicDocument } from "../models/Comic";
import { ISaltDocument, SaltModel } from "../models/Salt";
import { IUserDocument, UserModel } from "../models/User";

export class MongooseClient {

    public static getInstance(): MongooseClient {
        if (MongooseClient.instance === undefined) {
            MongooseClient.instance = new MongooseClient();
        }
        return MongooseClient.instance;
    }

    private static instance: MongooseClient;

    private userModel: mongoose.Model<IUserDocument>;
    private saltModel: mongoose.Model<ISaltDocument>;
    private comicModel: mongoose.Model<IComicDocument>;

    private constructor() {
        // init models
        this.userModel = UserModel;
        this.comicModel = ComicModel;
        this.saltModel = SaltModel;
    }

    public async connect(): Promise<void> {

        if (
            !process.env.MONGO_HOST ||
            !process.env.MONGO_PORT ||
            !process.env.MONGO_DB ||
            !process.env.MONGO_USER ||
            !process.env.MONGO_PASSWORD
        ) {
            throw new Error(
                "MongooseClient requires env var: MONGO_HOST, MONGO_PORT, MONGO_DB, MONGO_USER, MONGO_PASSWORD"
            );
        }
        const user: string = process.env.MONGO_USER;
        const password: string = process.env.MONGO_PASSWORD;
        const host: string = process.env.MONGO_HOST;
        const port: string = process.env.MONGO_PORT;
        const db: string = process.env.MONGO_DB;

        if (process.env.NODE_ENV === "test") {
            await mongoose.connect(
                `mongodb://${host}:${port}/${db}`,
                { useNewUrlParser: true }
            );
        } else {
            await mongoose.connect(
                `mongodb://${user}:${password}@${host}:${port}/${db}`,
                { useNewUrlParser: true }
            );
        }

    }

    public getUserModel(): mongoose.Model<IUserDocument> {
        return this.userModel;
    }

    public getComicModel(): mongoose.Model<IComicDocument> {
        return this.comicModel;
    }

    public getSaltModel(): mongoose.Model<ISaltDocument> {
        return this.saltModel;
    }

}

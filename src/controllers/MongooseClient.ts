import * as mongoose from "mongoose";

export class MongooseClient {

    public static getInstance(): MongooseClient {
        if (MongooseClient.instance !== undefined) {
            MongooseClient.instance = new MongooseClient();
        }
        return MongooseClient.instance;
    }

    private static instance: MongooseClient;

    private constructor() {
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
        mongoose.connect(`mongodb://${user}:${password}@${host}:${port}/${db}`);
    }

}

import * as crypto from "crypto";
import { Document, model, Model, Schema, SchemaTypes } from "mongoose";

const generateSalt = (): string => {
    const buff: Buffer = crypto.randomBytes(16);
    return buff.toString("hex");
};

const saltSchema: Schema = new Schema({
    salt_1: {
        set: generateSalt,
        type: String,
    },
    salt_2: {
        set: generateSalt,
        type: String
    },
    user_id: {
        required: true,
        type: SchemaTypes.ObjectId
    }
});

export interface ISaltDocument extends Document {
    salt_1: string;
    salt_2: string;
    user_id: Schema.Types.ObjectId;
}

export const SaltModel: Model<ISaltDocument> = model("Salt", saltSchema);

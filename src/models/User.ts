import { Document, model, Model, Schema, SchemaTypes } from "mongoose";

const userSchema: Schema = new Schema({
    comics_to_buy: {
        required: true,
        type: [SchemaTypes.ObjectId]
    },
    is_admin: {
        required: false,
        type: Boolean
    },
    nickname: {
        required: true,
        type: String,
        unique: true
    },
    password_hash: {
        required: true,
        type: String
    },
    purchased_comics: {
        required: true,
        type: [SchemaTypes.ObjectId]
    }
});

export interface IUserDocument extends Document {
    comics_to_buy: Schema.Types.ObjectId[];
    is_admin?: boolean;
    nickname: string;
    password_hash: string;
    purchased_comics: Schema.Types.ObjectId[];
}

export const UserModel: Model<IUserDocument> = model("User", userSchema);

import { Document, model, Model, Schema } from "mongoose";

const userSchema: Schema = new Schema({
    comics_to_buy: {
        ref: "Comic",
        required: true,
        type: [Schema.Types.ObjectId]
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
        ref: "Comic",
        required: true,
        type: [Schema.Types.ObjectId]
    }
});

export interface IUserDocument extends Document {
    comics_to_buy: string[];
    is_admin?: boolean;
    nickname: string;
    password_hash: string;
    purchased_comics: string[];
}

export const UserModel: Model<IUserDocument> = model("User", userSchema);

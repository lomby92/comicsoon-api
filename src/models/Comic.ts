import { Document, model, Model, Schema, SchemaTypes } from "mongoose";

const priceValidation = (p: number): boolean => {
    return p > 0;
};

const comicSchema: Schema = new Schema({
    authors: {
        required: true,
        type: [String]
    },
    description: {
        required: false,
        type: String
    },
    images: {
        required: false,
        type: [String]
    },
    link: {
        required: false,
        type: String
    },
    price: {
        required: true,
        type: Number,
        validate: priceValidation
    },
    publish_date: {
        required: true,
        type: Date
    },
    publisher: {
        required: true,
        type: String
    },
    title: {
        required: true,
        type: String,
        unique: true
    }
});

export interface IComicDocument extends Document {
    authors: string[];
    description?: string;
    images?: string[];
    link?: string;
    price: number;
    publish_date: Date;
    publisher: string;
    title: string;
}

export const ComicModel: Model<IComicDocument> = model("Comic", comicSchema);

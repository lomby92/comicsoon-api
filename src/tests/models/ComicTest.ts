import { expect } from "chai";
import * as mongoose from "mongoose";
import { IComicDocument } from "../../models/Comic";
import { MongooseClient } from "./../../controllers/MongooseClient";

describe("Comic model test", () => {

    const Comic: mongoose.Model<IComicDocument> = MongooseClient.getInstance().getComicModel();

    before(async () => {
        // clean all remaining data
        await Comic.remove({}).exec();
    });

    afterEach(async () => {
        // clear all edit
        await Comic.remove({}).exec();
    });

    it("create comic", async () => {
        const newComic: IComicDocument = new Comic({
            authors: ["Roberto Recchioni"],
            description: "L'inizio di un nuovo ciclo nella vita di Dylan",
            images: [""],
            link: "",
            price: 3.5,
            publish_date: new Date("2019-03-28T06:00:00.000Z"),
            publisher: "sergio bonelli editore",
            title: "Dylan Dog 400, Il nome nei sogni"
        });
        await newComic.save();
        const allComics: IComicDocument[] = await Comic.find({}).exec();
        expect(allComics).to.have.length(1);
        expect(allComics[0].price).to.be.equal(3.5);
        expect(allComics[0].publisher).to.be.equal("sergio bonelli editore");
    });

    it("create a comic with empty authors", async () => {
        const newComic: IComicDocument = new Comic({
            authors: [],
            description: "L'inizio di un nuovo ciclo nella vita di Dylan",
            images: [""],
            link: "",
            price: 3.5,
            publish_date: new Date("2019-03-28T06:00:00.000Z"),
            publisher: "sergio bonelli editore",
            title: "Dylan Dog 400, Il nome nei sogni"
        });
        await newComic.save();
        const allComics: IComicDocument[] = await Comic.find({}).exec();
        expect(allComics).to.have.length(1);
        expect(allComics[0].price).to.be.equal(3.5);
        expect(allComics[0].publisher).to.be.equal("sergio bonelli editore");
    });

    it("create a comic without link, images and description", async () => {
        const newComic: IComicDocument = new Comic({
            authors: ["Roberto Recchioni"],
            price: 3.5,
            publish_date: new Date("2019-03-28T06:00:00.000Z"),
            publisher: "sergio bonelli editore",
            title: "Dylan Dog 400, Il nome nei sogni"
        });
        await newComic.save();
        const allComics: IComicDocument[] = await Comic.find({}).exec();
        expect(allComics).to.have.length(1);
        expect(allComics[0].price).to.be.equal(3.5);
        expect(allComics[0].publisher).to.be.equal("sergio bonelli editore");
    });

    it("create a comic without title", async () => {
        let errorThrowed: boolean;
        let errorMessae: string;
        try {
            const newComic: IComicDocument = new Comic({
                authors: ["Roberto Recchioni"],
                description: "L'inizio di un nuovo ciclo nella vita di Dylan",
                images: [""],
                link: "",
                price: 3.5,
                publish_date: new Date("2019-03-28T06:00:00.000Z"),
                publisher: "sergio bonelli editore"
            });
            await newComic.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessae = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            expect(errorMessae).to.be.equal("Comic validation failed: title: Path `title` is required.");
            const allComics: IComicDocument[] = await Comic.find({}).exec();
            expect(allComics).to.have.length(0);
        }
    });

    it("create a comic without publisher", async () => {
        let errorThrowed: boolean;
        let errorMessae: string;
        try {
            const newComic: IComicDocument = new Comic({
                authors: ["Roberto Recchioni"],
                description: "L'inizio di un nuovo ciclo nella vita di Dylan",
                images: [""],
                link: "",
                price: 3.5,
                publish_date: new Date("2019-03-28T06:00:00.000Z"),
                title: "Dylan Daog 400"
            });
            await newComic.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessae = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            expect(errorMessae).to.be.equal("Comic validation failed: publisher: Path `publisher` is required.");
            const allComics: IComicDocument[] = await Comic.find({}).exec();
            expect(allComics).to.have.length(0);
        }
    });

    it("create a comic without price", async () => {
        let errorThrowed: boolean;
        let errorMessae: string;
        try {
            const newComic: IComicDocument = new Comic({
                authors: ["Roberto Recchioni"],
                description: "L'inizio di un nuovo ciclo nella vita di Dylan",
                images: [""],
                link: "",
                publish_date: new Date("2019-03-28T06:00:00.000Z"),
                publisher: "sergio bonelli editore",
                title: "Dylan Dog 400"
            });
            await newComic.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessae = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            expect(errorMessae).to.be.equal("Comic validation failed: price: Path `price` is required.");
            const allComics: IComicDocument[] = await Comic.find({}).exec();
            expect(allComics).to.have.length(0);
        }
    });

    it("create a comic with already existing title", async () => {
        let errorThrowed: boolean;
        let errorMessae: string;
        try {
            const newComic: IComicDocument = new Comic({
                authors: ["Roberto Recchioni"],
                description: "L'inizio di un nuovo ciclo nella vita di Dylan",
                images: [""],
                link: "",
                price: 3.5,
                publish_date: new Date("2019-03-28T06:00:00.000Z"),
                publisher: "sergio bonelli editore",
                title: "Dylan Dog 400"
            });
            await newComic.save();
            const newComicCopied: IComicDocument = new Comic({
                authors: ["Roberto Recchioni"],
                description: "Un secondo nuovo inizio",
                images: [""],
                link: "",
                price: 3.5,
                publish_date: new Date("2019-03-28T06:00:00.000Z"),
                publisher: "sergio bonelli editore",
                title: "Dylan Dog 400"
            });
            await newComicCopied.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessae = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            expect(errorMessae).to.be.equal(
                'E11000 duplicate key error collection: comicsoon.comics index: title_1 dup key: { : "Dylan Dog 400" }'
            );
            const allComics: IComicDocument[] = await Comic.find({}).exec();
            expect(allComics).to.have.length(1);
            expect(allComics[0].description).to.be.equal("L'inizio di un nuovo ciclo nella vita di Dylan");
        }
    });

});

import { expect } from "chai";
import * as mongoose from "mongoose";
import { ISaltDocument } from "../../models/Salt";
import { IUserDocument } from "../../models/User";
import { MongooseClient } from "./../../controllers/MongooseClient";

describe("Salt model test", () => {

    const Salt: mongoose.Model<ISaltDocument> = MongooseClient.getInstance().getSaltModel();
    const User: mongoose.Model<IUserDocument> = MongooseClient.getInstance().getUserModel();

    before(async () => {
        // connect
        await MongooseClient.getInstance().connect();
        // clean all remaining data
        await Salt.remove({}).exec();
        await User.remove({}).exec();
    });

    afterEach(async () => {
        // clear all edit
        await Salt.remove({}).exec();
        await User.remove({}).exec();
    });

    it("create salt passing user_id only", async () => {
        // create a new user
        const user = new User({
            nickname: "Franco777"
        });
        const userId: mongoose.Schema.Types.ObjectId = user._id;
        // create salt
        const newSalt = new Salt({
            user_id: userId
        });
        await newSalt.save();
        // check salt values
        const searchResult: ISaltDocument[] = await Salt.find({ user_id: userId }).lean().exec();
        expect(searchResult).to.have.length(1);
        expect(searchResult[0]).to.haveOwnProperty("salt_1");
        expect(searchResult[0]).to.haveOwnProperty("salt_2");
        expect(searchResult[0].salt_1).to.have.length(32);
        expect(searchResult[0].salt_2).to.have.length(32);
    });

    it("create salt without passing any data", async () => {
        let errorThrowed: boolean;
        let errorMessage: string;
        try {
            // create a new user
            const user = new User({
                nickname: "TheUserThatNotExists"
            });
            const userId: mongoose.Schema.Types.ObjectId = user._id;
            // create salt
            const newSalt = new Salt({});
            await newSalt.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessage = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            expect(errorMessage).to.be.equal("Salt validation failed: user_id: Path `user_id` is required.");
            const searchResult: ISaltDocument[] = await Salt.find({}).lean().exec();
            expect(searchResult).to.have.length(0);
        }

    });

});

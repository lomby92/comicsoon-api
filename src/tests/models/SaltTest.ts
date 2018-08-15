import {expect} from "chai";
import * as mongoose from "mongoose";
import { ISaltDocument } from "../../models/Salt";
import { IUserDocument } from "../../models/User";
import { MongooseClient } from "./../../controllers/MongooseClient";

describe("Salt test", () => {

    it("create salt passing user_id only", async () => {
        const Salt: mongoose.Model<ISaltDocument> =  MongooseClient.getInstance().getSaltModel();
        const User: mongoose.Model<IUserDocument> = MongooseClient.getInstance().getUserModel();
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
        const searchResult = Salt.find({user_id: userId});
        expect(searchResult).to.have.length(1);
        expect(searchResult[0]).to.have.keys(["salt_1", "salt_2"]);
        expect(searchResult[0].salt_1).to.have.length(32);
        expect(searchResult[0].salt_2).to.have.length(32);
    });

});

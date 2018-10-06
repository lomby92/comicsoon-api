import { expect } from "chai";
import * as mongoose from "mongoose";
import { MongooseClient } from "../../controllers/MongooseClient";
import { IUserDocument } from "../../models/User";

describe("User model test", () => {

    const User: mongoose.Model<IUserDocument> = MongooseClient.getInstance().getUserModel();

    before(async () => {
        // clean all remaining data
        await User.remove({}).exec();
    });

    afterEach(async () => {
        // clear all edit
        await User.remove({}).exec();
    });

    it("create user", async () => {
        // create a new user
        const user = new User({
            comics_to_buy: [],
            nickname: "Franco777",
            password_hash: "somefakehash",
            purchased_comics: []
        });
        await user.save();
        const users: IUserDocument[] = await User.find({}).lean().exec();
        expect(users).to.have.length(1);
        expect(users[0]).to.haveOwnProperty("nickname");
        expect(users[0].nickname).to.be.equal("Franco777");
        expect(users[0]).to.haveOwnProperty("password_hash");
        expect(users[0]).to.haveOwnProperty("comics_to_buy");
        expect(users[0]).to.haveOwnProperty("purchased_comics");
    });

    it("create user without username", async () => {
        let errorThrowed: boolean;
        let errorMessage: string;
        try {
            const user = new User({
                comics_to_buy: [],
                password_hash: "somefakehash",
                purchased_comics: []
            });
            await user.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessage = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            expect(errorMessage).to.be.equal("User validation failed: nickname: Path `nickname` is required.");
            const users: IUserDocument[] = await User.find({}).lean().exec();
            expect(users).to.have.length(0);
        }
    });

    it("create user with nickname that already exists", async () => {
        let errorThrowed: boolean;
        let errorMessage: string;
        try {
            // add existing user
            const alreadyExistingUser: IUserDocument = new User({
                comics_to_buy: [],
                nickname: "AlreadyExistingName",
                password_hash: "somefakehash",
                purchased_comics: []
            });
            await alreadyExistingUser.save();
            // try to add another user wit same nickname
            const user = new User({
                comics_to_buy: [],
                nickname: "AlreadyExistingName",
                password_hash: "secondfakehash",
                purchased_comics: []
            });
            await user.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessage = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            // tslint:disable-next-line:max-line-length
            expect(errorMessage).to.be.equal("E11000 duplicate key error collection: comicsoon.users index: nickname_1 dup key: { : \"AlreadyExistingName\" }");
            const users: IUserDocument[] = await User.find({}).lean().exec();
            expect(users).to.have.length(1);
            expect(users[0].nickname).to.be.equal("AlreadyExistingName");
            expect(users[0].password_hash).to.be.equal("somefakehash");
        }
    });

    it("create user without any field", async () => {
        let errorThrowed: boolean;
        let errorMessage: string;
        try {
            const user = new User({});
            await user.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessage = err.message;
        } finally {
            expect(errorThrowed).to.be.true;
            // tslint:disable-next-line:max-line-length
            expect(errorMessage).to.be.equal("User validation failed: password_hash: Path `password_hash` is required., nickname: Path `nickname` is required.");
            const users: IUserDocument[] = await User.find({}).lean().exec();
            expect(users).to.have.length(0);
        }
    });

    it("create user without comics_to_buy and purchased_comics", async () => {
        let errorThrowed: boolean;
        let errorMessage: string;
        try {
            const user = new User({
                nickname: "Scrooge94",
                password_hash: "somefakehash"
            });
            await user.save();
            errorThrowed = false;
        } catch (err) {
            errorThrowed = true;
            errorMessage = err.message;
        } finally {
            expect(errorThrowed).to.be.false;
            expect(errorMessage).to.be.undefined;
            const users: IUserDocument[] = await User.find({}).lean().exec();
            expect(users).to.have.length(1);
            expect(users[0].nickname).to.be.equal("Scrooge94");
            expect(users[0]).to.haveOwnProperty("purchased_comics");
            expect(users[0]).to.haveOwnProperty("comics_to_buy");
            expect(users[0].comics_to_buy).to.have.length(0);
            expect(users[0].purchased_comics).to.have.length(0);
        }
    });

});

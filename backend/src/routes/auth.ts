import express, { Request, Response, Router } from "express";
import { hashPassword } from "../utils/hash-password";
import { collections } from "../services/database";
import { accountSchema } from "../models/Account";
import { Account } from "../models/Account";
import { UserPayload, generateJwt } from "../utils/jwt-provider";

export const authRouter = Router();
authRouter.use(express.json());

/*
    * POST /signup
    * Creates a new user account
    * Returns 200 if the account is created
    * Returns 400 if the account body is invalid
    * Returns 409 if the account already exists
    * Returns 500 if there is an error
*/
authRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        const { error } = accountSchema.validate(req.body);
        if (error) {
            res.status(400).send({ message: "Invalid account body" });
            return;
        }

        const account: Account = req.body
        const existingUsername = await collections.accounts.findOne({
            username: account.username
        });

        // if username already exists, return 409
        if (existingUsername) {
            res.status(409).send({ message: "Username already exists" });
            return;
        }

        let hashedPassword = hashPassword(account.password);


        const result = await collections.accounts.insertOne(
            {
                username: account.username,
                password: hashedPassword
            }
        );

        if (result.acknowledged) {
            res.status(201).send({ message: "Account created successfully!" });
        } else {
            res.status(500).send({ message: "Failed to create shorten link" });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/*
    * POST /login
    * Logs in a user
    * Returns 200 if the account is logged in
    * Returns 400 if the account body is invalid
    * Returns 401 if the account does not exist
    * Returns 403 if the password is incorrect
    * Returns 500 if there is an error
*/
authRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { error } = accountSchema.validate(req.body);
        if (error) {
            res.status(400).send({ message: "Invalid account body" });
            return;
        }

        const account: Account = req.body
        const user = await collections.accounts.findOne({
            username: account.username,
            password: hashPassword(account.password)
        });

        // if username does not exist, return 401
        if (!user) {
            res.status(401).send({ message: "Invalid username or password" });
            return;
        }

        let userPayload: UserPayload = {
            id: user._id.toString(),
            username: user.username
        }
        let authToken = generateJwt(userPayload)
        res.status(200).send({ message: authToken });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
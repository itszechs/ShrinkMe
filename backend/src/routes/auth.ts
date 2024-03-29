import express, { Request, Response, Router } from "express";
import { hashPassword } from "../utils/hash-password";
import { collections } from "../services/database";
import { accountSchema, loginSchema } from "../models/Account";
import { Account } from "../models/Account";
import { UserPayload, generateJwt } from "../utils/jwt-provider";
import { validateHeader } from "../utils/validate-headers";

export const authRouter = Router();
authRouter.use(express.json());

/*
    * POST /token
    * Check if token is valid or not
*/
authRouter.post("/token", [validateHeader], async (_: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Token is valid" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


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
                firstName: account.firstName,
                lastName: account.lastName,
                username: account.username,
                password: hashedPassword
            }
        );

        if (result.acknowledged) {
            let userPayload: UserPayload = {
                id: result.insertedId.toString(),
                username: account.username
            }
            let authToken = generateJwt(userPayload)
            res.status(201).send({ message: authToken });
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
        const { error } = loginSchema.validate(req.body);
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
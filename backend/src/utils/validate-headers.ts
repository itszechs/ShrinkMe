import { NextFunction, Response } from "express";
import { validateJwt } from "./jwt-provider";

export const validateHeader = (req: any, res: Response, next: NextFunction) => {
    const bearerToken = req.header("Authorization");
    if (!bearerToken) {
        res.status(400).send({
            error: "Authorization header not provided",
        });
        return;
    }
    try {
        const token = bearerToken.split(" ")[1];
        const payload = validateJwt(token);
        req.userId = payload["id"];
        req.username = payload["username"];
        next();
    } catch (err) {
        console.error(err);
        res.status(401).send({
            error: "Invalid Authorization Header",
        });
    }
};
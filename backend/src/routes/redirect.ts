import express, { Request, Response, Router } from "express";
import { collections } from "../services/database";

export const redirectRouter = Router();
redirectRouter.use(express.json());

redirectRouter.get("/:shortenUrl", async (req: Request, res: Response) => {
    try {
        const shortenUrl = req?.params?.shortenUrl;
        const query = { shortenUrl: shortenUrl };
        const link = await collections.links.findOne(query);

        if (link) {
            res.redirect(link.originalUrl);
        } else {
            res.status(404).send({ message: "Link does not exist" });
        }

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

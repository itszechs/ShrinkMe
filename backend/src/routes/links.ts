import express, { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database";
import { Link, linkSchema } from "../models/Link";
import { generateShortenLink } from "../utils/link-generator";

export const linksRouter = Router();
linksRouter.use(express.json());

/*
    * GET /links
    * Returns all links in the database
*/
linksRouter.get("/", async (_req: Request, res: Response) => {
    try {
        const links = await collections.links.find({}).toArray();
        res.status(200).send(links);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/*
    * GET /links/:id
    * Returns a single link by ID
    * Returns 404 if the link is not found
*/
linksRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const link = await collections.links.findOne(query);

        if (link) {
            res.status(200).send(link);
        } else {
            res.status(404).send({ message: "Link does not exist" });
        }

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/*
    * POST /links
    * Creates a new link
    * Returns 201 if the link is created
    * Returns 400 if the link body is invalid
*/
linksRouter.post("/", async (req: Request, res: Response) => {
    try {
        const { error } = linkSchema.validate(req.body);
        if (error) {
            res.status(400).send({ message: "Invalid link body" });
            return;
        }

        const link: Link = req.body
        const links = await collections.links.find({}).toArray();

        const existingLink = await collections.links.findOne({
            originalUrl: link.originalUrl
        });

        // if link has already been shortened, and shortenUrl is not provided,
        // return the existing shortenUrl
        // otherwise, allow custom shortenUrl
        if (existingLink && link.shortenUrl !== undefined) {
            res.status(200).send({ message: existingLink.shortenUrl });
            return;
        }

        let generatedShortenUrl: string = ""

        if (link.shortenUrl === undefined) {
            generatedShortenUrl = generateShortenLink(links);
        } else {
            const existingLink = await collections.links.findOne({
                shortenUrl: link.shortenUrl
            });
            if (existingLink) {
                res.status(400).send({ message: "Shorten link already exists" });
                return;
            }
            generatedShortenUrl = link.shortenUrl
        }

        if (generatedShortenUrl === null || generatedShortenUrl === "") {
            res.status(500).send({ message: "Failed to create shorten link" });
            return;
        }

        const result = await collections.links.insertOne(
            {
                shortenUrl: generatedShortenUrl,
                originalUrl: link.originalUrl
            }
        );

        if (result.acknowledged) {
            res.status(201).send({ message: generatedShortenUrl });
        } else {
            res.status(500).send({ message: "Failed to create shorten link" });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/*
    * PUT /links/:id
    * Updates a link by ID
    * Returns 200 if the link is updated
    * Returns 404 if the link is not found
    * Returns 304 if the link is not updated
*/
linksRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = req?.params?.id;
        const link = req.body;
        const { error } = linkSchema.validate(link);

        if (error) {
            res.status(400).send({ message: "Invalid link body" });
            return;
        }

        const existingLink = await collections.links.findOne({
            shortenUrl: link.shortenUrl
        });

        if (existingLink) {
            res.status(400).send({ message: "Shorten link already exists" });
            return;
        }

        const query = { _id: new ObjectId(id) };
        const result = await collections.links.updateOne(query, { $set: link });

        if (result && result.matchedCount) {
            res.status(200).send({ message: "Updated an link" });
        } else if (!result.matchedCount) {
            res.status(404).send({ message: "Failed to find link" });
        } else {
            res.status(304).send({ message: "Failed to update link" });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/*
    * DELETE /links/:id
    * Deletes a link by ID
    * Returns 202 if the link is deleted
    * Returns 404 if the link is not found
*/
linksRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections.links.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send({ message: "Removed link" });
        } else if (!result) {
            res.status(400).send({ message: "Failed to remove link" });
        } else if (!result.deletedCount) {
            res.status(404).send({ message: "Failed to find link" });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
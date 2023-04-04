import express, { Request, Response, Router } from "express";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { collections } from "../services/database";
import { Link, linkSchema } from "../models/Link";
import { generateShortenLink } from "../utils/link-generator";
import { validateHeader } from "../utils/validate-headers";
import { validateJwt } from "../utils/jwt-provider";

export const linksRouter = Router();
linksRouter.use(express.json());

/*
    * GET /links
    * Returns all links in the database
*/
linksRouter.get("/", [validateHeader], async (req: any, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(400).send({ message: "Invalid user" });
            return;
        }
        const links = await collections.links.find({ userId: userId }).toArray();
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
linksRouter.get("/:id", [validateHeader], async (req: any, res: Response) => {
    try {
        if (!req.userId) {
            res.status(400).send({ message: "Invalid user" });
            return;
        }
        
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id), userId: req.userId };
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
        if (existingLink && link.shortenUrl === undefined) {
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

        const bearerToken = req.header("Authorization");
        let result: InsertOneResult<Link>

        if (bearerToken) {
            try {
                const token = bearerToken.split(" ")[1];
                const payload = validateJwt(token);
                const userId = payload["id"];
                const username = payload["username"];
                result = await collections.links.insertOne(
                    {
                        userId: userId,
                        username: username,
                        shortenUrl: generatedShortenUrl,
                        originalUrl: link.originalUrl
                    }
                );
            } catch (err) {
                console.error(err);
                res.status(401).send({
                    error: "Invalid Authorization Header",
                });
            }
        } else {
            result = await collections.links.insertOne(
                {
                    shortenUrl: generatedShortenUrl,
                    originalUrl: link.originalUrl
                }
            );
        }
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
        const bearerToken = req.header("Authorization");
        const { error } = linkSchema.validate(link);

        if (error) {
            res.status(400).send({ message: "Invalid link body" });
            return;
        }

        // Find the link by ID
        const existingLink = await collections.links.findOne(
            { _id: new ObjectId(id) }
        );

        // If the link is not found, return 404
        if (!existingLink) {
            res.status(404).send({ message: "Link does not exist" });
            return;
        }

        // Find shorten link by shortenUrl
        const existingShortenLink = await collections.links.findOne(
            { shortenUrl: link.shortenUrl }
        );

        // helper function to send response for "update"
        function handleSuccessResponse(_result: UpdateResult) {
            if (_result && _result.matchedCount) {
                res.status(200).send({ message: "Updated an link" });
            } else if (!_result.matchedCount) {
                res.status(404).send({ message: "Failed to find link" });
            } else {
                res.status(304).send({ message: "Failed to update link" });
            }
        }

        // If the link is found, and is public
        if (!existingLink.userId) {
            // Check if request shortenLink is already in use
            if (existingShortenLink) {
                res.status(400).send({ message: "Shorten link already exists" });
                return;
            }
            // Update the link
            const result = await collections.links.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        originalUrl: link.originalUrl,
                        shortenUrl: link.shortenUrl
                    }
                }
            );
            handleSuccessResponse(result);
        } else {
            // If the link is found, and is private
            if (!bearerToken) {
                res.status(401).send({ message: "Unauthorized" });
                return;
            }
            try {
                const token = bearerToken.split(" ")[1];
                const payload = validateJwt(token);
                const userId = payload["id"];

                // Check if the user is the owner of the link
                if (userId !== existingLink.userId) {
                    res.status(401).send({ message: "Unauthorized" });
                    return;
                }

                // Check if request shortenLink is already in use
                if (existingShortenLink) {
                    res.status(400).send({ message: "Shorten link already exists" });
                    return;
                }

                // Update the link
                const result = await collections.links.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            originalUrl: link.originalUrl,
                            shortenUrl: link.shortenUrl
                        }
                    }
                );
                handleSuccessResponse(result);
            } catch (err) {
                console.error(err);
                res.status(401).send({
                    error: "Invalid Authorization Header",
                });
            }
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
linksRouter.delete("/:id", [validateHeader], async (req: any, res: Response) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };

        // Find the link by ID
        const existingLink = await collections.links.findOne(query);

        if (!existingLink) {
            res.status(404).send({ message: "Link does not exist" });
            return;
        }

        // Check if the user is the owner of the link
        if (req.userId !== existingLink.userId) {
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

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
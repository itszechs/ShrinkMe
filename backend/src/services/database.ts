import { MongoClient, Collection, MongoServerError, Db } from "mongodb";
import { Link } from "../models/Link";
import { Account } from "../models/Account";

export const collections: {
    links?: Collection<Link>;
    accounts?: Collection<Account>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("ShrinkMe");
    await applySchemaValidation(db);

    const linksCollection = db.collection<Link>("links");
    collections.links = linksCollection;

    const accountsCollection = db.collection<Account>("accounts");
    collections.accounts = accountsCollection;
}

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["shortenUrl", "originalUrl"],
            additionalProperties: false,
            properties: {
                _id: {},
                shortenUrl: {
                    bsonType: "string",
                    description: "'shortenUrl' is required and is a string",
                },
                originalUrl: {
                    bsonType: "string",
                    description: "'originalUrl' is required and is a string",
                }
            },
        },
    };

    // Try applying the modification to the collection, if the collection doesn't exist, create it
    await db.command({
        collMod: "links",
        validator: jsonSchema
    }).catch(async (error: MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
            await db.createCollection("courses", { validator: jsonSchema });
        }
    });
}
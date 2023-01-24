import dotenv from "dotenv";
import cors from "cors";

import express, { Request, Response, NextFunction } from "express";
import { connectToDatabase } from "./services/database";
import { linksRouter } from "./routes/links";
import { redirectRouter } from "./routes/redirect";

// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();

const { ATLAS_URI } = process.env;

if (!ATLAS_URI) {
    console.error("No ATLAS_URI environment variable has been defined in config.env");
}

connectToDatabase(ATLAS_URI)
    .then(() => {
        const app = express();
        app.use(cors());

        app.listen(5500, () => {
            console.log(`Server running at http://localhost:5500`);
        });

        // Health check route
        app.get("/", (_req: Request, res: Response) => {
            res.send({
                message: "ShrinkMe api is running!",
            });
        });

        // Links routes
        app.use("/api/v1/links", linksRouter);

        // Redirect route
        app.use("/", redirectRouter);

        // Invalid route message
        app.use((_req: Request, res: Response, _next: NextFunction) => {
            res.status(404).send({
                error: "Not Found",
            });
        });

    })
    .catch(error => console.error(error));

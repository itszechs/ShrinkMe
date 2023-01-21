import express, { Request, Response, NextFunction } from "express";

const app = express();

app.listen(5500, () => {
    console.log(`Server running at http://localhost:5500`);
});

// Health check route
app.get("/", (_req: Request, res: Response) => {
    res.send({
        message: "ShrinkMe api is running!",
    });
});


// Invalid route message
app.use((_req: Request,  res: Response, _next : NextFunction) => {
    res.status(404).send({
        error: "Not Found",
    });
});
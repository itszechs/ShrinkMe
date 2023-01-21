import { ObjectId } from "mongodb";

export interface Link {
    shortenUrl: string;
    originalUrl: string;
    _id?: ObjectId;
}
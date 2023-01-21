import { ObjectId } from "mongodb";
import Joi from "joi";

export interface Link {
    shortenUrl: string;
    originalUrl: string;
    _id?: ObjectId;
}

export const linkSchema = Joi.object({
    shortenUrl: Joi.string().pattern(/^[a-zA-Z]+$/).required(),
    originalUrl: Joi.string().required(),
});

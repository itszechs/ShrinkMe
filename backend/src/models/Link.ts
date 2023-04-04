import { ObjectId } from "mongodb";
import Joi from "joi";

export interface Link {
    shortenUrl: string;
    originalUrl: string;
    userId?: string,
    username?: string
    _id?: ObjectId;
}

export const linkSchema = Joi.object({
    shortenUrl: Joi.string().pattern(/^[a-z_\-]+$/).optional(),
    originalUrl: Joi.string().pattern(/^(http|https):\/\//).required(),
});

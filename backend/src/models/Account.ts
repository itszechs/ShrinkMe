import { ObjectId } from "mongodb";
import Joi from "joi";

export interface Account {
    username: string;
    password: string;
    _id?: ObjectId;
}

export const accountSchema = Joi.object({
    username: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
});

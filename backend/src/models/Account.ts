import { ObjectId } from "mongodb";
import Joi from "joi";

export interface Account {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    _id?: ObjectId;
}

export const accountSchema = Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    username: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
    username: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
});
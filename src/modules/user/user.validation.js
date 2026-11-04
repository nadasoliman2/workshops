import Joi from "joi";
import { Types } from "mongoose";

export const paramsSchema = Joi.object({
  id: Joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value)
      ? value
      : helper.message("Invalid ObjectId format.");
  }),
});

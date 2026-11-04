import { BadException } from "../common/exceptions/error.exception.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const validationResult = schema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      throw BadException("Validation Error", validationResult.error.details);
    }

    req.validate = validationResult.value;
    next();
  };
};

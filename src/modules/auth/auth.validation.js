import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email",
      "any.required": "Please enter your email",
    }),
  password: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be minimum 8 characters including at least one lowercase, one uppercase, one digit ",
      "any.required": "Please enter your password",
    }),
});

export const signupSchema = loginSchema.keys({
  username: Joi.string()
    .min(5)
    .max(50)
    .required()
    .messages({
      "string.min": "username must be at least 5 characters",
      "any.required": "Please enter your username",
      "string.base": "Username must be a string",
    }),
  phone: Joi.string()
    .pattern(/^(002|\+2)?01[0125][0-9]{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide valid Egyptian number",
      "any.required": "Please enter your phone",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Confirm Password must match the password" }),
  age: Joi.number().integer().min(16).max(60),
  gender: Joi.number()
    .valid(...Object.values(genderEnum))
    .default(genderEnum.Male),
});

export const confirmEmailSchema = {
  body: Joi.object()
    .keys({
      email: Joi.string().email().required(),
      otp: Joi.string()
        .pattern(/^\d{6}$/)
        .messages({
          "string.pattern.base": "OTP must be exactly 6 digits.",
          "string.empty": "OTP cannot be empty.",
        })
        .required(),
    })
    .required(),
};

export const resendConfirmEmailSchema = {
  body: Joi.object({ email: Joi.string().email().required() }).required(),
};

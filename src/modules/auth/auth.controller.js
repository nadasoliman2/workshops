import { Router } from "express";
import { successResponse } from "../../common/utils/response/success.response.js";
import { confirmEmail, ContinueWithGoogle, login, resendConfirmEmail, signup } from "./auth.service.js";
import { confirmEmailSchema, loginSchema, resendConfirmEmailSchema, signupSchema } from "./auth.validation.js";
import { BadException } from "../../common/exceptions/error.exception.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post("/signup", validation(signupSchema), async (req, res, next) => {
  const result = await signup(req.validate);
  return successResponse({ res, status: 201, data: result });
});

router.patch("/verify-account", async (req, res, next) => {
    const result = await confirmEmail(req.body)
    return successResponse({ res, message: "Account verified successfully" })
})

router.patch("/resend-confirm-email", async (req, res, next) => {
    const result = await resendConfirmEmail(req.body)
    return successResponse({ res, message: "otp resend successfully" })
})

router.post("/login", validation(loginSchema), async (req, res, next) => {
  const result = await login(req.validate, `${req.protocol}://${req.host}`);
  return successResponse({ res, data: result });
});

router.post("/signup/gmail", async (req, res, next) => {
  console.log({ body: req.body });
  const {status, credentials} = await ContinueWithGoogle(
    req.body,
    `${req.protocol}://${req.host}`,
  );
  return successResponse({ res, status: status, message: "Done", data: credentials });
});

export default router;

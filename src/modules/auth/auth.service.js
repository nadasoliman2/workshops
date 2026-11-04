import { CLIENT_ID } from "../../../config/config.service.js";
import { providerEnum } from "../../common/enum/user.enum.js";
import {
  BadException,
  ConflictException,
  NotfoundException,
} from "../../common/exceptions/error.exception.js";
import { get, set, ttl } from "../../common/services/redis.service.js";
import { sendEmail } from "../../common/utils/email/send.email.js";
import { generateEncrypt } from "../../common/utils/security/encrypt.security.js";
import {
  compareHash,
  generateHash,
} from "../../common/utils/security/hash.security.js";
import { generateOTP } from "../../common/utils/security/otp.security.js";
import { createLoginCredentials } from "../../common/utils/security/token.security.js";
import * as dbService from "../../DB/db.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { OAuth2Client } from "google-auth-library";

export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const emailExists = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (emailExists) {
    throw ConflictException("Email already exists");
  }

  const user = await dbService.createOne({
    model: UserModel,
    data: {
      username,
      email,
      password: await generateHash({ plaintext: password }),
      phone: await generateEncrypt(phone),
    },
  });

  const otp = await generateOTP(); //number

  // string => hash => save
  await set({
    key: `OTP::USER::${email}`,
    value: await generateHash({ plaintext: `${otp}` }),
    ttl: 300,
  });
  await sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: `<h1>OTP: ${otp}</h1>`,
  });
  return user;
};

export const confirmEmail = async (inputs) => {
  const { email, otp } = inputs;

  const user = await dbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $eq: null },
      provider: providerEnum.System,
    },
  });
  if (!user) {
    return NotfoundException("Email not found or already confirmed");
  }

  const hashedOTP = await get(`OTP::USER::${email}`); // expired
  if (!hashedOTP) {
    return BadException("Expired otp!");
  }

  if (!(await compareHash({ plaintext: otp, cipherText: hashedOTP }))) {
    return BadException("Invalid otp!");
  }

  user.confirmEmail = new Date();
  await user.save();

  return;
};

export const resendConfirmEmail = async (inputs) => {
  const { email } = inputs;

  const user = await dbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $eq: null },
      provider: providerEnum.System,
    },
  });
  if (!user) {
    return NotfoundException("Email not found or already confirmed");
  }

  const otpTTL = await ttl(`OTP::USER::${email}`); // -1 || -2 || >0
  if (otpTTL > 0) {
    return ConflictException(
      "You cannot request new otp as the oldone is still valid",
    );
  }
  const otp = await generateOTP(); //number

  // string => hash => save
  await set({
    key: `OTP::USER::${email}`,
    value: await generateHash({ plaintext: `${otp}` }),
    ttl: 300,
  });
  await sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: `<h1>OTP: ${otp}</h1>`,
  });
  return user;
};

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;

  // 1. Find user
  const user = await dbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: providerEnum.System,
    },
  });
  if (!user) {
    throw NotfoundException("In-valid email or not confirmed yet");
  }

  // 2. Compare password with stored hash
  const match = await compareHash({
    plaintext: password,
    cipherText: user.password,
  });

  if (!match) {
    throw NotfoundException("Invalid email or password");
  }

  // 3. Generate Access + Refresh Tokens
  const credentials = await createLoginCredentials(user, issuer);

  return credentials;
};

export const ContinueWithGoogle = async ({ idToken }, issuer) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload) {
    throw BadException("Google cannot verify this account");
  }
  console.log({ payload });
  // 3 options
  // 1- user already exists -- provider system  --> throw error
  // 2- user already exists -- provider google --> login credentials
  // 3- user not registered yet --> register --> login credentials

  const userExists = await dbService.findOne({
    model: UserModel,
    filter: { email: payload.email },
  });
  if (userExists) {
    if (userExists.provider == providerEnum.System) {
      throw ConflictException("Email already exists with different provider");
    }
    // Generate Access + Refresh Tokens
    const credentials = await createLoginCredentials(userExists, issuer);
    return { status: 200, credentials };
  }
  // register user
  const user = await dbService.createOne({
    model: UserModel,
    data: {
      username: payload.name,
      email: payload.email,
      confirmEmail: Date.now(),
      provider: providerEnum.Google,
    },
  });
  // Generate Access + Refresh Tokens
  const credentials = await createLoginCredentials(user, issuer);
  return { status: 201, credentials };
};

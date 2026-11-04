import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  SYSTEM_ACCESS_TOKEN_SIGNATURE,
  SYSTEM_REFRESH_TOKEN_SIGNATURE,
  USER_ACCESS_TOKEN_SIGNATURE,
  USER_REFRESH_TOKEN_SIGNATURE,
} from "../../../../config/config.service.js";
import { AudienceEnum, TokenTypeEnum } from "../../enum/security.enum.js";
import { roleEnum } from "../../enum/user.enum.js";

export const createLoginCredentials = async (user, issuer) => {
  // 1. Choose secret + audience based on role
  let accessSecret;
  let refreshSecret;
  let audience;

  if (user.role === roleEnum.Admin) {
    accessSecret = SYSTEM_ACCESS_TOKEN_SIGNATURE;
    refreshSecret = SYSTEM_REFRESH_TOKEN_SIGNATURE;
    audience = AudienceEnum.System;
  } else {
    accessSecret = USER_ACCESS_TOKEN_SIGNATURE;
    refreshSecret = USER_REFRESH_TOKEN_SIGNATURE;
    audience = AudienceEnum.User;
  }

  // Same ID for both tokens
  const jwtId = randomUUID();

  // jwt.sign({payload}, secret, {options})
  // 2. Create Access Token
  const access_token = jwt.sign({ sub: user._id.toString() }, accessSecret, {
    issuer,
    audience: [TokenTypeEnum.access, audience],
    expiresIn: ACCESS_EXPIRES_IN,
    jwtid: jwtId,
  });

  // 3. Create Refresh Token
  const refresh_token = jwt.sign({ sub: user._id.toString() }, refreshSecret, {
    issuer,
    audience: [TokenTypeEnum.refresh, audience],
    expiresIn: REFRESH_EXPIRES_IN,
    jwtid: jwtId,
  });

  return { access_token, refresh_token };
};

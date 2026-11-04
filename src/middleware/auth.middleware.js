import {
  SYSTEM_ACCESS_TOKEN_SIGNATURE,
  SYSTEM_REFRESH_TOKEN_SIGNATURE,
  USER_ACCESS_TOKEN_SIGNATURE,
  USER_REFRESH_TOKEN_SIGNATURE,
} from "../../config/config.service.js";
import { AudienceEnum, TokenTypeEnum } from "../common/enum/security.enum.js";
import {
  BadException,
  NotfoundException,
} from "../common/exceptions/error.exception.js";
import jwt from "jsonwebtoken";
import { findOne } from "../DB/db.repository.js";
import { UserModel } from "../DB/model/user.model.js";

export const authentication = (tokenType = TokenTypeEnum.access) => {
  return async (req, res, next) => {
    // 1- get the token from header
    const token = req.headers.authorization;
    if (!token) {
      throw BadException("Missing authorization headers");
    }

    // 2- decode token
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw BadException("Invalid token");
    }

    // 3- get token type and audience type
    const [decodedTokenType, audienceType] = decoded.aud;

    // 4- check token type
    if (decodedTokenType !== tokenType) {
      throw BadException("Invalid token type");
    }

    // 5- specify secret
    let secret;
    if (audienceType == AudienceEnum.System) {
      secret =
        tokenType == TokenTypeEnum.access
          ? SYSTEM_ACCESS_TOKEN_SIGNATURE
          : SYSTEM_REFRESH_TOKEN_SIGNATURE;
    } else {
      secret =
        tokenType == TokenTypeEnum.access
          ? USER_ACCESS_TOKEN_SIGNATURE
          : USER_REFRESH_TOKEN_SIGNATURE;
    }

    // 6- verify data based on secret
    const verifiedData = jwt.verify(token, secret);
    if (!verifiedData) {
      throw BadException("Invalid signature");
    }

    // 7- find user
    const user = await findOne({
      model: UserModel,
      filter: { _id: verifiedData.sub },
    });

    if (!user) {
      throw NotfoundException("User not found");
    }

    req.user = user;
    req.decoded = decoded;

    next();
  };
};

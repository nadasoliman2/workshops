import { Router } from "express";
import { successResponse } from "../../common/utils/response/success.response.js";
import {
  coverPictures,
  deleteUser,
  profile,
  profilePicture,
  removeProfilePicture,
  rotateToken,
} from "./user.service.js";
import { paramsSchema } from "./user.validation.js";
import { BadException } from "../../common/exceptions/error.exception.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { TokenTypeEnum } from "../../common/enum/security.enum.js";
import {
  fileValidation,
  localFileUpload,
  processMulterUpload,
} from "../../common/utils/multer/local.multer.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
const router = Router();

router.get("/", authentication(), async (req, res, next) => {
  const result = await profile(req.user);
  return successResponse({ res, status: 201, data: result });
});

router.get(
  "/rotate-token",
  authentication(TokenTypeEnum.refresh),
  async (req, res, next) => {
    const result = await rotateToken(req.user, `${req.protocol}://${req.host}`);
    return successResponse({ res, status: 201, data: result });
  },
);

// router.patch(
//   "/profile-picture",
//   authentication(),
//   localFileUpload({ maxFileSize: 3 }).single("attachment"),
//   processMulterUpload({
//     customPath: "users/profile",
//     validation: fileValidation.image,
//   }),
//   async (req, res, next) => {
//     console.log({ after: req.body });
//     req.user.profilePicture = req.file.finalPath;
//     await req.user.save();
//     return successResponse({ res, data: { file: req.file, user: req.user } });
//   },
// );

// router.patch(
//   "/cover-pictures",
//   authentication(),
//   localFileUpload({ maxFileSize: 3 }).array("coverPictures", 5),
//   processMulterUpload({
//     customPath: "users/cover-pictures",
//     validation: fileValidation.image,
//   }),
//   async (req, res, next) => {
//     const coverPicturePaths = req.files.map((file) => file.finalPath);

//     req.user.coverPictures = coverPicturePaths;
//     await req.user.save();

//     return successResponse({ res, data: { files: req.files, user: req.user } });
//   },
// );

// CLOUD
router.patch(
  "/profile-picture",
  authentication(),
  cloudFileUpload({ maxFileSize: 3 }).single("attachment"),
  async (req, res, next) => {
    const result = await profilePicture(req.file, req.user);
    return successResponse({ res, data: result });
  },
);

router.patch(
  "/cover-pictures",
  authentication(),
  cloudFileUpload({ maxFileSize: 3 }).array("coverPictures", 5),
  async (req, res, next) => {
    const result = await coverPictures(req.files, req.user);
    return successResponse({ res, data: result });
  },
);

router.delete("/profile-picture", authentication(), async (req, res, next) => {
  const result = await removeProfilePicture(req.user);
  return successResponse({ res, data: result });
});

router.delete("/", authentication(), async (req, res, next) => {
  const result = await deleteUser(req.user);
  return successResponse({ res, data: result });
});

export default router;

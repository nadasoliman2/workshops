import { APPLICATION_NAME } from "../../../config/config.service.js";
import cloudinary, {
  deleteFile,
  deleteFiles,
  deleteFolder,
  deleteFolderAssets,
  uploadFile,
  uploadFiles,
} from "../../common/utils/multer/cloudinary.js";
import { fileValidation } from "../../common/utils/multer/local.multer.js";
import { generateDecrypt } from "../../common/utils/security/encrypt.security.js";
import { createLoginCredentials } from "../../common/utils/security/token.security.js";
import { deleteOne } from "../../DB/db.repository.js";
import { UserModel } from "../../DB/model/user.model.js";

export const profile = async (user) => {
  if (user.phone) {
    user.phone = await generateDecrypt(user.phone);
  }
  return user;
};

export const rotateToken = async (user, issuer) => {
  //Generate Access + Refresh Tokens
  const credentials = await createLoginCredentials(user, issuer);

  return credentials;
};

export const profilePicture = async (file, user) => {
  const { public_id, secure_url } = await uploadFile({
    file,
    folder: `users/${user._id}`,
    validation: fileValidation.image,
  });

  const oldPublicId = user.profilePicture.public_id;

  user.profilePicture = { public_id, secure_url };
  await user.save();

  if (oldPublicId) {
    await deleteFile(oldPublicId);
  }

  return user;
};

export const coverPictures = async (files, user) => {
  const newPictures = await uploadFiles({
    files,
    folder: `users/${user._id}/cover`,
    validation: fileValidation.image,
  });

  const oldPublicIds = user.coverPictures.map((picture) => picture.public_id); //[publicIds]

  user.coverPictures = newPictures;
  await user.save();

  if (oldPublicIds.length) {
    await deleteFiles(oldPublicIds);
  }

  return user;
};

export const removeProfilePicture = async (user) => {
  const publicId = user.profilePicture.public_id;

  user.profilePicture = undefined;
  await user.save();

  if (publicId) {
    await deleteFile(publicId);
  }

  return user;
};

export const deleteUser = async (user) => {
  const folder = `${APPLICATION_NAME}/users/${user._id}`;
  // await deleteFolderAssets(folder);
  // await deleteFolder(folder);
  return await deleteOne({ filter: { _id: user._id }, model: UserModel });
};

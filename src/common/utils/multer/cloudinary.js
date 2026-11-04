import { v2 as cloudinary } from "cloudinary";
import {
  API_KEY,
  API_SECRET,
  APPLICATION_NAME,
  CLOUD_NAME,
} from "../../../../config/config.service.js";
import { fileTypeFromFile } from "file-type";
import { BadException } from "../../exceptions/error.exception.js";
import { unlink } from "node:fs/promises";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export const uploadFile = async ({ file, folder, validation = [] }) => {
  // 1- validate file type
  const result = await fileTypeFromFile(file.path);
  if (!result || !validation.includes(result.mime)) {
    await unlink(file.path);
    throw BadException("Invalid file format");
  }

  //   upload on cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    file.path,
    { folder: `${APPLICATION_NAME}/${folder}` },
  );

  //  3-  unlink file
  await unlink(file.path);

  return { public_id, secure_url };
};

export const uploadFiles = async ({ files, folder, validation = [] }) => {
  const attachments = [];
  for (const file of files) {
    const uploadedFile = await uploadFile({ file, folder, validation });
    attachments.push(uploadedFile);
  }
  return attachments;
};

export const deleteFile = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

export const deleteFiles = async (publicIds) => {
  return await cloudinary.api.delete_resources(publicIds);
};

export const deleteFolderAssets = async (folder) => {
  return await cloudinary.api.delete_resources_by_prefix(folder);
};

export const deleteFolder = async (folder) => {
  return await cloudinary.api.delete_folder(folder);
};

export default cloudinary;

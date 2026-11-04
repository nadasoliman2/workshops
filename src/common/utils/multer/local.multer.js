import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { BadException } from "../../exceptions/error.exception.js";
import { resolve } from "node:path";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};

export const localFileUpload = ({ maxFileSize = 5}) => {
  const storage = multer.memoryStorage();

  return multer({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } });
};

export const processFile = async ({
  customPath = "General",
  file,
  validation = [],
}) => {
  const result = await fileTypeFromBuffer(file.buffer);
  console.log({ result });
  if (!result || !validation.includes(result.mime)) {
    throw BadException("Invalid file format");
  }
  
  await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
  const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;
  await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
  file.finalPath = uniqueFilePath;
  return file;
};

export const processFiles = async ({
  customPath = "General",
  files,
  validation = [],
}) => {
  const assets = [];
  for (const file of files) {
    const uploadedFile = await processFile({ customPath, file, validation });
    assets.push(uploadedFile);
  }
  return assets;
};

export const processMulterUpload = ({
  customPath = "General",
  validation = [],
}) => {
  return async (req, res, next) => {
    if (req.file) {
      await processFile({ customPath, file: req.file, validation });
    } else if (req.files) {
      await processFiles({ customPath, files: req.files, validation });
    }
    next();
  };
};

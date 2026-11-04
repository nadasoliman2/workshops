import { NODE_ENV } from "../../config/config.service.js";

export const globalErrorHandling = (error, req, res, next) => {
  return res
    .status(error.cause?.status ?? 500)
    .json({
      error_message: error.message || "server error",
      cause: error.cause,
      error,
      stack: NODE_ENV == "development" ? error.stack : undefined,
    });
};

import express from "express";
import { port } from "../config/config.service.js";
import { authenticateDB } from "./DB/connection.db.js";
import { globalErrorHandling } from "./middleware/error.middleware.js";
import { authRouter, userRouter } from "./modules/index.js";
import cors from "cors";
import { connectRedis } from "./DB/redis.connection.js";

const app = express();
app.use(cors(), express.json());
app.use("/assets", express.static("./assets"));

// DB
await authenticateDB();
await connectRedis();

//application routing
app.get("/", (req, res) =>
  res.status(200).json({ message: "Welcome to Saraha Application" }),
);
app.use("/auth", authRouter);
app.use("/user", userRouter);

//invalid routing
app.use("{/*dummy}", (req, res) => {
  return res.status(404).json({ message: "Invalid application routing" });
});

//error-handling
app.use(globalErrorHandling);

export default app
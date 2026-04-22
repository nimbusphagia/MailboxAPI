import "dotenv/config";
import cookieParser from "cookie-parser";
import express from 'express'
import cors from 'cors'
import { errorMiddleware } from "./errorHandler"
import indexRouter from "../routes/index.router"
import { authMiddleware } from "../middleware/auth.middleware"
import authRouter from "../routes/auth.router"

const app = express()

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Public
app.use("/auth", authRouter);

// Protected
app.use("/api", authMiddleware, indexRouter);

app.use(errorMiddleware);
export default app;

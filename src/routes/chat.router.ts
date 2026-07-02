import { Router } from "express";
import {
  archiveChat,
  createChat,
  deleteChat,
  getAll,
  getChat,
} from "../controllers/chat.controller";
import messageRouter from "./message.router";

const chatRouter = Router();

chatRouter.use("/message", messageRouter);

chatRouter.get("/", getAll);
chatRouter.get("/:id", getChat);
chatRouter.post("/", createChat);
chatRouter.post("/archived", archiveChat);
chatRouter.delete("/:id", deleteChat);

export default chatRouter;

import { Router } from "express";
import { create, edit, deleteMessage } from "../controllers/message.controller";

const messageRouter = Router();

messageRouter.post("/", create);
messageRouter.put("/:messageId", edit);
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;

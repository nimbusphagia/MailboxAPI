import { Router } from "express";
import userRouter from "./user.router";
import contactRouter from "./contact.router";
import chatRouter from "./chat.router";

const indexRouter = Router();

indexRouter.use("/user", userRouter);
indexRouter.use("/contact", contactRouter);
indexRouter.use("/chat", chatRouter);

export default indexRouter;

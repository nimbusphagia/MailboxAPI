import { Router } from "express";
import userRouter from "./user.router";
import chatRouter from "./chat.router";
import groupRouter from "./group.router";
import assetsRouter from "./assets.router";

const indexRouter = Router();

indexRouter.use("/assets", assetsRouter);
indexRouter.use("/user", userRouter);
indexRouter.use("/chat", chatRouter);
indexRouter.use("/group", groupRouter);

export default indexRouter;

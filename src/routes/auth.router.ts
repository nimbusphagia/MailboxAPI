import { Router } from "express";
import { login, logoutUser, register } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logoutUser);
authRouter.post("/signup", register);

export default authRouter;

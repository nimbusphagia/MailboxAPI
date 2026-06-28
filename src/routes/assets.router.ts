import { Router } from "express";
import { getProfilePictures } from "../controllers/assets.controller";

const assetsRouter = Router();
assetsRouter.get("/profile-pictures", getProfilePictures);

export default assetsRouter;

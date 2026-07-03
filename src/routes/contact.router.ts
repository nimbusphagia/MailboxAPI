import { Router } from "express";
import {
  create,
  deleteContact,
  editNickname,
  getAll,
  getBlocked,
  getById,
  toggleIsBlocked,
} from "../controllers/contact.controller";

const contactRouter = Router();

contactRouter.get("/", getAll);
contactRouter.get("/blocked", getBlocked);
contactRouter.get("/:contactId", getById);
contactRouter.post("/", create);
contactRouter.patch("/:contactId", editNickname);
contactRouter.delete("/:contactId", deleteContact);
contactRouter.patch("/block/:contactId", toggleIsBlocked);

export default contactRouter;

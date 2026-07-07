import { Router } from "express";
import { deleteChat } from "../controllers/chat.controller";
import {
  createGroupChat,
  getGroup,
  editGroupInfo,
  createGroupMember,
  deleteMember,
  editMemberRole,
  getGroups,
} from "../controllers/group.controller";
import upload from "../middleware/upload.middleware";

const groupRouter = Router();
const groupMemberRouter = Router();

groupMemberRouter.post("/", createGroupMember);
groupMemberRouter.patch("/role/:memberId", editMemberRole);
groupMemberRouter.delete("/:chatId/:userId", deleteMember);

groupRouter.use("/member", groupMemberRouter);

groupRouter.get("/", getGroups);
groupRouter.get("/:id", getGroup);
groupRouter.post("/", upload.single("image"), createGroupChat);
groupRouter.delete("/:id", deleteChat);
groupRouter.put("/:id", editGroupInfo);

export default groupRouter;

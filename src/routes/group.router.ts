import { Router } from "express";
import { deleteChat } from "../controllers/chat.controller";
import { createGroupChat, getGroup, editGroupInfo, createGroupMember, deleteMember, editMemberRole } from "../controllers/group.controller";

const groupRouter = Router();
const groupMemberRouter = Router();

groupMemberRouter.post("/", createGroupMember);
groupMemberRouter.patch("/role/:memberId", editMemberRole);
groupMemberRouter.delete("/:memberId", deleteMember);

groupRouter.use("/member", groupMemberRouter);

groupRouter.get("/:id", getGroup);
groupRouter.post("/", createGroupChat);
groupRouter.delete("/:id", deleteChat);
groupRouter.put("/:id", editGroupInfo);

export default groupRouter;

import GroupControllers from "@/controllers/group.controllers.js";
import validate from "@/middlewares/validate.js";
import { groupCreation, resourceId } from "@/validators/index.js";
import express from "express";

const router = express.Router();

router.get("/groups", GroupControllers.getAllGoups);
router.get("/groups/:id", validate(resourceId), GroupControllers.getGroupById);
router.post("/groups", validate(groupCreation), GroupControllers.createGroup);

export default router;
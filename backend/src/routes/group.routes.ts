import GroupControllers from "@/controllers/group.controllers.js";
import validate from "@/middlewares/validate.js";
import { groupCreation, paramsValidation } from "@/validators/index.js";
import express from "express";
import refreshJWTToken from "@/middlewares/refresh-token.js";

const router = express.Router();

router.get("/", GroupControllers.findMany);
router.get("/:id", refreshJWTToken, validate(paramsValidation), GroupControllers.findById);
router.post("/", refreshJWTToken, validate(groupCreation), GroupControllers.create);

export default router;
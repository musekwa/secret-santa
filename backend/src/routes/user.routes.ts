import UserControllers from "@/controllers/user.controllers.js";
import validate from "@/middlewares/validate.js";
import { userCreation, paramsValidation } from "@/validators/index.js";
import express from "express";
import refreshJWTToken from "@/middlewares/refresh-token.js";

const router = express.Router();

router.get("/", refreshJWTToken, UserControllers.findMany);
router.get("/:id", refreshJWTToken, validate(paramsValidation), UserControllers.findById);
router.put("/:id", refreshJWTToken, validate(paramsValidation), validate(userCreation), UserControllers.update);
// router.get("/me", refreshJWTToken, UserControllers.findMe);

export default router;
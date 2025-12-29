import UserControllers from "@/controllers/user.controllers.js";
import validate from "@/middlewares/validate.js";
import { userCreation, resourceId } from "@/validators/index.js";
import express from "express";

const router = express.Router();

router.get("/users", UserControllers.getAllUsers);
router.get("/users/:id", validate(resourceId), UserControllers.getUserById);
router.put("/users/:id", validate(resourceId), validate(userCreation), UserControllers.updateUser);

export default router;
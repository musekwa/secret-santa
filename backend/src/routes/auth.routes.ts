import express from "express";
import AuthControllers from "@/controllers/auth.controllers.js";
import validate from "@/middlewares/validate.js";
import { userCreation, userLogin } from "@/validators/index.js";

const router = express.Router();

router.post("/login", validate(userLogin), AuthControllers.login);
router.post("/register", validate(userCreation), AuthControllers.register);

export default router;
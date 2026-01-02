import express from "express";
import AuthControllers from "@/controllers/auth.controllers.js";
import validate from "@/middlewares/validate.js";
import { userCreation, userLogin } from "@/validators/index.js";
import refreshJWTToken from "@/middlewares/refresh-token.js";

const router = express.Router();

router.post("/login", validate(userLogin), AuthControllers.login);
router.post("/register", validate(userCreation), AuthControllers.register);
router.post("/sign-out", refreshJWTToken, AuthControllers.signOut);
router.get("/me", refreshJWTToken, AuthControllers.findMe);

export default router;
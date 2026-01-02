import express from "express";
import ParticipantControllers from "@/controllers/participant.controllers.js";
import validate from "@/middlewares/validate.js";
import { participantCreation, paramsValidation, queryValidation } from "@/validators/index.js";
import refreshJWTToken from "@/middlewares/refresh-token.js";

const router = express.Router();

router.get("/", refreshJWTToken, validate(queryValidation), ParticipantControllers.findMany);
router.get("/:id", refreshJWTToken, validate(paramsValidation), ParticipantControllers.findById);
router.post("/", refreshJWTToken, validate(participantCreation), ParticipantControllers.create);

export default router;
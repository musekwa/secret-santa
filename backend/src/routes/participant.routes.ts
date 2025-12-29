import express from "express";
import ParticipantControllers from "@/controllers/participant.controllers.js";
import validate from "@/middlewares/validate.js";
import { participantCreation, resourceId } from "@/validators/index.js";

const router = express.Router();

router.get("/participants", ParticipantControllers.getAllParticipants);
router.get("/participants/:id", validate(resourceId), ParticipantControllers.getParticipantById);
router.post("/participants", validate(participantCreation), ParticipantControllers.createParticipant);

export default router;
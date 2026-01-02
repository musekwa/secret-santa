import express from "express";
import groupRoutes from "./group.routes.js";
import userRoutes from "./user.routes.js";
import participantRoutes from "./participant.routes.js";
import authRoutes from "./auth.routes.js";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/groups", groupRoutes);
router.use("/api/participants", participantRoutes);

export default router;

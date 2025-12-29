import express from "express";
import groupRoutes from "./group.routes.js";
import userRoutes from "./user.routes.js";
import participantRoutes from "./participant.routes.js";
import authRoutes from "./auth.routes.js";

const router = express.Router();

router.use("/api", authRoutes);
router.use("/api", groupRoutes);
router.use("/api", userRoutes);
router.use("/api", participantRoutes);

export default router;

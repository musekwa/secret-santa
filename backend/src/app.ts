import express from "express";
import appRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/error-handler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);

app.use(appRoutes);
export default app;

import express from "express";
import appRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/error-handler.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);

app.use(appRoutes);
export default app;

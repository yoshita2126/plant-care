import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import logRoutes from "./routes/logRoutes.js";
import plantRoutes from "./routes/plantRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("This origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "20kb" }));
app.get("/api/health", asyncHandler(async (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  if (connected) await mongoose.connection.db.admin().ping();
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? mongoose.connection.name : "disconnected"
  });
}));
app.use("/api/plants", plantRoutes);
app.use("/api/logs", logRoutes);
app.use((req, res) => res.status(404).json({ message: "Endpoint not found." }));
app.use(errorHandler);

try {
  await connectDatabase();
  app.listen(port, () => console.log(`Plant Care API listening on port ${port}`));
} catch (error) {
  console.error(`Unable to start API: ${error.message}`);
  process.exitCode = 1;
}

import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDatabase, getSupabase } from "./config/db.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import logRoutes from "./routes/logRoutes.js";
import plantRoutes from "./routes/plantRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Port configuration (Render compatible)
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.CLIENT_ORIGIN || "").split(",")
]
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("This origin is not allowed by CORS.")
      );
    },
  })
);

// Middleware
app.use(express.json({ limit: "20kb" }));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Plant Care Reminder API is running 🌱",
    status: "success",
  });
});

// Health check route
app.get(
  "/api/health",
  asyncHandler(async (req, res) => {
    const checks = await Promise.all([
      getSupabase().from("plants").select("id", { head: true, count: "exact" }),
      getSupabase().from("care_logs").select("id", { head: true, count: "exact" })
    ]);
    const failedCheck = checks.find(({ error }) => error);
    if (failedCheck) throw failedCheck.error;

    res.status(200).json({
      status: "ok",
      database: "supabase"
    });
  })
);

// API routes
app.use("/api/plants", plantRoutes);
app.use("/api/logs", logRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found.",
  });
});

// Global error handler
app.use(errorHandler);

// Start server after the Supabase connection is verified.
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `🌱 Plant Care API running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Unable to start API:",
      error.message
    );

    process.exit(1);
  }
};

// Start application
startServer();
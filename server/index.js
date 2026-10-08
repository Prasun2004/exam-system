import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

dotenv.config();

const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// =====================================================
// BASIC TEST
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mock Test API is running",
  });
});

// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
  "/auth",
  authRoutes
);

// =====================================================
// AI ROUTES
// =====================================================

app.use(
  "/ai",
  aiRoutes
);

// =====================================================
// RESULT ROUTES
// =====================================================

app.use(
  "/result",
  resultRoutes
);

// =====================================================
// REMINDER ROUTES
// =====================================================

app.use(
  "/reminder",
  reminderRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});
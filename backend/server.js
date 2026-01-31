// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./db.js";

// Routes
import authRoutes from "./routes/auth-routes.js";
import truckRoutes from "./routes/truck-routes.js";
import prRoutes from "./routes/pr-routes.js";
import agentRoutes from "./routes/agent-routes.js";
import decisionRoutes from "./routes/decision-routes.js";
import driverRoutes from "./routes/driver-routes.js";


dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// Health check
app.get("/", (req, res) => {
  res.send("🚚 Logistics AI Backend Running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/prs", prRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/decision", decisionRoutes);
app.use("/api/driver", driverRoutes);

// Global error handler (optional but clean)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

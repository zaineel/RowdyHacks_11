import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import circleRoutes from "./routes/circles.js";
import paymentRoutes from "./routes/payments.js";
import payoutRoutes from "./routes/payouts.js";
import vouchRoutes from "./routes/vouches.js";
import creditRoutes from "./routes/credit.js";
import aiRoutes from "./routes/ai.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173", // Local development (HTTP)
      "https://localhost:5173", // Local development (HTTPS)
      "https://994cfecc.payitforward-41x.pages.dev", // Production frontend
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []), // Environment variable override (comma-separated)
    ].filter(Boolean); // Remove any undefined values

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      console.log("Allowed origins:", allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Rate limiting (DISABLED FOR HACKATHON DEMO)
// TODO: Re-enable for production deployment
// app.use("/api/", rateLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "PayItForward API",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/vouches", vouchRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
  🤠 PayItForward API Server
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Server running on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || "development"}
  📍 API Base: http://localhost:${PORT}/api
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

export default app;

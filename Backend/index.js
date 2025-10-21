import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./Routes/User.Route.js";
import vehicleRoute from "./Routes/Vehicle.Route.js";
import realStateRoute from "./Routes/RealState.Route.js";
import serviceRoute from "./Routes/Service.Route.js";
import jobRoute from "./Routes/Job.Route.js";
import searchRoute from "./Routes/searchRoutes.js";
import { dbConnection } from "./Config/dbConnection.js";
import { errorMiddleware } from "./Middleware/error.js";
dotenv.config({ path: "./Config/.env" });

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/user", userRoute);
app.use("/api/vehicle", vehicleRoute);
app.use("/api/real-state", realStateRoute);
app.use("/api/job", jobRoute);
app.use("/api/service", serviceRoute);
app.use("/api/search", searchRoute);
app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});

app.use(errorMiddleware);

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server only after DB connection
const startServer = async () => {
  try {
    await dbConnection(); // ⬅️ Ensure DB is connected first

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`✅ DB Connected & Server running on port ${port}`);
      console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1); // exit if DB fails
  }
};

startServer();

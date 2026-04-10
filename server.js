import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connDB } from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";
import rateLimit from "express-rate-limit";

const app = express();
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";

let limiter = rateLimit({
  max: 20,
  windowMs: 60 * 1000,
  message: "Too many requests from this IP, please try again after some time",
});

const PORT = process.env.PORT || 4000;

app.use("/api", limiter);
app.use(
  express.json({
    limit: "20mb",
  }),
);
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      `${process.env.CLIENT_URL}`,
      "http://localhost:3000",
      "http://localhost:5173",
      "https://www.visaexpressbd.com",
      "https://visaexpressbd.com",
      "https://www.kothasongkolon.com",
    ],
    credentials: true,
  }),
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  connDB();
  console.log(`Server running → http://localhost:${PORT}`);
});

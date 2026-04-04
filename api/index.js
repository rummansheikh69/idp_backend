import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connDB } from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";

// routes
import authRoutes from "../routes/auth.route.js";
import userRoutes from "../routes/user.route.js";

dotenv.config();

const app = express();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
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
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:5173",
      "https://www.kothasongkolon.com",
    ],
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ===== Serverless-safe DB connection =====
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = connDB();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ===== Vercel handler =====
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}

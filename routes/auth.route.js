import express from "express";
import * as AUTHCONTROLLER from "../controllers/auth.controller.js";
import { protectedRoutes } from "../middleware/protectedRoutes.js";

const router = express.Router();

router.get("/me", protectedRoutes, AUTHCONTROLLER.getMe);
router.post("/register", AUTHCONTROLLER.register);
router.post("/login", AUTHCONTROLLER.login);
router.post("/logout", AUTHCONTROLLER.logout);
router.post(
  "/change-password/:id",
  protectedRoutes,
  AUTHCONTROLLER.changePassword,
);
router.post("/change-email/:id", protectedRoutes, AUTHCONTROLLER.changeEmail);
export default router;

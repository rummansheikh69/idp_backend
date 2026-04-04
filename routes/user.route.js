import express from "express";
import * as USERCONTROLLER from "../controllers/user.controller.js";
import { protectedRoutes } from "../middleware/protectedRoutes.js";

const router = express.Router();

router.get("/users", protectedRoutes, USERCONTROLLER.getAllUsers);
router.post("/admission", USERCONTROLLER.sendAdmissionEmail);

export default router;

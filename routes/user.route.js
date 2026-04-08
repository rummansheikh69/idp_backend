import express from "express";
import * as USERCONTROLLER from "../controllers/user.controller.js";
import { protectedRoutes } from "../middleware/protectedRoutes.js";

const router = express.Router();

router.get("/users", protectedRoutes, USERCONTROLLER.getAllUsers);
router.delete("/users/:id", protectedRoutes, USERCONTROLLER.deleteUser);
router.post("/admission", protectedRoutes, USERCONTROLLER.sendAdmissionEmail);
router.post("/banner", protectedRoutes, USERCONTROLLER.createBanner);
router.get("/banners", USERCONTROLLER.getAllBanners);
router.delete("/banner/:id", protectedRoutes, USERCONTROLLER.deleteBanner);
router.put("/banner/:id", protectedRoutes, USERCONTROLLER.updateBanner);

router.get("/gallery", USERCONTROLLER.getAllGalleryItems);
router.post("/gallery", protectedRoutes, USERCONTROLLER.addGallery);
router.delete("/gallery/:id", protectedRoutes, USERCONTROLLER.deleteGallery);
router.put("/gallery/:id", protectedRoutes, USERCONTROLLER.updateGallery);

router.post("/apply", USERCONTROLLER.applicationForm);
router.post("/counseling", USERCONTROLLER.counsellingForm);

export default router;

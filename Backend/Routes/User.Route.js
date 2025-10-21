import express from "express";
import {
  changePassword,
  editprofile,
  forgetPassword,
  getProfile,
  login,
  logout,
  otpverify,
  register,
  resetPassword,
} from "../Controller/User.Controller.js";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import { avatars } from "../Middleware/imageUpload.js";

const router = express.Router();

router.post("/register", register);
router.post("/otp", otpverify);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forget", forgetPassword);
router.post("/reset-password/:id", resetPassword);
router.get("/profile/:id", isAuthenticated, getProfile);
router.patch(
  "/edit-profile",
  isAuthenticated,
  avatars.single("avatar"),
  editprofile
);
router.post("/change-password", isAuthenticated, changePassword);

export default router;

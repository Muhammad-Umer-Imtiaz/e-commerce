import express from "express";
import {
  forgetPassword,
  getProfile,
  login,
  logout,
  otpverify,
  register,
  resetPassword,
} from "../Controller/User.Controller.js";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/otp", otpverify);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forget", forgetPassword);
router.post("/reset-password/:id", resetPassword);
router.get("/profile/:id", isAuthenticated, getProfile);

export default router;

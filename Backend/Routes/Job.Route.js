import express from "express";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import {
  createJobs,
  deleteJobs,
  getJobsPagination,
  getSingleJobs,
  getUserJobs,
  updateJobs,
} from "../Controller/Job.Controller.js";
const router = express.Router();

router.post("/create", isAuthenticated, createJobs);
router.delete("/delete/:id", isAuthenticated, deleteJobs);
router.put("/update/:id", isAuthenticated, updateJobs);

router.get("/get", getJobsPagination);
router.get("/get-user-job/:id", isAuthenticated, getUserJobs);
router.get("/get-single/:id", getSingleJobs);
export default router;

import express from "express";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import {
  atlasSearch,
  createJobs,
  deleteJobs,
  getJobsPagination,
  getSingleJobs,
  getUserJobs,
  hybridSearch,
  regexSearch,
  textSearch,
  updateJobs,
} from "../Controller/Job.Controller.js";
const router = express.Router();

router.post("/create", isAuthenticated, createJobs);
router.delete("/delete/:id", isAuthenticated, deleteJobs);
router.put("/update/:id", isAuthenticated, updateJobs);

router.get("/get", getJobsPagination);
router.get("/get-user-job/:id", isAuthenticated, getUserJobs);
router.get("/get-single/:id", getSingleJobs);
router.get("/regex", regexSearch);
router.get("/hybrid", hybridSearch);
router.get("/text", textSearch);
router.get("/atlas", atlasSearch);
export default router;

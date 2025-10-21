import express from "express";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import { uploadRealStateImage } from "../Middleware/imageUpload.js";
import {
  createRealState,
  deleteRealState,
  getRealStatePagination,
  getSingleRealState,
  getUserRealState,
  updateRealState,
} from "../Controller/RealState.Controller.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  uploadRealStateImage.array("images", 5),
  createRealState
);
router.delete("/delete/:id", isAuthenticated, deleteRealState);
router.put(
  "/update/:id",
  isAuthenticated,
  uploadRealStateImage.array("images", 5),
  updateRealState
);

router.get("/get", getRealStatePagination);
router.get("/get-user-realstate/:id", isAuthenticated, getUserRealState);
router.get("/get-single/:id", getSingleRealState);
export default router;

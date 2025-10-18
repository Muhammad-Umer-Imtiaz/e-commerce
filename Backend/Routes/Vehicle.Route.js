import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getSingleVehicle,
  getUserVehicle,
  getVehiclePagination,
  updateVechile,
} from "../Controller/Vehicle.Controller.js";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import { uploadVehicleImage } from "../Middleware/imageUpload.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  uploadVehicleImage.array("images", 5),
  createVehicle
);
router.delete("/delete/:id", isAuthenticated, deleteVehicle);
router.put(
  "/update/:id",
  isAuthenticated,
  uploadVehicleImage.array("images", 5),
  updateVechile
);

router.get("/get", getVehiclePagination);
router.get("/get-user-vehicle/:id", isAuthenticated, getUserVehicle);
router.get("/get-single/:id", getSingleVehicle);
export default router;

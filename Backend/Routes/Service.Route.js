import express from "express";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import { uplaodServiceDocument } from "../Middleware/imageUpload.js";
import {
  createService,
  deleteService,
  getServicePagination,
  getSingleService,
  getUserService,
  updateService,
} from "../Controller/Service.Controller.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  uplaodServiceDocument.single("document"),
  createService
);
router.delete("/delete/:id", isAuthenticated, deleteService);
router.put(
  "/update/:id",
  isAuthenticated,
  uplaodServiceDocument.single("document"),
  updateService
);

router.get("/get", getServicePagination);
router.get("/get-user-service/:id", isAuthenticated, getUserService);
router.get("/get-single/:id", getSingleService);
export default router;

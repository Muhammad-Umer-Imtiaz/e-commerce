import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Config/Cloudinary.js";

// Storage for profile images
const AvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "E-Commerce/Avatars",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [
      {
        width: 300,
        height: 300,
        crop: "limit",
        fetch_format: "auto",
        quality: "auto:good",
      },
      {
        dpr: "auto",
      },
    ],
  },
});
const VehiclesImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "E-Commerce/Vehicle Images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: "limit",
        fetch_format: "auto",
        quality: "auto:good",
      },
      {
        dpr: "auto",
      },
    ],
  },
});
export const uploadVehicleImage = multer({ storage: VehiclesImageStorage });

export const uploadProfile = multer({ storage: AvatarStorage });

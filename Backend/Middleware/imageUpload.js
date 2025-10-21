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
const RealStateImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "E-Commerce/RealState Images",
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
const ServiceDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "E-Commerce/Service Document",
    // Allow these common document formats; Cloudinary will auto-detect resource type
    allowed_formats: ["pdf", "doc", "docx", "png", "jpg", "jpeg"],
    resource_type: "auto",
  },
});

// fileFilter for service documents
const serviceFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpg",
    "image/jpeg",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("An unknown file format not allowed"), false);
  }
};

export const avatars = multer({ storage: AvatarStorage });
export const uploadVehicleImage = multer({ storage: VehiclesImageStorage });
export const uploadRealStateImage = multer({ storage: RealStateImageStorage });
export const uplaodServiceDocument = multer({
  storage: ServiceDocumentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: serviceFileFilter,
});

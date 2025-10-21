import { catchAsyncErrors } from "../Middleware/catchAsyncError.js";
import ErrorHandler from "../Middleware/error.js";
import { RealState } from "../Models/RealState.Model.js";
import { User } from "../Models/User.Model.js";
import jwt from "jsonwebtoken";
import cloudinary from "../Config/Cloudinary.js";

export const createRealState = catchAsyncErrors(async (req, res, next) => {
  try {
    const images = req.files;
    if (!images)
      return next(new ErrorHandler("At least one image is required.", 400));

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    for (let file of images) {
      if (!allowedFormats.includes(file.mimetype)) {
        return next(
          new ErrorHandler("One or more image formats are not supported.", 400)
        );
      }
    }
    const { title, description, type, location, price } = req.body;
    const id = req.user._id;
    if (!title || !description || !type || !location || !price)
      return next(new ErrorHandler("Please Fill all required Fields", 400));
    const imageLinks = images.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));
    const realState = await RealState.create({
      title,
      description,
      type,
      location,
      price,
      images: imageLinks,
      createdBy: id,
    });
    return res.status(201).json({
      success: true,
      message: "Created Successfully",
      realState,
    });
  } catch (error) {
    next(error);
  }
});

export const deleteRealState = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("Invalid id ", 400));
    const realState = await RealState.findByIdAndDelete(id);
    if (!realState) return next(new ErrorHandler("not Found ", 404));
    for (let img of realState.images) {
      await cloudinary.v2.uploader.destroy(img.public_id);
    }

    res.status(200).json({
      success: true,
      message: " Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const updateRealState = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("Invalid id ", 400));
    const images = req.files;
    if (!images)
      return next(new ErrorHandler("At least one image is required.", 400));

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    for (let file of images) {
      if (!allowedFormats.includes(file.mimetype)) {
        return next(
          new ErrorHandler("One or more image formats are not supported.", 400)
        );
      }
    }
    const { title, description, type, location, price } = req.body;
    if (!title || !description || !type || !location || !price)
      return next(new ErrorHandler("Please Fill all required Fields", 400));
    const imageLinks = images.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));

    const realState = await RealState.findByIdAndUpdate(
      id,
      {
        title,
        description,
        type,
        location,
        price,
        images: imageLinks,
      },
      { new: true, runValidators: true }
    );

    if (!realState) return next(new ErrorHandler("Not found", 404));
    return res.status(201).json({
      success: true,
      message: "Created Successfully",
      realState,
    });
  } catch (error) {
    next(error);
  }
});

export const getRealStatePagination = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.offset) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const [results, total] = await Promise.all([
        RealState.find()
          .isActive("active")
          .sort({ created: -1 })
          .skip(skip)
          .limit(limit),
        RealState.countDocuments({ status: "active" }),
      ]);

      return res.status(200).json({
        success: true,
        page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        currentResults: results.length,
        results,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const getUserRealState = catchAsyncErrors(async (req, res, next) => {
  try {
    const realState = await RealState.find({
      createdBy: req.user._id,
    }).populate("createdBy", "name email createdAt avatar");
    if (!realState)
      return next(
        new ErrorHandler("You donot have any Real State ads right now", 404)
      );
    return res.status(200).json({ success: true, realState });
  } catch (error) {
    next(error);
  }
});
export const getSingleRealState = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(req.user);

    if (!id) return next(new ErrorHandler("ID not provided", 400));

    // Base query
    let query = RealState.findById(id);

    // If user is logged in, populate the 'createdBy' field
    const token = req.cookies.token;
    if (token) {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decode.id).select("-password");
      console.log("i am here also");
      query = query.populate("createdBy", "name email createdAt avatar");
    }

    const realState = await query;

    if (!realState) return next(new ErrorHandler("Not found", 404));

    return res.status(200).json({
      success: true,
      realState,
    });
  } catch (error) {
    next(error);
  }
});

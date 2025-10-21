import cloudinary from "../Config/Cloudinary.js";
import { catchAsyncErrors } from "../Middleware/catchAsyncError.js";
import ErrorHandler from "../Middleware/error.js";
import { User } from "../Models/User.Model.js";
import jwt from "jsonwebtoken";
import { Service } from "../Models/Service.Model.js";

export const createService = catchAsyncErrors(async (req, res, next) => {
  try {
    const document = req.file;

    if (!document)
      return next(
        new ErrorHandler("CV or any work-related document is required.", 400)
      );
    if (!document.path || !document.filename) {
      return next(
        new ErrorHandler("File upload failed. Please try again.", 400)
      );
    }

    const { name, description, type, location } = req.body;
    const id = req.user._id;

    if (!name || !description || !type || !location)
      return next(new ErrorHandler("Please fill all required fields.", 400));

    // Create service with the processed document information
    const service = await Service.create({
      name,
      description,
      type,
      location,
      document: {
        url: document.path,
        public_id: document.filename,
      },
      createdBy: id,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      service,
    });
  } catch (error) {
    next(error);
  }
});

export const deleteService = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("Invalid id ", 400));
    const service = await Service.findByIdAndDelete(id);
    if (!service) return next(new ErrorHandler("not Found any service", 404));
    await cloudinary.v2.uploader.destroy(service.document.public_id);

    res.status(200).json({
      success: true,
      message: "service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const updateService = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("Invalid id ", 400));
    const document = req.file;

    if (!document)
      return next(
        new ErrorHandler("CV or any work-related document is required.", 400)
      );
    if (!document.path || !document.filename) {
      return next(
        new ErrorHandler("File upload failed. Please try again.", 400)
      );
    }
    const { name, description, type, location } = req.body;
    if (!name || !description || !type || !location)
      return next(new ErrorHandler("Please Fill all required Fields", 400));

    const service = await Service.findByIdAndUpdate(
      id,
      {
        name,
        description,
        type,
        location,
        document: {
          url: document.path,
          public_id: document.filename,
        },
      },
      { new: true, runValidators: true }
    );

    if (!service) return next(new ErrorHandler("Service not found", 404));
    return res.status(201).json({
      success: true,
      message: "Created Successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
});

export const getServicePagination = catchAsyncErrors(async (req, res, next) => {
  try {
    const page = parseInt(req.query.offset) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [results, total] = await Promise.all([
      Service.find()
        .isActive("active")
        .sort({ created: -1 })
        .skip(skip)
        .limit(limit),
      Service.countDocuments({ status: "active" }),
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
});

export const getUserService = catchAsyncErrors(async (req, res, next) => {
  try {
    const services = await Service.find({ createdBy: req.user._id }).populate(
      "createdBy",
      "name email createdAt avatar"
    );
    if (!services)
      return next(
        new ErrorHandler("You donot have any Services ads right now", 404)
      );
    return res.status(200).json({ success: true, services });
  } catch (error) {
    next(error);
  }
});
export const getSingleService = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(req.user);

    if (!id) return next(new ErrorHandler("Service ID not provided", 400));

    // Base query
    let query = Service.findById(id);

    // If user is logged in, populate the 'createdBy' field
    const token = req.cookies.token;
    if (token) {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decode.id).select("-password");
      console.log("i am here also");
      query = query.populate("createdBy", "name email createdAt avatar");
    }

    const service = await query;

    if (!service) return next(new ErrorHandler("Service not found", 404));

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
});
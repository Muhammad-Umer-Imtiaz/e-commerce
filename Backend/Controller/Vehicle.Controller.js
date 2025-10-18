import cloudinary from "../Config/Cloudinary.js";
import { catchAsyncErrors } from "../Middleware/catchAsyncError.js";
import ErrorHandler from "../Middleware/error.js";
import { Vehicle } from "../Models/Vehicle.Model.js";

export const createVehicle = catchAsyncErrors(async (req, res, next) => {
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
    const { name, description, type, location, condition } = req.body;
    const id = req.user._id;
    if (!name || !description || !type || !location || !condition)
      return next(new ErrorHandler("Please Fill all required Fields", 400));
    const imageLinks = images.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));
    const vehicle = await Vehicle.create({
      name,
      description,
      type,
      location,
      condition,
      images: imageLinks,
      createdBy: id,
    });
    return res.status(201).json({
      success: true,
      message: "Created Successfully",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
});
export const deleteVehicle = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("Invalid id ", 400));
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) return next(new ErrorHandler("not Found any vehicle", 404));
    for (let img of vehicle.images) {
      await cloudinary.v2.uploader.destroy(img.public_id);
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const updateVechile = catchAsyncErrors(async (req, res, next) => {
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
    const { name, description, type, location, condition } = req.body;
    if (!name || !description || !type || !location || !condition)
      return next(new ErrorHandler("Please Fill all required Fields", 400));
    const imageLinks = images.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        name,
        description,
        type,
        location,
        condition,
        images: imageLinks,
      },
      { new: true, runValidators: true }
    );

    if (!vehicle) return next(new ErrorHandler("Vehicle not found", 404));
    return res.status(201).json({
      success: true,
      message: "Created Successfully",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
});

export const getVehiclePagination = catchAsyncErrors(async (req, res, next) => {
  try {
    const page = parseInt(req.query.offset) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [results, total] = await Promise.all([
      Vehicle.find().sort({ created: -1 }).skip(skip).limit(limit),
      Vehicle.countDocuments(),
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

export const getUserVehicle = catchAsyncErrors(async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ createdBy: req.user._id }).populate(
      "createdBy",
      "name email createdAt avatar"
    );
    if (!vehicles)
      return next(new ErrorHandler("You donot have any ads right now", 404));
    return res.status(200).json({ success: true, vehicles });
  } catch (error) {
    next(error);
  }
});

export const getSingleVehicle = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(req.user);

    if (!id) return next(new ErrorHandler("Vehicle ID not provided", 400));

    // Base query
    let query = Vehicle.findById(id);

    // If user is logged in, populate the 'createdBy' field
    if (req.user?._id) {
      console.log("i am here also");
      query = query.populate("createdBy", "name email createdAt avatar");
    }

    const vehicle = await query;

    if (!vehicle) return next(new ErrorHandler("Vehicle not found", 404));

    return res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
});


//end
// adding logic here if user login then show detail of seller else show only ads details
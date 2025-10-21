import { catchAsyncErrors } from "../Middleware/catchAsyncError.js";
import ErrorHandler from "../Middleware/error.js";
import { User } from "../Models/User.Model.js";
import jwt from "jsonwebtoken";
import { Job } from "../Models/Job.Model.js";

export const createJobs = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, description, type, location, salary } = req.body;
    const id = req.user._id;
    if (!name || !description || !type || !location)
      return next(new ErrorHandler("Please Fill all required Fields", 400));

    const job = await Job.create({
      name,
      description,
      type,
      location,
      salary,
      createdBy: id,
    });
    return res.status(201).json({
      success: true,
      message: "Created Successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
});

export const deleteJobs = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("Invalid id ", 400));
    const job = await Job.findByIdAndDelete(id);
    if (!job) return next(new ErrorHandler("not Found ", 404));

    res.status(200).json({
      success: true,
      message: " Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const updateJobs = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("Invalid id ", 400));
    const { name, description, type, location, salary } = req.body;
    if (!name || !description || !type || !location)
      return next(new ErrorHandler("Please Fill all required Fields", 400));
    const job = await Job.findByIdAndUpdate(
      id,
      {
        name,
        description,
        type,
        location,
        salary,
      },
      { new: true, runValidators: true }
    );

    if (!job) return next(new ErrorHandler("Not found", 404));
    return res.status(201).json({
      success: true,
      message: "Created Successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
});

export const getJobsPagination = catchAsyncErrors(async (req, res, next) => {
  try {
    const page = parseInt(req.query.offset) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [results, total] = await Promise.all([
      Job.find()
        .isActive("active")
        .sort({ created: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments({ status: "active" }),
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

export const getUserJobs = catchAsyncErrors(async (req, res, next) => {
  try {
    const job = await Job.find({
      createdBy: req.user._id,
    }).populate("createdBy", "name email createdAt avatar");
    if (!job)
      return next(
        new ErrorHandler("You donot have any Jobs ads right now", 404)
      );
    return res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
});
export const getSingleJobs = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(req.user);

    if (!id) return next(new ErrorHandler("Job ID not provided", 400));

    let query = Job.findById(id);

    const token = req.cookies.token;
    if (token) {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decode.id).select("-password");
      console.log("i am here also");
      query = query.populate("createdBy", "name email createdAt avatar");
    }

    const job = await query;

    if (!job) return next(new ErrorHandler("Not found", 404));

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
});

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

/* ======================================================
   1️⃣ REGEX SEARCH
   - Partial match
   - Works locally
   - Slower on large data
====================================================== */
export const regexSearch = catchAsyncErrors(async (req, res, next) => {
  try {
    const { word = "", location = "", page = 1, limit = 20 } = req.query;

    const wordRegex = new RegExp(word, "i");
    const locationRegex = new RegExp(location, "i");

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find({
      $and: [{ name: wordRegex }, { location: locationRegex }],
    })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      method: "regex",
      count: jobs.length,
      currentPage: Number(page),
      nextPage: jobs.length === Number(limit) ? Number(page) + 1 : null,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   2️⃣ TEXT SEARCH
   - Fast with index
   - Matches whole words
   - Works locally
   - Need text index in schema
====================================================== */
export const textSearch = catchAsyncErrors(async (req, res, next) => {
  try {
    const { word = "", location = "", page = 1, limit = 20 } = req.query;

    const query = [];
    if (word) query.push({ $text: { $search: word } });
    if (location) query.push({ location: new RegExp(location, "i") });

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(query.length ? { $and: query } : {}, {
      score: { $meta: "textScore" },
    })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      method: "text",
      count: jobs.length,
      currentPage: Number(page),
      nextPage: jobs.length === Number(limit) ? Number(page) + 1 : null,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   3️⃣ HYBRID SEARCH
   - Combines Text + Regex fallback
   - Balanced accuracy + performance
====================================================== */
export const hybridSearch = catchAsyncErrors(async (req, res, next) => {
  try {
    const { word = "", location = "", page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let jobs = [];

    if (word) {
      // Try text search first
      jobs = await Job.find(
        {
          $and: [
            { $text: { $search: word } },
            { location: new RegExp(location, "i") },
          ],
        },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Number(limit));
    }

    // Fallback to regex if no text search results
    if (jobs.length === 0 && word) {
      console.log("⚙️ Fallback to regex search");
      jobs = await Job.find({
        $and: [
          { name: new RegExp(word, "i") },
          { location: new RegExp(location, "i") },
        ],
      })
        .skip(skip)
        .limit(Number(limit));
    }

    res.status(200).json({
      success: true,
      method: jobs.length ? "hybrid" : "none",
      count: jobs.length,
      currentPage: Number(page),
      nextPage: jobs.length === Number(limit) ? Number(page) + 1 : null,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   3️⃣ ATLAS SEARCH
   - Smart fuzzy matching
   - Typo tolerant
   - Requires MongoDB Atlas
====================================================== */

/* ======================================================
   🔍 ATLAS SEARCH (MongoDB Atlas only)
   - Uses Atlas Search index
   - Supports fuzzy + multiple field matching
   - Super fast for large datasets
====================================================== */
export const atlasSearch = catchAsyncErrors(async (req, res, next) => {
  try {
    const { word = "", location = "", page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // If no search term, return recent jobs (with pagination)
    if (!word && !location) {
      const jobs = await Job.find().skip(skip).limit(Number(limit));
      return res.status(200).json({
        success: true,
        method: "atlas",
        count: jobs.length,
        currentPage: Number(page),
        data: jobs,
      });
    }

    const mustQueries = [];

    // Require BOTH word and location matches
    if (word) {
      mustQueries.push({
        text: {
          query: word,
          path: ["name", "description"],
          fuzzy: { maxEdits: 2 },
        },
      });
    }

    if (location) {
      mustQueries.push({
        text: {
          query: location,
          path: ["location"],
          fuzzy: { maxEdits: 2 },
        },
      });
    }

    const pipeline = [
      {
        $search: {
          index: "default", // your Atlas Search index name
          compound: {
            must: mustQueries,
          },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          location: 1,
          salary: 1,
          type: 1,
          score: { $meta: "searchScore" },
        },
      },
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const jobs = await Job.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      method: "atlas",
      count: jobs.length,
      currentPage: Number(page),
      nextPage: jobs.length === Number(limit) ? Number(page) + 1 : null,
      data: jobs,
    });
  } catch (error) {
    console.error("❌ Atlas Search Error:", error);
    next(error);
  }
});

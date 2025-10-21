import { Job } from "../Models/Job.Model.js";
import { RealState } from "../Models/RealState.Model.js";
import { Vehicle } from "../Models/Vehicle.Model.js";
import { Service } from "../Models/Service.Model.js";
import { catchAsyncErrors } from "../Middleware/catchAsyncError.js";

// ======================================================
// MODEL MAP — defines model, search index, and searchable fields
// ======================================================
const modelMap = {
  job: {
    model: Job,
    index: "default",
    paths: ["name", "description", "location", "type"],
    useAtlas: true,
  },
  realestate: {
    model: RealState,
    index: "realestate_search",
    paths: ["title", "description", "location", "address"],
    useAtlas: true,
  },
  vehicle: {
    model: Vehicle,
    index: "vehicles_search",
    paths: ["name", "description", "location", "make", "model", "year"],
    useAtlas: true,
  },
  service: {
    model: Service,
    index: null, // No Atlas Search index
    paths: ["name", "description", "location", "category"],
    useAtlas: false, // Use regex fallback
  },
};

// ======================================================
// GENERIC ATLAS SEARCH FUNCTION
// ======================================================
const atlasSearchGeneric = async (
  Model,
  indexName,
  word,
  location,
  page = 1,
  limit = 20,
  paths = ["name", "description", "location"]
) => {
  const must = [];

  // 🔍 Word search
  if (word) {
    must.push({
      text: {
        query: word,
        path: paths,
        fuzzy: { maxEdits: 2 },
      },
    });
  }

  // 📍 Location search
  if (location) {
    must.push({
      text: {
        query: location,
        path: ["location"],
        fuzzy: { maxEdits: 1 },
      },
    });
  }

  const skip = (Number(page) - 1) * Number(limit);
  const limitPlusOne = Number(limit) + 1;

  const pipeline = [
    {
      $search: {
        index: indexName,
        compound: {
          must: must.length ? must : undefined,
        },
      },
    },
    {
      $project: {
        name: 1,
        title: 1,
        make: 1,
        model: 1,
        description: 1,
        location: 1,
        salary: 1,
        type: 1,
        year: 1,
        price: 1,
        address: 1,
        score: { $meta: "searchScore" },
      },
    },
    { $skip: skip },
    { $limit: limitPlusOne },
  ];

  return await Model.aggregate(pipeline);
};

// ======================================================
// MAIN GLOBAL SEARCH CONTROLLER (supports Atlas + Regex)
// ======================================================
export const globalAtlasSearch = catchAsyncErrors(async (req, res, next) => {
  const {
    category = "job",
    word = "",
    location = "",
    page = 1,
    limit = 20,
  } = req.query;
  console.log("data recieve from query");

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);

  const selected = modelMap[category.toLowerCase()];
  if (!selected)
    return res
      .status(400)
      .json({ success: false, message: "Invalid category" });

  let rawResults = [];

  console.log("🔎 Searching =>", {
    category,
    word,
    location,
    pageNum,
    limitNum,
    useAtlas: selected.useAtlas,
  });

  if (selected.useAtlas) {
    // 🧠 Atlas Search branch
    rawResults = await atlasSearchGeneric(
      selected.model,
      selected.index,
      word,
      location,
      pageNum,
      limitNum,
      selected.paths
    );
  } else {
    // 🧩 Regex fallback (for Service)
    const wordRegex = word ? new RegExp(word, "i") : null;
    const locationRegex = location ? new RegExp(location, "i") : null;

    const wordCondition =
      wordRegex && selected.paths.length
        ? { $or: selected.paths.map((p) => ({ [p]: wordRegex })) }
        : {};

    const locationCondition = locationRegex ? { location: locationRegex } : {};
    console.log(locationCondition);

    const query =
      Object.keys(wordCondition).length && Object.keys(locationCondition).length
        ? { $and: [wordCondition, locationCondition] }
        : Object.keys(wordCondition).length
        ? wordCondition
        : Object.keys(locationCondition).length
        ? locationCondition
        : {};

    rawResults = await selected.model
      .find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum + 1);
  }
  console.log(rawResults);

  // ✂️ Pagination logic
  const hasMore = rawResults.length > limitNum;
  const sliced = hasMore ? rawResults.slice(0, limitNum) : rawResults;

  return res.status(200).json({
    success: true,
    category,
    method: selected.useAtlas ? "atlas" : "regex",
    page: pageNum,
    limit: limitNum,
    count: sliced.length,
    hasMore,
    nextPage: hasMore ? pageNum + 1 : null,
    data: sliced,
  });
});

import mongoose from "mongoose";

const jobSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      required: true,
    },
    isActive: {
      type: String,
      enum: ["pending", "active", "reject", "expired"],
      default: "active",
    },

    // images: [
    //   {
    //     public_id: {
    //       type: String,
    //       required: true,
    //     },
    //     url: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
jobSchema.query.isActive = function (status) {
  return this.where({ isActive: status });
};

// 🔍 TEXT INDEX for fast text search
jobSchema.index({
  name: "text",
  description: "text",
  location: "text",
  type: "text",
});
export const Job = mongoose.model("Job", jobSchema);

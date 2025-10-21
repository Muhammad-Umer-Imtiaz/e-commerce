import mongoose from "mongoose";

const realStateSchema = mongoose.Schema(
  {
    title: {
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
    price: {
      type: String,
      required: true,
    },
    // condition: {
    //   type: String,
    //   required: true,
    //   enum: ["New", "Old"],
    // },
    isActive: {
      type: String,
      enum: ["pending", "active", "reject", "expired"],
      default: "active",
    },

    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
realStateSchema.query.isActive = function (status) {
  return this.where({ isActive: status });
};
realStateSchema.index({
  title: "text",
  description: "text",
  location: "text",
  address: "text",
});
export const RealState = mongoose.model("RealState", realStateSchema);

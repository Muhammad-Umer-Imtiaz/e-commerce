import mongoose from "mongoose";

const vehicleSchema = mongoose.Schema(
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
    condition: {
      type: String,
      required: true,
      enum: ["New", "Old"],
    },
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
vehicleSchema.query.isActive = function (status) {
  return this.where({ isActive: status });
};
vehicleSchema.index({
  name: "text",
  description: "text",
  type: "text",
  location: "text",
});
export const Vehicle = mongoose.model("Vehicle", vehicleSchema);

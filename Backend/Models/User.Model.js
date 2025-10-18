import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    userName: {
      type: String,
      required: [true, "Username is required"],
      minLength: [3, "Username must be at least 3 characters"],
      maxLength: [20, "Username must be at most 20 characters"],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    resetPasswordExpire: Date,
    resetPasswordToken: String,
    otp: String,
    otpExpire: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only hash the password if it’s new or modified
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Optional: method to compare passwords later
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);

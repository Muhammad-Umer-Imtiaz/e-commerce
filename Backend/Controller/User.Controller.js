import { catchAsyncErrors } from "../Middleware/catchAsyncError.js";
import ErrorHandler from "../Middleware/error.js";
import { User } from "../Models/User.Model.js";
import { sendMail } from "../Utils/sendMail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcryptjs from "bcryptjs";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { email, userName, password } = req.body;
  const avatar = req.file;

  if (!email || !userName || !password)
    return next(new ErrorHandler("Please fill full form.", 400));

  let user = await User.findOne({ email });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpire = Date.now() + 10 * 60 * 1000;
  try {
    if (user && user.isVerified) {
      return next(
        new ErrorHandler("User already registered. Please login ", 400)
      );
    }

    if (user && !user.isVerified) {
      user.otp = otp;
      user.userName = userName;
      user.otpExpire = otpExpire;
      if (avatar) user.avatar = avatar;
      if (password) user.password = password;
      await user.save();
    }

    if (!user) {
      user = await User.create({
        userName,
        email,
        password,
        otpExpire,
        avatar: avatar || null,
        otp,
      });
    }

    await sendMail({
      email,
      subject: "🔐 Verify Your Account – OTP Code",
      text: `Your OTP is ${otp} and OTP expire in 10 minutes`,
    });

    return res.status(201).json({
      message: "Check Email to Verify OTP",
      user: {
        userName: user.userName,
        email: user.email,
        avatar: user.avatar || null,
        isVerified: user.isVerified,
      },
      success: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ErrorHandler("Email already exists", 400));
    }
    next(error);
  }
});

export const otpverify = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Request body:", req.body);

    const { otp } = req.body || {};
    console.log("OTP received:", otp);

    if (!otp) return next(new ErrorHandler("Please provide OTP", 400));

    const user = await User.findOne({ otp });

    if (!user) return next(new ErrorHandler("Invalid OTP", 400));
    if (user.otpExpire < Date.now()) {
      return next(
        new ErrorHandler("OTP has expired. Please request a new one.", 400)
      );
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({
        success: true,
        message: "Otp Verified SuccessFully",
        token,
        user: user,
      });
  } catch (error) {
    next(error);
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password)
      return next(new ErrorHandler("Please fill full Form", 400));
    const findUser = await User.findOne({ email }).select("+password");
    if (!findUser)
      return next(
        new ErrorHandler(
          "User with this email not exist please signup First",
          404
        )
      );
    if (findUser.isVerified != true)
      return next(new ErrorHandler("please Verify you account First"));
    const isMatch = await findUser.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    const token = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({
        success: true,
        message: "Login successful",
        token,
        findUser,
      });
  } catch (error) {
    next(error);
  }
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("API called for logout");
    res.cookie("token", "", { maxAge: 0 });
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
});

// Get Profile
export const getProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const userID = req.params.id;
    const user = await User.findById(userID).select("-password");
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export const editprofile = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userName } = req.body;
    const avatar = req.file;
    const id = req.user._id;
    console.log("id is ", id);
    if (!userName || !avatar)
      return next(new ErrorHandler("Missing Fields.", 400));
    let user = await User.findById(id);
    if (!user) return next(new ErrorHandler("User not found", 404));
    // if (email) user.email = email;
    if (userName) user.userName = userName;

    if (avatar) {
      user.avatar = avatar;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});
// Forget Password
export const forgetPassword = catchAsyncErrors(async (req, res, next) => {
  console.log("📨 Forget Password API called");

  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Please provide your email address", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash & set token
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/api/user/reset-password/${resetToken}`;
  // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // HTML Email Template
  try {
    await sendMail({
      email: user.email,
      subject: "Password Reset Request | AI Tools Cover",
      html: `
  <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f7fa;
      padding: 40px 20px;
      text-align: center;
      color: #333;
  ">
    <div style="
        background-color: #ffffff;
        max-width: 500px;
        margin: auto;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
    ">
      <div style="background-color: #4f46e5; padding: 20px;">
        <h2 style="color: #ffffff; margin: 0;">AI Tools Cover</h2>
      </div>

      <div style="padding: 30px;">
        <h3 style="margin-top: 0;">Password Reset Request</h3>
        <p style="font-size: 15px; line-height: 1.6;">
          Hi <strong>${user.name}</strong>,<br /><br />
          We received a request to reset your password. Click the button below to reset it.
          <br /><br />
          This link is valid for <strong>15 minutes</strong>.
        </p>

        <a href="${resetUrl}" style="
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
          transition: background 0.3s ease;
        ">Reset Password</a>

        <p style="font-size: 13px; color: #666;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f3f4f6; padding: 15px; font-size: 12px; color: #777;">
        <p style="margin: 0;">© ${new Date().getFullYear()} AI Tools Cover. All rights reserved.</p>
      </div>
    </div>
  </div>
  `,
    });

    return res.json({
      success: true,
      message: `Password reset link sent to ${user.email}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error("❌ Email send failed:", err);
    return next(
      new ErrorHandler("Email could not be sent. Please try again later", 500)
    );
  }
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    // Generate hashed token from URL parameter
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.id)
      .digest("hex");

    // Find user with token that is not expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler("Reset token is invalid or has expired", 400)
      );
    }

    if (password !== confirmPassword) {
      return next(
        new ErrorHandler("Password and Confirm Password do not match", 400)
      );
    }

    // Assign new password (pre-save hook will hash it automatically)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save user (pre-save hook triggers here)
    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
});

export const changePassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword)
      return new ErrorHandler("Old or new Password are missing", 404);
    if (newPassword !== confirmPassword) {
      return next(
        new ErrorHandler("Password and Confirm Password do not match", 400)
      );
    }
    console.log(req.user._id);
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return next(new ErrorHandler("User not found", 404));
    const isMatch = await user.comparePassword(oldPassword);
    console.log("Hello from ", isMatch);
    if (!isMatch) {
      return next(
        new ErrorHandler(
          "Wrong old Password please Enter Correct passowrd if you donot remeber your old password then go on forget password",
          401
        )
      );
    }
    user.password = newPassword;
    await user.save();
    return res.json({ success: true, message: "Password Change successful" });
  } catch (error) {
    next(error);
  }
});

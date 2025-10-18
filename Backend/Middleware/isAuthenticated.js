import jwt from "jsonwebtoken";
import { User } from "../Models/User.Model.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(400)
        .json({ message: "Invalid Token, Please login First" });
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode)
      return res
        .status(400)
        .json({ message: "Token doesn't Match, please Login first" });
    const user = await User.findById(decode.id).select("-password");
    if (!user) return res.status(400).json({ message: "user Not Found" });
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Issue in Authentication" });
  }
};

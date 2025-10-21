import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database is Connected SuccessFully");
  } catch (error) {
    console.log("Database Connection Failed ", error);
  }
};

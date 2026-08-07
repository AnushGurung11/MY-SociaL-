import mongoose from "mongoose";

export const connectDB = async (dbUrl) => {
  try {
    await mongoose.connect(dbUrl);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

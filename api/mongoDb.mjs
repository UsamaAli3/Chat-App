import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();



const uri = process.env.MONGODB_URI;

const connectDB = () => {
  mongoose
  .connect(uri)
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });
};

export default connectDB;

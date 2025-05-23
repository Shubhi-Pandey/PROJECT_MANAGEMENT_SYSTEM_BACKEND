// db/connect.js
import mongoose from "mongoose";

const connectDB = async (URL) => {
  try {
    
    await mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;

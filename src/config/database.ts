import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.DATABASE_CONNECTION;

  if (!mongoURI) {
    console.error("MongoDB URI is missing in the environment variables.");
    process.exit(1); // Exit process with failure code
  }

  // Connect to MongoDB using Mongoose
  mongoose.connect(mongoURI);

  // Event listeners for connection status
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully!");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
};

export default connectDB;

// server.js
import express from "express";
import connectDB from "./db/connect.js";
import dotenv from "dotenv";
import cors from "cors";
// import superadminRouter from "./routes/superadmin.js"; // Import superadmin router
import adminRouter from "./routes/admin.js"; // Import admin router
import managerRouter from "./routes/manager.js";
// import userRouter from "./routes/users.js";
import errorResponseHandler from "./middleware/errorHandler.js";
import userRouter from "./routes/users.js";

dotenv.config();

const server = express();
// Connect to the database
connectDB(process.env.MONGODB_URI);

// Middleware to parse JSON requests
server.use(express.json());

// Enable CORS
server.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
  }),
);

// Use routers
// server.use("/superadmin", superadminRouter); // Superadmin routes
server.use("/admin", adminRouter); // Admin routes
server.use("/manager", managerRouter); //Manager routes
server.use("/user", userRouter); // User routes
server.use(errorResponseHandler);
// Simple route for testing
server.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(
    `Server is running on http://${process.env.HOST}:${process.env.PORT}`,
  );
});

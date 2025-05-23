import Project from "../models/projectModel";
import Task from "../models/taskModel";
import User from "../models/userModel";
import jwt from "jsonwebtoken";

export const memberLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      statusCode: 400,
      message: "Username and password are required.",
    });
  }

  try {
    const member = await User.findOne({ email: username });

    if (!member || member.role !== "Member") {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid credentials or not a member.",
      });
    }

    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid username or password.",
      });
    }
    // Access Token (short-lived)
    const payload = {
      id: member._id,
      role: member.role,
      name: member.username,
      email: member.email,
      password: member.password,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Refresh Token (long-lived)
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Return tokens
    return res.status(200).json({
      statusCode: 200,
      message: "Login successful!",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error logging in.",
    });
  }
};

export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // If Member is trying to update, check assignedTo
    if (req.member.role === "Member") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    // Allow Admin or Manager to update freely
    if (status) task.status = status;

    await task.save();

    res.status(200).json({ message: "Task updated", task });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating task", error: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const userId = req.member._id;
    const companyId = req.user.companyId;

    // Base query - only for current company and tasks created by the user
    const query = {
      companyId,
      createdBy: userId,
    };

    // Optional: Filter by status
    if (status) {
      query.status = status;
    }

    // Optional: Filter by assignedTo (expects userId)
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo")
      .populate("projectId");

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching tasks",
      error: err.message,
    });
  }
};

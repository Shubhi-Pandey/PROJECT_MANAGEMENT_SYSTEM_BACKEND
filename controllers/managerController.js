import Project from "../models/projectModel";
import Task from "../models/taskModel";
import User from "../models/userModel";
import jwt from "jsonwebtoken";

export const managerLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      statusCode: 400,
      message: "Username and password are required.",
    });
  }

  try {
    const manager = await User.findOne({ email: username });

    if (!manager || manager.role !== "Manager") {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid credentials or not a Manager.",
      });
    }

    const isMatch = await manager.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid username or password.",
      });
    }
    // Access Token (short-lived)
    const payload = {
      id: manager._id,
      role: manager.role,
      name: manager.username,
      email: manager.email,
      password: manager.password,
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

export const getmanagerprofile = async (req, res, next) => {
  return res.json({});
};

export const createProject = async (req, res) => {
  try {
    const { name, description, companyId, startDate, endDate } = req.body;

    const newProject = await Project.create({
      name,
      description,
      createdBy: req.manager._id,
      companyId,
      startDate,
      endDate,
    });

    res.status(201).json({ message: "Project created", project: newProject });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create project", error: err.message });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("companyId");
    res.status(200).json(projects);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: err.message });
  }
};

// Get one project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json(project);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching project", error: err.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, companyId, startDate, endDate } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        name,
        description,
        companyId,
        startDate,
        endDate,
      },
      { new: true }, // returns updated document
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res
      .status(200)
      .json({ message: "Project updated", project: updatedProject });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update project", error: err.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { isBlocked: true },
      { new: true },
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully", project });
  } catch (err) {
    res.status(500).json({
      message: "Failed to block project",
      error: err.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, projectId, companyId } =
      req.body;

    const task = await Task.create({
      title,
      description,
      status,
      assignedTo,
      projectId,
      companyId: companyId,
      assignedBy: req.manager._id,
    });

    res.status(201).json({ message: "Task created", task });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create task", error: err.message });
  }
};

// Get all tasks (Admin/Manager gets all, Member gets only their own)
export const getTasks = async (req, res) => {
  try {
    const userId = req.manager._id;

    const tasks = await Task.find({
      assignedBy: userId, // Show only tasks created by the logged-in user
    })
      .populate("assignedTo")
      .populate("projectId")
      .populate("assignedBy");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching tasks",
      error: err.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      req.user.role === "Member" &&
      String(task.assignedTo) !== String(req.user.id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    const { title, description, status } = req.body;

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;

    await task.save();

    res.status(200).json({ message: "Task updated", task });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update task", error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.isBlocked = true;
    await task.save();

    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete task", error: err.message });
  }
};

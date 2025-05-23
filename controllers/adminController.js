import bcrypt from "bcrypt";
import Admin from "../models/adminModel";
import Company from "../models/companyModel";
import User from "../models/userModel";
import Project from "../models/projectModel";
import jwt from "jsonwebtoken";
import Task from "../models/taskModel";
// Signup handler
export const signup = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      statusCode: 400,
      message: "Username, password, and email are required.",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "User already exists." });
    }

    // Create the user with the hashed password
    const newUser = await Admin.create({ username, password, email });
    await newUser.save();
    return res
      .status(201)
      .json({ statusCode: 400, message: "User created successfully!" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ statusCode: 500, message: "Error creating user." });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      statusCode: 400,
      message: "Username and password are required.",
    });
  }
  try {
    // Check if user exists in Admin or SuperAdmin collections
    const admin = await Admin.findOne({ email: username });
    if (admin) {
      // Compare password with the `comparePassword` method on the `admin` instance
      const isMatchAdmin = await admin.comparePassword(password);
      if (isMatchAdmin) {
        const payload = {
          id: admin._id,
          role: admin.role,
          name: admin.username,
          email: admin.email,
          password: admin.password,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5h",
        });

        return res
          .status(200)
          .json({ statusCode: 200, message: "Login successful!", token });
      }
    }
    // If neither condition matches, credentials are incorrect
    return res
      .status(401)
      .json({ statusCode: 401, message: "Invalid username or password." });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ statusCode: 500, message: "Error logging in." });
  }
};

export const getadminprofile = async (req, res, next) => {
  console.log(req.admin);
  return res.json({});
};

export const registerCompany = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const existingCompany = await Company.findOne({
      $or: [{ name }, { domain }],
    });

    if (existingCompany) {
      return res.status(400).json({
        message: "Company name or domain already exists",
      });
    }

    const company = await Company.create({
      name,
      domain,
      adminId: req.admin._id,
    });
    res.status(201).json({
      message: "Company registered successfully",
      company,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
};
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ adminId: req.admin._id });
    res.status(200).json({ companies });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Server error while fetching companies" });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, domain } = req.body;

    const company = await Company.findOne({
      _id: companyId,
      adminId: req.admin._id,
    });
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found or you don't have access" });
    }

    // Check if new name or domain already exists in other companies
    const exists = await Company.findOne({
      $or: [{ name }, { domain }],
      _id: { $ne: companyId },
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Company name or domain already taken" });
    }

    company.name = name || company.name;
    company.domain = domain || company.domain;

    await company.save();

    res.json({ message: "Company updated successfully", company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error!" });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Soft delete = update isBlocked to true
    const company = await Company.findOneAndUpdate(
      { _id: companyId, adminId: req.admin._id },
      { isBlocked: true },
      { new: true },
    );

    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found or access denied" });
    }

    res.json({
      message: "Company deleted successfully",
      company,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error!" });
  }
};

export const createMember = async (req, res) => {
  try {
    const { name, email, password, companyId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    const newUser = await User.create({
      name,
      email,
      password,
      companyId: companyId,
      role: "Member",
    });

    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const createManager = async (req, res) => {
  try {
    const { name, email, password, companyId } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });
    const newUser = await User.create({
      name,
      email,
      password,
      companyId: companyId,
      role: "Manager",
    });
    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listUsersByCompany = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.admin.companyId });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const createProject = async (req, res) => {
  try {
    // const creatorId = req.admin?._id || req.manager?._id;
    const { name, description, companyId, startDate, endDate } = req.body;

    const newProject = await Project.create({
      name,
      description,
      createdBy: req.admin._id,
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
      assignedBy: req.admin._id,
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
    const userId = req.admin._id;

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
      req.admin.role === "Member" &&
      String(task.assignedTo) !== String(req.admin.id)
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
      .json({ message: "Failed to block task", error: err.message });
  }
};

// routes/admin.js
import { Router } from "express";
import {
  signup,
  login,
  getadminprofile,
  registerCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  createMember,
  createManager,
  listUsersByCompany,
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectById,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/adminController";
import { checkUser } from "../middleware/authMiddleware";
const adminRouter = Router();

// Signup route
adminRouter.post("/signup", signup);

// Login route
adminRouter.post("/login", login);
adminRouter.get("/getadminprofile", checkUser, getadminprofile);

//Company Route
adminRouter.post("/companies", checkUser, registerCompany);
adminRouter.get("/get/companies", checkUser, getCompanies);
adminRouter.put("/edit/:companyId", checkUser, updateCompany);
adminRouter.delete("/delete/:companyId", checkUser, deleteCompany);

//Member create Route
adminRouter.post("/create-member", checkUser, createMember);

//Manager create Route
adminRouter.post("/create-manager", checkUser, createManager);

// Company users list
adminRouter.get("/list", checkUser, listUsersByCompany);

// Project Routes
adminRouter.post("/create-project", checkUser, createProject);
adminRouter.get("/get-projects", checkUser, getProjects);
adminRouter.get("/get-project/:projectId", checkUser, getProjectById);
adminRouter.put("/edit-project/:projectId", checkUser, updateProject);
adminRouter.delete("/delete-project/:projectId", checkUser, deleteProject);

//Task Routes
adminRouter.post("/create-task", checkUser, createTask);
adminRouter.get("/get-tasks", checkUser, getTasks);
adminRouter.put("/edit-task/:taskId", checkUser, updateTask);
adminRouter.delete("/delete-task/:taskId", checkUser, deleteTask);

export default adminRouter;

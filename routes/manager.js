import { Router } from "express";
const managerRouter = Router();
import {
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  getProjectById,
  getProjects,
  getTasks,
  managerLogin,
  updateProject,
  updateTask,
} from "../controllers/managerController";
import { checkManager } from "../middleware/authMiddleware.js";
// Login route
managerRouter.post("/login", managerLogin);
// managerRouter.get("/getadminprofile", checkUser, getmanagerprofile);

//Project routes
managerRouter.post("/create-project", checkManager, createProject);
managerRouter.get("/get-projects", checkManager, getProjects);
managerRouter.get("get-project/:projectId", checkManager, getProjectById);
managerRouter.put("edit-project/:projectId", checkManager, updateProject);
managerRouter.delete("delete-project/:projectId", checkManager, deleteProject);

//Task Routes
managerRouter.post("/create-task", checkManager, createTask);
managerRouter.get("/get-tasks", checkManager, getTasks);
managerRouter.put("edit-task/:taskId", checkManager, updateTask);
managerRouter.delete("delete-task/:taskId", checkManager, deleteTask);

export default managerRouter;

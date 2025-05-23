import express from "express";
import {
  getTasks,
  memberLogin,
  updateTask,
} from "../controllers/usersController.js";
import { checkMember } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/login", memberLogin);

// Update task (for assigned member or admin/manager)
userRouter.put("/edit-task/:taskId", checkMember, updateTask);
userRouter.get("/get-tasks", checkMember, getTasks);
export default userRouter;

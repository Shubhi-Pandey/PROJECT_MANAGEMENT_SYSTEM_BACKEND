import jwt from "jsonwebtoken";
import Admin from "../models/adminModel";
import User from "../models/userModel";
// import SuperAdmin from "../models/superAdminModel";

export const checkUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  if (!token) {
    return res
      .status(401)
      .json({ statusCode: 401, message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (admin) {
      req.admin = admin;
      next();
    } else {
      const err = new Error("User not found!");
      next(err);
    }
  } catch (error) {
    next(error);
  }
};
export const checkManager = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  if (!token) {
    return res
      .status(401)
      .json({ statusCode: 401, message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const manager = await User.findById(decoded.id);

    if (manager) {
      if (!manager || manager.role !== "Manager") {
        return res.status(403).json({ message: "Only managers allowed" });
      }

      req.manager = manager;
      next();
    } else {
      const err = new Error("User not found!");
      next(err);
    }
  } catch (error) {
    next(error);
  }
};
export const checkMember = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  if (!token) {
    return res
      .status(401)
      .json({ statusCode: 401, message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Admin.findById(decoded.id);

    if (member) {
      if (!member || member.role !== "Member") {
        return res.status(403).json({ message: "Only members allowed" });
      }

      req.member = member;
      next();
    } else {
      const err = new Error("User not found!");
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

// models/adminModel.js
import mongoose from "mongoose";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false, // Default value is false (not blocked)
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
    return next();
  }
  return next();
});

adminSchema.methods.generateJWT = async function () {
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};
const Admin = mongoose.model("Admin", adminSchema);

export default Admin;

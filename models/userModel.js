const mongoose = require("mongoose");
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Manager", "Member"],
    default: "Member",
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false, // Default value is false (not blocked)
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
    return next();
  }
  return next();
});

userSchema.methods.generateJWT = async function () {
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema);

export default User;

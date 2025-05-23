// models/adminModel.js
import mongoose from "mongoose";
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    domain: {
      type: String,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false, // Default value is false (not blocked)
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Reference to the Admin user
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// adminSchema.methods.generateJWT = async function () {
//   return sign({ id: this._id }, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };

const Company = mongoose.model("Company", companySchema);

export default Company;

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userType: { type: String, enum: ["Admin", "Recruiter"], default: "Recruiter" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);

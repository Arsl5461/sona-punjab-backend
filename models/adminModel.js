import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "subadmin"], required: true },
  },
  { timestamps: true }
);

const adminModal = mongoose.model("admin", adminSchema);
export default adminModal;

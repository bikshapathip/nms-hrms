import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  gstNumber: { type: String, default: "" },
  cinNumber: { type: String, default: "" },
  address: { type: String, default: "" },
  locations: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);

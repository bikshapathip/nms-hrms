import mongoose from "mongoose";

const slabSchema = new mongoose.Schema({
  minDays: { type: Number, required: true },
  maxDays: { type: Number, required: true },
  type: { type: String, enum: ["Flat", "Percentage"], default: "Flat" },
  value: { type: Number, default: 0 },
}, { _id: false });

const SalaryTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  role: { type: String, required: true },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
  location: { type: String, default: "" },
  gender: { type: String, enum: ["Male", "Female", "Any"], default: "Any" },

  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  statutoryBonus: { type: Number, default: 0 },
  leaveEncashmentSlabs: [slabSchema],
  attendanceBonusSlabs: [slabSchema],
  performanceBonusSlabs: [slabSchema],
  specialAllowanceSlabs: [slabSchema],
  nightAllowanceSlabs: [slabSchema],
  travellingAllowanceSlabs: [slabSchema],
  otherAllowance: { type: Number, default: 0 },
  otAmount: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 200 },
  tdsPercent: { type: Number, default: 0 },
  lwf: { type: Number, default: 0 },

  pfEnabled: { type: Boolean, default: true },
  pfPercent: { type: Number, default: 12 },
  employerPfEnabled: { type: Boolean, default: true },
  employerPfPercent: { type: Number, default: 13 },
  esiEnabled: { type: Boolean, default: false },
  esiPercent: { type: Number, default: 0.75 },
  employerEsiEnabled: { type: Boolean, default: false },
  employerEsiPercent: { type: Number, default: 3.25 },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.SalaryTemplate || mongoose.model("SalaryTemplate", SalaryTemplateSchema);

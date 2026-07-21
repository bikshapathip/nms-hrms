import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },

  // Attendance
  totalWorkingDays: { type: Number, required: true },
  daysWorked: { type: Number, required: true },

  // Earnings
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  otherAllowance: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true },

  // Pro-rated (based on attendance)
  earnedBasic: { type: Number, required: true },
  earnedHra: { type: Number, default: 0 },
  earnedDa: { type: Number, default: 0 },
  earnedSpecialAllowance: { type: Number, default: 0 },
  earnedOtherAllowance: { type: Number, default: 0 },
  earnedGross: { type: Number, required: true },

  // Deductions
  pfDeduction: { type: Number, default: 0 },
  esiDeduction: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  tdsDeduction: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, required: true },

  // Net
  netSalary: { type: Number, required: true },
}, { timestamps: true });

SalarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Salary || mongoose.model("Salary", SalarySchema);

import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },

  // Attendance
  totalWorkingDays: { type: Number, required: true },
  daysWorked: { type: Number, required: true },
  overtimeHours: { type: Number, default: 0 },

  // Earnings (fixed monthly figures)
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  otherAllowance: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true },

  // Pro-rated (based on attendance)
  earnedBasic: { type: Number, required: true },
  earnedHra: { type: Number, default: 0 },
  earnedDa: { type: Number, default: 0 },
  earnedOtherAllowance: { type: Number, default: 0 },

  // Attendance-slab-based earnings (resolved from that month's days present)
  leaveEncashment: { type: Number, default: 0 },
  attendanceBonus: { type: Number, default: 0 },
  performanceBonus: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  nightAllowance: { type: Number, default: 0 },
  travellingAllowance: { type: Number, default: 0 },

  // OT: rate (₹/hour) × overtimeHours worked that month
  otAmount: { type: Number, default: 0 },

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

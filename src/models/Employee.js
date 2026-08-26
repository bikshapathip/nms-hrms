import mongoose from "mongoose";

const slabSchema = new mongoose.Schema({
  minDays: { type: Number, required: true },
  maxDays: { type: Number, required: true },
  type: { type: String, enum: ["Flat", "Percentage"], default: "Flat" },
  value: { type: Number, default: 0 },
}, { _id: false });

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
  dateOfBirth: { type: Date, default: null },
  contactNumber: { type: String, default: "" },
  email: { type: String, default: "" },
  designation: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
  clientLocation: { type: String, default: "" },
  dateOfJoining: { type: Date, required: true },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  address: { type: String, default: "" },
  addressCity: { type: String, default: "" },
  addressState: { type: String, default: "" },
  addressZipCode: { type: String, default: "" },
  maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"], default: "Single" },
  referenceUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  remarks: { type: String, default: "" },

  // Documents
  panNumber: { type: String, default: "" },
  aadharNumber: { type: String, default: "" },
  esicNumber: { type: String, default: "" },
  uanNumber: { type: String, default: "" },

  // Bank Details
  bankName: { type: String, default: "" },
  bankAccount: { type: String, default: "" },
  ifscCode: { type: String, default: "" },

  // Salary template this employee's salary was populated from (for reference only)
  salaryTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryTemplate", default: null },

  // Salary Structure (monthly)
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

  // Deduction flags
  pfEnabled: { type: Boolean, default: true },
  pfPercent: { type: Number, default: 12 },
  employerPfEnabled: { type: Boolean, default: true },
  employerPfPercent: { type: Number, default: 13 },
  esiEnabled: { type: Boolean, default: false },
  esiPercent: { type: Number, default: 0.75 },
  employerEsiEnabled: { type: Boolean, default: false },
  employerEsiPercent: { type: Number, default: 3.25 },
  professionalTax: { type: Number, default: 200 },
  tdsPercent: { type: Number, default: 0 },
  lwf: { type: Number, default: 0 },

  workingStatus: { type: String, enum: ["Active", "Inactive", "Terminated", "Resigned", "On Leave"], default: "Active" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual for full name
EmployeeSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

EmployeeSchema.set("toJSON", { virtuals: true });
EmployeeSchema.set("toObject", { virtuals: true });

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

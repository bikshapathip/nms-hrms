import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
  dateOfBirth: { type: Date, default: null },
  contactNumber: { type: String, default: "" },
  email: { type: String, default: "" },
  designation: { type: String, required: true },
  department: { type: String, default: "" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
  clientLocation: { type: String, default: "" },
  dateOfJoining: { type: Date, required: true },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  address: { type: String, default: "" },
  maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"], default: "Single" },
  nthEmployee: { type: String, default: "" },
  referenceName: { type: String, default: "" },
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

  // Salary Structure (monthly)
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  otherAllowance: { type: Number, default: 0 },

  // Deduction flags
  pfEnabled: { type: Boolean, default: true },
  esiEnabled: { type: Boolean, default: false },
  professionalTax: { type: Number, default: 200 },
  tdsPercent: { type: Number, default: 0 },

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

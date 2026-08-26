import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalWorkingDays: { type: Number, required: true, default: 26 },
  daysWorked: { type: Number, required: true, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  leaveDays: { type: Number, default: 0 },
}, { timestamps: true });

AttendanceSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

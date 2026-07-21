import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Attendance from "@/models/Attendance";
import Salary from "@/models/Salary";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { month, year } = await request.json();

  if (!month || !year) {
    return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
  }

  const employees = await Employee.find({ isActive: true }).lean();
  const attendances = await Attendance.find({ month, year }).lean();

  const attendanceMap = {};
  attendances.forEach((a) => {
    attendanceMap[a.employee.toString()] = a;
  });

  const results = [];

  for (const emp of employees) {
    const att = attendanceMap[emp._id.toString()];
    if (!att || att.daysWorked === 0) continue;

    const totalWorkingDays = att.totalWorkingDays || 26;
    const daysWorked = att.daysWorked || 0;
    const ratio = daysWorked / totalWorkingDays;

    // Earnings
    const grossSalary = emp.basicSalary + emp.hra + emp.da + emp.specialAllowance + emp.otherAllowance;

    const earnedBasic = Math.round(emp.basicSalary * ratio);
    const earnedHra = Math.round(emp.hra * ratio);
    const earnedDa = Math.round(emp.da * ratio);
    const earnedSpecialAllowance = Math.round(emp.specialAllowance * ratio);
    const earnedOtherAllowance = Math.round(emp.otherAllowance * ratio);
    const earnedGross = earnedBasic + earnedHra + earnedDa + earnedSpecialAllowance + earnedOtherAllowance;

    // Deductions
    const pfDeduction = emp.pfEnabled ? Math.round(earnedBasic * 0.12) : 0;
    const esiDeduction = emp.esiEnabled && earnedGross <= 21000 ? Math.round(earnedGross * 0.0075) : 0;
    const professionalTax = daysWorked > 0 ? emp.professionalTax : 0;
    const tdsDeduction = emp.tdsPercent > 0 ? Math.round(earnedGross * emp.tdsPercent / 100) : 0;

    const totalDeductions = pfDeduction + esiDeduction + professionalTax + tdsDeduction;
    const netSalary = earnedGross - totalDeductions;

    const salaryData = {
      employee: emp._id,
      month,
      year,
      totalWorkingDays,
      daysWorked,
      basicSalary: emp.basicSalary,
      hra: emp.hra,
      da: emp.da,
      specialAllowance: emp.specialAllowance,
      otherAllowance: emp.otherAllowance,
      grossSalary,
      earnedBasic,
      earnedHra,
      earnedDa,
      earnedSpecialAllowance,
      earnedOtherAllowance,
      earnedGross,
      pfDeduction,
      esiDeduction,
      professionalTax,
      tdsDeduction,
      otherDeductions: 0,
      totalDeductions,
      netSalary,
    };

    const salary = await Salary.findOneAndUpdate(
      { employee: emp._id, month, year },
      salaryData,
      { upsert: true, new: true }
    );

    results.push(salary);
  }

  return NextResponse.json({ message: `Generated ${results.length} payslips`, count: results.length });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Salary from "@/models/Salary";
import Employee from "@/models/Employee";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const employee = await Employee.findById(params.id).lean();
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  employee.name = `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

  const payslips = await Salary.find({ employee: params.id }).sort({ year: -1, month: -1 }).lean();

  return NextResponse.json({ employee, payslips });
}

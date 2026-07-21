import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Salary from "@/models/Salary";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month"));
  const year = parseInt(searchParams.get("year"));

  if (!month || !year) {
    return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
  }

  await dbConnect();

  const payslips = await Salary.find({ month, year })
    .populate("employee", "employeeId name designation department client clientLocation")
    .sort({ "employee.name": 1 })
    .lean();

  return NextResponse.json(payslips);
}

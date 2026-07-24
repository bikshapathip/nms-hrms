import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";

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

  const employees = await Employee.find({ isActive: true }).sort({ name: 1 }).lean();
  const attendances = await Attendance.find({ month, year }).lean();

  const attendanceMap = {};
  attendances.forEach((a) => {
    attendanceMap[a.employee.toString()] = a;
  });

  const result = employees.map((emp) => {
    const att = attendanceMap[emp._id.toString()];
    return {
      _id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name,
      designation: emp.designation,
      client: emp.client,
      state: emp.state,
      city: emp.city,
      clientLocation: emp.clientLocation,
      attendance: att
        ? {
            _id: att._id,
            totalWorkingDays: att.totalWorkingDays,
            daysWorked: att.daysWorked,
            leaveDays: att.leaveDays,
            overtimeDays: att.overtimeDays,
          }
        : {
            totalWorkingDays: 26,
            daysWorked: 0,
            leaveDays: 0,
            overtimeDays: 0,
          },
    };
  });

  return NextResponse.json(result);
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  const { employeeId, month, year, totalWorkingDays, daysWorked, leaveDays, overtimeDays } = body;

  if (!employeeId || !month || !year) {
    return NextResponse.json({ error: "Employee ID, month, and year are required" }, { status: 400 });
  }

  const attendance = await Attendance.findOneAndUpdate(
    { employee: employeeId, month, year },
    {
      employee: employeeId,
      month,
      year,
      totalWorkingDays: totalWorkingDays || 26,
      daysWorked: daysWorked || 0,
      leaveDays: leaveDays || 0,
      overtimeDays: overtimeDays || 0,
    },
    { upsert: true, new: true, runValidators: true }
  );

  return NextResponse.json(attendance);
}

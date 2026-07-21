import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Salary from "@/models/Salary";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const payslip = await Salary.findById(params.id)
    .populate("employee", "employeeId name designation department bankAccount panNumber uanNumber dateOfJoining")
    .lean();

  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(payslip);
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import "@/models/Client";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const employee = await Employee.findById(params.id).populate("client", "clientName locations").lean();
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!employee.name) employee.name = `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

  return NextResponse.json(employee);
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  const employee = await Employee.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(employee);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const employee = await Employee.findByIdAndDelete(params.id);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ message: "Employee deleted" });
}

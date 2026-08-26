import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SalaryTemplate from "@/models/SalaryTemplate";
import "@/models/Client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const templates = await SalaryTemplate.find({ isActive: true })
    .populate("client", "clientName")
    .sort({ name: 1 })
    .lean();

  return NextResponse.json(templates);
}

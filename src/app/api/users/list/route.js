import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const users = await User.find({ isActive: true })
    .select("firstName lastName username userType")
    .sort({ firstName: 1, lastName: 1 })
    .lean();

  return NextResponse.json(users);
}

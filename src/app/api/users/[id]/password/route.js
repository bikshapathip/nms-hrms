import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { password } = await request.json();

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const user = await User.findById(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  user.password = await bcrypt.hash(password, 12);
  await user.save();

  return NextResponse.json({ message: "Password updated successfully" });
}

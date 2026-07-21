import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findById(params.id).select("-password").lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  // Validation
  const errors = {};
  if (!body.firstName?.trim()) errors.firstName = "First name is required";
  if (!body.lastName?.trim()) errors.lastName = "Last name is required";
  if (!body.username?.trim()) errors.username = "Username is required";
  else if (body.username.length < 3) errors.username = "Username must be at least 3 characters";
  else if (!/^[a-zA-Z0-9_]+$/.test(body.username)) errors.username = "Only letters, numbers, underscores";
  if (!body.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = "Invalid email format";
  if (body.phone && !/^[0-9]{10}$/.test(body.phone)) errors.phone = "Phone must be 10 digits";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  // Check uniqueness (exclude current user)
  const existingUsername = await User.findOne({ username: body.username, _id: { $ne: params.id } });
  if (existingUsername) return NextResponse.json({ error: "Username already exists", errors: { username: "Username already taken" } }, { status: 400 });

  const existingEmail = await User.findOne({ email: body.email, _id: { $ne: params.id } });
  if (existingEmail) return NextResponse.json({ error: "Email already exists", errors: { email: "Email already in use" } }, { status: 400 });

  const updateData = {
    userType: body.userType === "Admin" ? "Admin" : "Recruiter",
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    username: body.username.trim().toLowerCase(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone || "",
    isActive: body.isActive ?? true,
  };

  const user = await User.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true }).select("-password");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findByIdAndDelete(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ message: "User deleted" });
}

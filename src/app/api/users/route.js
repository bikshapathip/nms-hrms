import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const sortField = searchParams.get("sortField") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const allowedSortFields = ["firstName", "lastName", "username", "email", "userType", "isActive", "createdAt"];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
  const sortQuery = { [safeSortField]: sortOrder };

  const filter = { _id: { $ne: session.user.id } };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(filter);

  if (limit === 0) {
    const users = await User.find(filter).select("-password").sort(sortQuery).lean();
    return NextResponse.json({ users, pagination: { page: 1, limit: 0, total, totalPages: 1 } });
  }

  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select("-password")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  return NextResponse.json({ users, pagination: { page, limit, total, totalPages } });
}

export async function POST(request) {
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
  else if (!/^[a-zA-Z0-9_]+$/.test(body.username)) errors.username = "Username can only contain letters, numbers, and underscores";
  if (!body.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = "Invalid email format";
  if (!body.password) errors.password = "Password is required";
  else if (body.password.length < 6) errors.password = "Password must be at least 6 characters";
  if (body.phone && !/^[0-9]{10}$/.test(body.phone)) errors.phone = "Phone must be 10 digits";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  // Check uniqueness
  const existingUsername = await User.findOne({ username: body.username });
  if (existingUsername) return NextResponse.json({ error: "Username already exists", errors: { username: "Username already taken" } }, { status: 400 });

  const existingEmail = await User.findOne({ email: body.email });
  if (existingEmail) return NextResponse.json({ error: "Email already exists", errors: { email: "Email already in use" } }, { status: 400 });

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const user = await User.create({
    userType: body.userType === "Admin" ? "Admin" : "Recruiter",
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    username: body.username.trim().toLowerCase(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone || "",
    password: hashedPassword,
  });

  const { password, ...userWithoutPassword } = user.toObject();
  return NextResponse.json(userWithoutPassword, { status: 201 });
}

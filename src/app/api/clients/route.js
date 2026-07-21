import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";

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

  const allowedSortFields = ["clientName", "email", "phone", "gstNumber", "isActive", "createdAt"];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
  const sortQuery = { [safeSortField]: sortOrder };

  const filter = search
    ? {
        $or: [
          { clientName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { gstNumber: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const total = await Client.countDocuments(filter);

  if (limit === 0) {
    const clients = await Client.find(filter).sort(sortQuery).lean();
    return NextResponse.json({ clients, pagination: { page: 1, limit: 0, total, totalPages: 1 } });
  }

  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const clients = await Client.find(filter).sort(sortQuery).skip(skip).limit(limit).lean();

  return NextResponse.json({ clients, pagination: { page, limit, total, totalPages } });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  const errors = {};
  if (!body.clientName?.trim()) errors.clientName = "Client name is required";
  if (!body.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = "Invalid email format";
  if (body.phone && !/^[0-9]{10}$/.test(body.phone)) errors.phone = "Phone must be 10 digits";
  if (body.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(body.gstNumber.toUpperCase())) {
    errors.gstNumber = "Invalid GST format (e.g. 29ABCDE1234F1Z5)";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  const client = await Client.create({
    clientName: body.clientName.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone || "",
    gstNumber: body.gstNumber ? body.gstNumber.toUpperCase().trim() : "",
    cinNumber: body.cinNumber ? body.cinNumber.toUpperCase().trim() : "",
    address: body.address || "",
    locations: Array.isArray(body.locations) ? body.locations.filter(l => l.trim()) : [],
  });

  return NextResponse.json(client, { status: 201 });
}

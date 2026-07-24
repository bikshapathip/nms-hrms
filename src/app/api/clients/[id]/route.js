import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const client = await Client.findById(params.id).lean();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  return NextResponse.json(client);
}

export async function PUT(request, { params }) {
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
    errors.gstNumber = "Invalid GST format";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  const updateData = {
    clientName: body.clientName.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone || "",
    gstNumber: body.gstNumber ? body.gstNumber.toUpperCase().trim() : "",
    cinNumber: body.cinNumber ? body.cinNumber.toUpperCase().trim() : "",
    locations: Array.isArray(body.locations)
      ? body.locations
          .map((l) => ({
            state: (l.state || "").trim(),
            city: (l.city || "").trim(),
            location: (l.location || "").trim(),
            address: (l.address || "").trim(),
          }))
          .filter((l) => l.location)
      : [],
    isActive: body.isActive ?? true,
  };

  try {
    const client = await Client.findByIdAndUpdate(params.id, { $set: updateData }, { new: true, runValidators: true });

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    return NextResponse.json(client);
  } catch (err) {
    console.error("Client update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const client = await Client.findByIdAndDelete(params.id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  return NextResponse.json({ message: "Client deleted" });
}

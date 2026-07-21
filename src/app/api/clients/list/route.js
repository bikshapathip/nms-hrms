import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const clients = await Client.find({ isActive: true })
    .select("clientName locations")
    .sort({ clientName: 1 })
    .lean();

  return NextResponse.json(clients);
}

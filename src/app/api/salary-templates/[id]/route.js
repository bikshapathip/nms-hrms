import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SalaryTemplate from "@/models/SalaryTemplate";
import "@/models/Client";
import { SLAB_FIELDS } from "@/lib/slabFields";

const NUMBER_FIELDS = [
  "basicSalary", "hra", "da", "statutoryBonus", "otherAllowance",
  "otAmount", "professionalTax", "tdsPercent", "lwf",
  "pfPercent", "employerPfPercent", "esiPercent", "employerEsiPercent",
];

function toNumberFields(body) {
  const out = {};
  for (const key of NUMBER_FIELDS) out[key] = Number(body[key]) || 0;
  return out;
}

function sanitizeSlabs(slabs) {
  if (!Array.isArray(slabs)) return [];
  return slabs
    .map((s) => ({
      minDays: Number(s.minDays) || 0,
      maxDays: Number(s.maxDays) || 0,
      type: s.type === "Percentage" ? "Percentage" : "Flat",
      value: Number(s.value) || 0,
    }))
    .filter((s) => s.minDays !== 0 || s.maxDays !== 0 || s.value !== 0);
}

function toSlabFields(body) {
  const out = {};
  for (const [key] of SLAB_FIELDS) out[`${key}Slabs`] = sanitizeSlabs(body[`${key}Slabs`]);
  return out;
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const template = await SalaryTemplate.findById(params.id).populate("client", "clientName locations").lean();
  if (!template) return NextResponse.json({ error: "Salary template not found" }, { status: 404 });

  return NextResponse.json(template);
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  const errors = {};
  if (!body.name?.trim()) errors.name = "Template name is required";
  if (!body.client) errors.client = "Client is required";
  if (!body.role?.trim()) errors.role = "Role is required";
  if (body.basicSalary === undefined || body.basicSalary === null || body.basicSalary === "") errors.basicSalary = "Basic salary is required";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  const updateData = {
    name: body.name.trim(),
    client: body.client,
    role: body.role.trim(),
    state: body.state || "",
    city: body.city || "",
    location: body.location || "",
    gender: ["Male", "Female", "Any"].includes(body.gender) ? body.gender : "Any",
    ...toNumberFields(body),
    ...toSlabFields(body),
    pfEnabled: !!body.pfEnabled,
    employerPfEnabled: !!body.employerPfEnabled,
    esiEnabled: !!body.esiEnabled,
    employerEsiEnabled: !!body.employerEsiEnabled,
    isActive: body.isActive ?? true,
  };

  try {
    const template = await SalaryTemplate.findByIdAndUpdate(params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!template) return NextResponse.json({ error: "Salary template not found" }, { status: 404 });

    return NextResponse.json(template);
  } catch (err) {
    console.error("Salary template update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update salary template" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const template = await SalaryTemplate.findByIdAndDelete(params.id);
  if (!template) return NextResponse.json({ error: "Salary template not found" }, { status: 404 });

  return NextResponse.json({ message: "Salary template deleted" });
}

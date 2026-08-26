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

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const client = searchParams.get("client") || "";
  const state = searchParams.get("state") || "";
  const city = searchParams.get("city") || "";
  const location = searchParams.get("location") || "";
  const gender = searchParams.get("gender") || "";
  const sortField = searchParams.get("sortField") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const allowedSortFields = ["name", "role", "state", "city", "location", "basicSalary", "isActive", "createdAt"];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
  const sortQuery = { [safeSortField]: sortOrder };

  const filterConditions = [];
  if (search) {
    filterConditions.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ],
    });
  }
  if (client) filterConditions.push({ client });
  if (state) filterConditions.push({ state });
  if (city) filterConditions.push({ city });
  if (location) filterConditions.push({ location });
  if (gender) filterConditions.push({ gender });
  const filter = filterConditions.length > 0 ? { $and: filterConditions } : {};

  const total = await SalaryTemplate.countDocuments(filter);

  if (limit === 0) {
    const templates = await SalaryTemplate.find(filter).populate("client", "clientName").sort(sortQuery).lean();
    return NextResponse.json({ templates, pagination: { page: 1, limit: 0, total, totalPages: 1 } });
  }

  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const templates = await SalaryTemplate.find(filter)
    .populate("client", "clientName")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  return NextResponse.json({ templates, pagination: { page, limit, total, totalPages } });
}

export async function POST(request) {
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

  try {
    const template = await SalaryTemplate.create({
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
    });

    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("Salary template create error:", err);
    return NextResponse.json({ error: err.message || "Failed to create salary template" }, { status: 500 });
  }
}

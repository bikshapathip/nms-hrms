import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

// Add virtual 'name' to lean results
function addName(emp) {
  if (emp && !emp.name) emp.name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  return emp;
}

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
  const all = searchParams.get("all"); // if "true", return all (for attendance/payslips)

  // Allowed sort fields to prevent injection
  const allowedSortFields = ["name", "employeeId", "designation", "department", "basicSalary", "isActive", "createdAt", "dateOfJoining"];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
  const sortQuery = { [safeSortField]: sortOrder };

  // If all=true, return all employees without pagination
  if (all === "true") {
    const employees = await Employee.find().populate("client", "clientName locations").sort(sortQuery).lean();
    return NextResponse.json(employees.map(addName));
  }

  // Build search filter
  const filter = search
    ? {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { contactNumber: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const total = await Employee.countDocuments(filter);

  // If limit is 0, return all (for "All" option)
  if (limit === 0) {
    const employees = await Employee.find(filter).populate("client", "clientName locations").sort(sortQuery).lean();
    return NextResponse.json({
      employees: employees.map(addName),
      pagination: { page: 1, limit: 0, total, totalPages: 1 },
    });
  }

  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const employees = await Employee.find(filter)
    .populate("client", "clientName locations")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  return NextResponse.json({
    employees: employees.map(addName),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  const existing = await Employee.findOne({ employeeId: body.employeeId });
  if (existing) {
    return NextResponse.json({ error: "Employee ID already exists" }, { status: 400 });
  }

  const employee = await Employee.create(body);
  return NextResponse.json(employee, { status: 201 });
}

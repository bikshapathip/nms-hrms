import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import "@/models/Client";

function fmtDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const client = searchParams.get("client") || "";
  const state = searchParams.get("state") || "";
  const city = searchParams.get("city") || "";
  const location = searchParams.get("location") || "";
  const sortField = searchParams.get("sortField") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const allowedSortFields = ["name", "employeeId", "designation", "basicSalary", "isActive", "createdAt", "dateOfJoining"];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
  const sortQuery = { [safeSortField]: sortOrder };

  const filterConditions = [];
  if (search) {
    filterConditions.push({
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { contactNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });
  }
  if (client) filterConditions.push({ client });
  if (state) filterConditions.push({ state });
  if (city) filterConditions.push({ city });
  if (location) filterConditions.push({ clientLocation: location });
  const filter = filterConditions.length > 0 ? { $and: filterConditions } : {};

  const employees = await Employee.find(filter).populate("client", "clientName").sort(sortQuery).lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Employees");

  sheet.columns = [
    { header: "Employee ID", key: "employeeId", width: 14 },
    { header: "Name", key: "name", width: 22 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Date of Birth", key: "dob", width: 14 },
    { header: "Contact Number", key: "contactNumber", width: 16 },
    { header: "Email", key: "email", width: 24 },
    { header: "Designation", key: "designation", width: 18 },
    { header: "Client", key: "clientName", width: 22 },
    { header: "Client Location", key: "clientLocation", width: 16 },
    { header: "City", key: "city", width: 14 },
    { header: "State", key: "state", width: 14 },
    { header: "Address", key: "address", width: 30 },
    { header: "Date of Joining", key: "doj", width: 14 },
    { header: "Marital Status", key: "maritalStatus", width: 14 },
    { header: "PAN Number", key: "panNumber", width: 14 },
    { header: "Aadhar Number", key: "aadharNumber", width: 16 },
    { header: "UAN Number", key: "uanNumber", width: 16 },
    { header: "Bank Name", key: "bankName", width: 18 },
    { header: "Bank Account", key: "bankAccount", width: 18 },
    { header: "IFSC Code", key: "ifscCode", width: 14 },
    { header: "Basic Salary", key: "basicSalary", width: 14 },
    { header: "HRA", key: "hra", width: 12 },
    { header: "DA", key: "da", width: 12 },
    { header: "Other Allowance", key: "otherAllowance", width: 16 },
    { header: "Gross Salary", key: "grossSalary", width: 14 },
    { header: "Working Status", key: "workingStatus", width: 14 },
    { header: "Active", key: "isActive", width: 10 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const emp of employees) {
    const b = emp.basicSalary || 0, h = emp.hra || 0, d = emp.da || 0, oa = emp.otherAllowance || 0;
    sheet.addRow({
      employeeId: emp.employeeId || "",
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
      gender: emp.gender || "",
      dob: fmtDate(emp.dateOfBirth),
      contactNumber: emp.contactNumber || "",
      email: emp.email || "",
      designation: emp.designation || "",
      clientName: emp.client?.clientName || "",
      clientLocation: emp.clientLocation || "",
      city: emp.city || "",
      state: emp.state || "",
      address: emp.address || "",
      doj: fmtDate(emp.dateOfJoining),
      maritalStatus: emp.maritalStatus || "",
      panNumber: emp.panNumber || "",
      aadharNumber: emp.aadharNumber || "",
      uanNumber: emp.uanNumber || "",
      bankName: emp.bankName || "",
      bankAccount: emp.bankAccount || "",
      ifscCode: emp.ifscCode || "",
      basicSalary: b,
      hra: h,
      da: d,
      otherAllowance: oa,
      grossSalary: b + h + d + oa,
      workingStatus: emp.workingStatus || "",
      isActive: emp.isActive ? "Active" : "Inactive",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Employees_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

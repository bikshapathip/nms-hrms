import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Salary from "@/models/Salary";
import "@/models/Employee";
import { PayslipDocument } from "@/lib/pdf/PayslipDocument";

export const runtime = "nodejs";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const payslip = await Salary.findById(params.id)
    .populate("employee", "employeeId firstName lastName designation department bankAccount panNumber uanNumber dateOfJoining")
    .lean();

  if (!payslip) return NextResponse.json({ error: "Payslip not found" }, { status: 404 });

  try {
    const pdfBuffer = await renderToBuffer(<PayslipDocument payslip={payslip} />);

    const emp = payslip.employee || {};
    const empName = `${emp.firstName || ""}_${emp.lastName || ""}`.replace(/\s+/g, "_") || "Employee";
    const fileName = `Payslip_${empName}_${MONTHS[payslip.month - 1]}_${payslip.year}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

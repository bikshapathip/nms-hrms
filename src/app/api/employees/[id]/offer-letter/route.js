import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Client from "@/models/Client";
import { OfferLetterDocument } from "@/lib/pdf/OfferLetterDocument";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const employee = await Employee.findById(params.id).lean();
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  let client = null;
  if (employee.client) client = await Client.findById(employee.client).lean();

  try {
    const pdfBuffer = await renderToBuffer(<OfferLetterDocument employee={employee} client={client} />);

    const empName = `${employee.firstName || ""}_${employee.lastName || ""}`.replace(/\s+/g, "_");
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Offer_Letter_${empName}_${employee.employeeId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

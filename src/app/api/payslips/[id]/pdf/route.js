import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Salary from "@/models/Salary";
import "@/models/Employee";
import puppeteer from "puppeteer";
import { renderBrandedDocument, getPdfPageOptions } from "@/lib/pdfLayout";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function numberToWords(num) {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }
  return convert(Math.abs(Math.round(num))) + " Rupees Only";
}

function fmt(n) { return (n || 0).toLocaleString("en-IN"); }
function fmtDate(date) {
  if (!date) return "___________";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const EXTRA_STYLES = `
.ps-title { text-align:center;font-weight:bold;font-size:14pt;text-decoration:underline;margin:10px 0 4px; }
.ps-period { text-align:center;font-size:11pt;margin-bottom:16px; }
.ps-info { width:100%;border-collapse:collapse;margin-bottom:14px;font-size:10pt; }
.ps-info td { padding:3px 8px;border:1px solid #999; }
.ps-info td.lbl { background:#f0f0f0;font-weight:bold;width:22%; }
.ps-net { width:82%;margin:14px auto;border:2px solid #333;border-radius:4px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;background:#f6f9f6; }
.ps-net .lbl { font-weight:bold;font-size:11pt; }
.ps-net .words { font-size:9pt;color:#444;margin-top:2px; }
.ps-net .amt { font-size:16pt;font-weight:bold; }
.ps-note { text-align:center;font-size:9pt;color:#555;margin-top:16px; }
`;

function generateBodyHtml(payslip) {
  const emp = payslip.employee || {};
  const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "___________";
  const leaveDays = payslip.totalWorkingDays - payslip.daysWorked;

  const earnings = [
    { label: "Basic Salary", value: payslip.earnedBasic },
    { label: "HRA", value: payslip.earnedHra },
    { label: "DA / Dearness Allowance", value: payslip.earnedDa },
    { label: "Special Allowance", value: payslip.earnedSpecialAllowance },
    { label: "Other Allowance", value: payslip.earnedOtherAllowance },
  ].filter((e) => e.value > 0);

  const deductions = [
    { label: "Provident Fund (12%)", value: payslip.pfDeduction },
    { label: "ESI (0.75%)", value: payslip.esiDeduction },
    { label: "Professional Tax", value: payslip.professionalTax },
    { label: "TDS", value: payslip.tdsDeduction },
  ].filter((d) => d.value > 0);

  return `<div class="ps-title">PAYSLIP</div>
<div class="ps-period">${MONTHS[payslip.month - 1]} ${payslip.year}</div>

<table class="ps-info">
<tr><td class="lbl">Employee Name</td><td>${empName}</td><td class="lbl">Employee ID</td><td>${emp.employeeId || "___________"}</td></tr>
<tr><td class="lbl">Designation</td><td>${emp.designation || "___________"}</td><td class="lbl">Department</td><td>${emp.department || "___________"}</td></tr>
<tr><td class="lbl">Date of Joining</td><td>${fmtDate(emp.dateOfJoining)}</td><td class="lbl">Bank Account</td><td>${emp.bankAccount || "___________"}</td></tr>
<tr><td class="lbl">PAN Number</td><td>${emp.panNumber || "___________"}</td><td class="lbl">UAN Number</td><td>${emp.uanNumber || "___________"}</td></tr>
<tr><td class="lbl">Working Days</td><td>${payslip.totalWorkingDays}</td><td class="lbl">Days Worked</td><td>${payslip.daysWorked}</td></tr>
<tr><td class="lbl">Leave Days</td><td colspan="3">${leaveDays}</td></tr>
</table>

<table class="st">
<tr><th colspan="2" class="sh">Earnings</th></tr>
${earnings.map(e => `<tr><td>${e.label}</td><td>${fmt(e.value)}</td></tr>`).join("")}
<tr class="hg"><td><b>Gross Earnings (A)</b></td><td><b>${fmt(payslip.earnedGross)}</b></td></tr>
</table>

<table class="st">
<tr><th colspan="2" class="sh">Deductions</th></tr>
${deductions.length ? deductions.map(d => `<tr><td>${d.label}</td><td>${fmt(d.value)}</td></tr>`).join("") : `<tr><td colspan="2" style="text-align:center;color:#888;">No deductions</td></tr>`}
<tr class="hy"><td><b>Total Deductions (B)</b></td><td><b>${fmt(payslip.totalDeductions)}</b></td></tr>
</table>

<div class="ps-net">
  <div>
    <div class="lbl">Net Salary Payable (A - B)</div>
    <div class="words">${numberToWords(payslip.netSalary)}</div>
  </div>
  <div class="amt">₹${fmt(payslip.netSalary)}</div>
</div>

<p class="ps-note">This is a system-generated payslip and does not require a signature.</p>`;
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const payslip = await Salary.findById(params.id)
    .populate("employee", "employeeId firstName lastName designation department bankAccount panNumber uanNumber dateOfJoining")
    .lean();

  if (!payslip) return NextResponse.json({ error: "Payslip not found" }, { status: 404 });

  const html = renderBrandedDocument({ bodyHtml: generateBodyHtml(payslip), extraStyles: EXTRA_STYLES });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      ...getPdfPageOptions(),
    });

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
  } finally {
    if (browser) await browser.close();
  }
}

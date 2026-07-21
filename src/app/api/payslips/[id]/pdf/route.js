import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Salary from "@/models/Salary";
import puppeteer from "puppeteer";

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

function formatCurrency(num) {
  return "₹" + num.toLocaleString("en-IN");
}

function generatePayslipHTML(payslip) {
  const emp = payslip.employee;
  const leaveDays = payslip.totalWorkingDays - payslip.daysWorked;

  const earnings = [
    { label: "Basic Salary", value: payslip.earnedBasic },
    { label: "HRA", value: payslip.earnedHra },
    { label: "DA (Dearness Allowance)", value: payslip.earnedDa },
    { label: "Special Allowance", value: payslip.earnedSpecialAllowance },
    { label: "Other Allowance", value: payslip.earnedOtherAllowance },
  ].filter((e) => e.value > 0);

  const deductions = [
    { label: "Provident Fund (12%)", value: payslip.pfDeduction },
    { label: "ESI (0.75%)", value: payslip.esiDeduction },
    { label: "Professional Tax", value: payslip.professionalTax },
    { label: "TDS", value: payslip.tdsDeduction },
  ].filter((d) => d.value > 0);

  const earningsRows = earnings.map(e => `<tr><td>${e.label}</td><td class="amount">${formatCurrency(e.value)}</td></tr>`).join("");
  const deductionsRows = deductions.length > 0
    ? deductions.map(d => `<tr><td>${d.label}</td><td class="amount">${formatCurrency(d.value)}</td></tr>`).join("")
    : `<tr><td colspan="2" class="no-data">No deductions</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a1d3b; padding: 40px; }
    .header { background: linear-gradient(135deg, #1a1d3b, #2d3161); color: white; padding: 30px; border-radius: 12px 12px 0 0; margin: -40px -40px 30px -40px; padding: 40px; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { color: #9ca0c7; font-size: 11px; }
    .header .month { float: right; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: bold; }
    .employee-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e8eaf0; }
    .employee-info .row { display: flex; gap: 8px; }
    .employee-info .label { color: #6b7194; font-size: 11px; min-width: 100px; font-weight: 600; }
    .employee-info .value { color: #1a1d3b; font-weight: 500; }
    .attendance { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 25px; }
    .attendance .box { background: #f8f9fc; border-radius: 10px; padding: 15px; text-align: center; }
    .attendance .box.green { background: #ecfdf5; }
    .attendance .box.red { background: #fef2f2; }
    .attendance .box .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7194; }
    .attendance .box .value { font-size: 22px; font-weight: 800; margin-top: 5px; color: #1a1d3b; }
    .attendance .box.green .value { color: #10b981; }
    .attendance .box.red .value { color: #ef4444; }
    .salary-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
    .salary-section h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e8eaf0; display: flex; align-items: center; gap: 8px; }
    .salary-section h3 .dot { width: 4px; height: 16px; border-radius: 2px; }
    .salary-section h3 .dot.green { background: #10b981; }
    .salary-section h3 .dot.red { background: #ef4444; }
    .salary-section table { width: 100%; border-collapse: collapse; }
    .salary-section table td { padding: 8px 0; font-size: 12px; }
    .salary-section table td:first-child { color: #6b7194; }
    .salary-section table td.amount { text-align: right; font-weight: 600; color: #1a1d3b; }
    .salary-section table .total-row td { border-top: 2px solid #e8eaf0; padding-top: 12px; font-weight: 700; font-size: 13px; }
    .salary-section table .total-row td:first-child { color: #1a1d3b; }
    .salary-section table .total-row td.amount.green { color: #10b981; }
    .salary-section table .total-row td.amount.red { color: #ef4444; }
    .no-data { color: #9ca3af; font-style: italic; }
    .net-salary { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 12px; padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; }
    .net-salary .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #059669; }
    .net-salary .words { font-size: 10px; color: #047857; margin-top: 6px; }
    .net-salary .amount { font-size: 28px; font-weight: 800; color: #059669; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e8eaf0; text-align: center; font-size: 10px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <span class="month">${MONTHS[payslip.month - 1]} ${payslip.year}</span>
    <h1>PAYSLIP</h1>
    <p>Salary Statement</p>
  </div>

  <div class="employee-info">
    <div class="row"><span class="label">Employee ID:</span><span class="value">${emp?.employeeId || "—"}</span></div>
    <div class="row"><span class="label">Date of Joining:</span><span class="value">${emp?.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString("en-IN") : "—"}</span></div>
    <div class="row"><span class="label">Employee Name:</span><span class="value">${emp?.name || "—"}</span></div>
    <div class="row"><span class="label">PAN Number:</span><span class="value">${emp?.panNumber || "—"}</span></div>
    <div class="row"><span class="label">Designation:</span><span class="value">${emp?.designation || "—"}</span></div>
    <div class="row"><span class="label">UAN Number:</span><span class="value">${emp?.uanNumber || "—"}</span></div>
    <div class="row"><span class="label">Department:</span><span class="value">${emp?.department || "—"}</span></div>
    <div class="row"><span class="label">Bank Account:</span><span class="value">${emp?.bankAccount || "—"}</span></div>
  </div>

  <div class="attendance">
    <div class="box"><div class="label">Working Days</div><div class="value">${payslip.totalWorkingDays}</div></div>
    <div class="box green"><div class="label">Days Worked</div><div class="value">${payslip.daysWorked}</div></div>
    <div class="box ${leaveDays > 0 ? "red" : ""}"><div class="label">Leave Days</div><div class="value">${leaveDays}</div></div>
  </div>

  <div class="salary-section">
    <div>
      <h3><span class="dot green"></span>Earnings</h3>
      <table>
        ${earningsRows}
        <tr class="total-row"><td>Gross Earnings</td><td class="amount green">${formatCurrency(payslip.earnedGross)}</td></tr>
      </table>
    </div>
    <div>
      <h3><span class="dot red"></span>Deductions</h3>
      <table>
        ${deductionsRows}
        <tr class="total-row"><td>Total Deductions</td><td class="amount red">${formatCurrency(payslip.totalDeductions)}</td></tr>
      </table>
    </div>
  </div>

  <div class="net-salary">
    <div>
      <div class="label">Net Salary Payable</div>
      <div class="words">${numberToWords(payslip.netSalary)}</div>
    </div>
    <div class="amount">${formatCurrency(payslip.netSalary)}</div>
  </div>

  <div class="footer">This is a system-generated payslip and does not require a signature.</div>
</body>
</html>`;
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const payslip = await Salary.findById(params.id)
    .populate("employee", "employeeId name designation department bankAccount panNumber uanNumber dateOfJoining")
    .lean();

  if (!payslip) return NextResponse.json({ error: "Payslip not found" }, { status: 404 });

  const html = generatePayslipHTML(payslip);

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
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    const empName = payslip.employee?.name?.replace(/\s+/g, "_") || "Employee";
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

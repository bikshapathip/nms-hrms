import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Client from "@/models/Client";
import puppeteer from "puppeteer";
import { renderBrandedDocument, getPdfPageOptions } from "@/lib/pdfLayout";

function fmtDate(date) {
  if (!date) return "___________";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmt(n) { return (n || 0).toLocaleString("en-IN"); }

function generateBodyHtml(emp, client) {
  const name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  const address = [emp.address, emp.city].filter(Boolean).join(", ") || "___________";
  const doj = fmtDate(emp.dateOfJoining);
  const CL = (client?.clientName || "___________").toUpperCase();
  const clLoc = emp.clientLocation || "";
  const desig = emp.designation || "___________";
  const empCode = emp.employeeId || "___________";

  const b = emp.basicSalary||0, h = emp.hra||0, d = emp.da||0, sa = emp.specialAllowance||0, oa = emp.otherAllowance||0;
  const gross = b+h+d+sa+oa;
  const epfE = emp.pfEnabled ? Math.round(b*0.12) : 0;
  const esicE = emp.esiEnabled && gross<=21000 ? Math.round(gross*0.0075) : 0;
  const pt = emp.professionalTax||0;
  const totDed = epfE+esicE+pt;
  const net = gross-totDed;
  const epfR = emp.pfEnabled ? Math.round(b*0.12) : 0;
  const esicR = emp.esiEnabled && gross<=21000 ? Math.round(gross*0.0325) : 0;
  const ctc = gross+epfR+esicR;

  const co = "Nilkanta";
  const U = t => `<span style="text-decoration:underline">${t}</span>`;

  return `<div style="text-align:center;font-weight:bold;font-size:12pt;text-decoration:underline;margin:10px 0 12px;">CONTRACT EMPLOYMENT LETTER</div>
<div style="text-align:right;font-weight:bold;margin-bottom:8px;">Date: ${doj}</div>
<p><b>Employee Code:</b> ${empCode}</p><br/>
<p><b>Name:</b> ${name}</p>
<p><b>Address:</b> ${address}</p><br/>
<p style="text-decoration:underline;font-weight:bold;">Dear : ${name}</p><br/>
<p style="text-align:justify;">We are pleased to appoint you in our organization as <b>${desig}</b> subject to the following terms and conditions:</p><br/>

<ol>
<li>Your contract will commence from <b>${doj}</b> and expire for three months during which you will render services to our client <b>${CL}</b> at their premises subject to the terms and conditions of the contract employment letter executed by you on <b>${doj}</b>&nbsp;&nbsp;&nbsp;&nbsp;and in accordance to the instructions received by you from us or any other authorized person and will be bound by our rules and regulations.</li>
<li>You hereby agree to be liable for the following terms and conditions:
<ol class="rom">
<li>Fully perform the services, in a professional manner, at our client location at ${CL}'s location until the completion of the term of the work assignment.</li>
<li>During the term of the work assignment, render services exclusively to our client ${CL} and such performance shall not be inconsistent with any obligation you may have to other third parties.</li>
<li>Not engage in any conduct which is detrimental to the interest of the ${CL} or ${U(co)} Management Services Private Limited.</li>
<li>Not receive any payments of any nature directly or indirectly from the ${CL} unless agreed to by ${U(co)} Management Services Private Limited.</li>
<li>Neither directly nor indirectly offers you employment with our client ${CL} or its affiliates during the period of the work assignment without prior permission of the vendor ${U(co)} Management Services Private Limited.</li>
<li>Extend all cooperation to our client ${CL} employees, consultants, representatives, etc. and do all such things as may be necessary and comply with all terms of the Appointment letter so as to<br/>Effectively undertake the work.</li>
<li>Report and be present at the designated location during the working hours mentioned herein and abide by the rules and regulations as required by our client the ${co} Management Services Private Limited.</li>
<li>Comply with the safety, health and other rules and regulations of ${U(co)} Management Services Private Limited and our client ${CL} that you have been made awareof.</li>
<li>During the course of your contract, you can be transferred to a location within the territory of India as and when required by ${U(co)} Management Services Private Limited for executing the services.</li>
</ol></li>
<li>Should you be selected to perform the Work Assignment, the nature of your relationship with the ${U(co)} Management Services Private Limited will be that of a Contract of Service for a fixed period. By executing this letter of engagement neither do we offer you employment with ${U(co)} Management Services Private Limited nor do you become an employee of ${U(co)} Management Services Private Limited. Upon expiry or termination of the Work Assignment, your employment with ${U(co)} Management Services Private Limited shall stand terminated forthwith.</li>
<li>Except for expiry of a Work Assignment due to completion/expiry of the same or in respect of a Work Assignment of one week or a lesser period of time, either party may terminate this Work Assignment Letter by issuing 7 days' notice in writing or payment thereof.</li>
<li>The Employee is responsible for all company assets under their supervision. They are accountable for any asset loss or damage that occurs during their presence or under their process control, even if not directly involved. The Company may recover the cost of lost or damaged assets from the Employee's remuneration. The Employee will be notified of any recovery decision.</li>
<li>Termination of this letter of engagement shall not affect the obligations of the parties that have been incurred prior to such termination and ${U(co)} Management Services Private Limited shall promptly settle all your dues after making the applicable deductions.</li>
<li>You agree to defend, indemnify and hold ${U(co)} Management Services Private Limited or our client ${CL} harmless from any and all claims, damages, liability, attorney's fees and expenses on account of your failure to satisfy any of your obligations under this work assignment letter or for misconduct or for violation of any law or creation of any legal liability by you.</li>
<li>Any dispute between you and ${U(co)} Management Services Private Limited shall be referred to a sole arbitrator appointed by ${U(co)} Management Services Private Limited the arbitration shall be conducted in English language, in accordance with the Arbitration and Conciliation Act 1996, at Bangalore, Karnataka, India. This Engagement Letter shall be governed by the laws of India.</li>
<li>Details of your salary breakup will be as per the Annexure attached herein. You hereby authorize ${U(co)} Management Services Private Limited to make all salary payments required to be made to you by ${U(co)} Management Services Private Limited either by way of Cheque or by directly crediting the amounts to your bank account.</li>
<li>You shall be subject to background check and in the event the background check is negative, the company reserves the right to terminate your employment without any further notice.</li>
<li>The salary payout will be made at the latest by 9th of the following month.</li>
<li>You will be entitled to an employer's contribution of Provident fund to the extent of 12% of your basic salary and applicable ESI contribution. You will also be covered under Medical and Accident Insurance and will be entitled to all other statutory benefits whichever is applicable during the contract period. It is hereby clarified that if you fail to submit the ESIC, PF, Gratuity nomination forms together with any other document as required under the applicable labour legislations, ${U(co)} Management Services Private Limited shall not incur any liability with regards to any Claims under the said applicable labour legislations.</li>
<li>In addition to the terms contained herein, your relationship with ${U(co)} Management Services Private Limited may be subject to such other additional terms and conditions as may be communicated to you from time to time in writing by ${U(co)} Management Services Private Limited and you hereby agree to have read and clearly understood the terms of employment provided in the Service Rules, which is attached herein.</li>
<li>During your employment with the ${U(co)} Management Services Private Limited, if we find any irregularity or insufficiency in the documents submitted by you, this Contract Employment Letter would stand cancelled/revoked.</li>
<li>The nature of your relationship with ${U(co)} Management Services Private Limited will be that of contract of service for three months from your date of joining, upon expiry or termination of the work Assignment, your employment with ${U(co)} Management Services Private Limited shall stand terminated forthwith.</li>
<li>You shall not, either during or after termination of your employment with our client ${CL} give out to any third part by word of mouth or otherwise, the Proprietary and/or Confidential information of the Company, that shall include but not limited to all information, software (whether in object or source code), statistics, data, data base, knowledge, trade secrets, inventions, products detail, knowhow, formula, processes, designs, drawings, charts, maps, concepts, ideas, systems, project plans, business plans, ${CL} details, security information, any other creations of whatsoever nature, kind or description, organizational matters pertaining to company or our client ${CL}. Further, you shall not at any time, whether during or after the period of employment, use any Proprietary or Confidential information or any part thereof, for your own benefit or for the benefit of any person, firm, company or other legal entity other that our client ${CL}. These ${U("Non-Disclosure")} obligations enumerated above shall be binding on you at all times, irrespective of whether you continue to be employed by the company or not.</li>
<li>This Contract Employment letter shall be coterminous with the agreement we have with our client ${CL}.</li>
</ol>

<div style="margin-top:20px;">
<p class="bold" style="text-decoration:underline;">ENDORSEMENT</p><br/>
<p>I hereby confirm acceptance of the above assignment, on the terms and conditions stipulated therein.</p><br/>
<div class="sr">
<div><p class="bold">For ${co} Management Services Pvt Ltd</p><br/><br/><br/><br/><p class="bold">Authorized Signatory</p><p>P. Bikshapathi</p><p>Head – Human Resources</p></div>
<div><p>Accepted and Agreed</p><br/><br/><br/><br/><p>Signature and date: ${doj}</p><p class="bold">Name: ${name}</p></div>
</div></div>

<div class="pb"></div>

<table class="st">
<tr><th colspan="2" class="sh">${client?.clientName || "___________"}${clLoc ? ' - '+clLoc : ''}</th></tr>
<tr><th>Salary Head</th><th>Amount (₹)</th></tr>
<tr><td>Basic</td><td>${fmt(b)}</td></tr>
<tr><td>HRA</td><td>${fmt(h)}</td></tr>
<tr><td>DA / Dearness Allowance</td><td>${fmt(d)}</td></tr>
<tr><td>Special Allowance</td><td>${fmt(sa)}</td></tr>
<tr><td>Other Allowance</td><td>${fmt(oa)}</td></tr>
<tr class="hg"><td><b>Gross Salary (A)</b></td><td><b>${fmt(gross)}</b></td></tr>
<tr><td>EPF Contribution [Employee] (12%)</td><td>${fmt(epfE)}</td></tr>
<tr><td>ESIC Contribution [Employee] (0.75%)</td><td>${fmt(esicE)}</td></tr>
<tr><td>Professional Tax</td><td>${fmt(pt)}</td></tr>
<tr class="hy"><td><b>Total Deduction (B)</b></td><td><b>${fmt(totDed)}</b></td></tr>
<tr class="hb"><td><b>Net Take Home Salary (A - B)</b></td><td><b>${fmt(net)}</b></td></tr>
<tr><td>EPF Contribution [Employer] (12%)</td><td>${fmt(epfR)}</td></tr>
<tr><td>ESIC Contribution [Employer] (3.25%)</td><td>${fmt(esicR)}</td></tr>
<tr class="hg"><td><b>CTC</b></td><td><b>${fmt(ctc)}</b></td></tr>
</table>

<br/><p style="text-align:center;font-size:9pt;color:#555;">*A minimum attendance of 26 days is required to be eligible for all the above-mentioned bonuses.</p>
<br/><br/><p>I hereby accept the above-mentioned terms and conditions.</p>
<br/><br/><br/>
<div style="text-align:right;width:55%;margin-left:auto;">
<p><b>Signature:</b></p><p><b>Name: ${name}</b></p><p><b>Date: ${doj}</b></p>
</div>`;
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const employee = await Employee.findById(params.id).lean();
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  let client = null;
  if (employee.client) client = await Client.findById(employee.client).lean();

  const html = renderBrandedDocument({ bodyHtml: generateBodyHtml(employee, client) });

  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      ...getPdfPageOptions(),
    });

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
  } finally {
    if (browser) await browser.close();
  }
}

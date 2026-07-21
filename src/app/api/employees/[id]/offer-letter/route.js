import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Client from "@/models/Client";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

let logoBase64 = "";
try {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
} catch (e) { console.warn("Logo not found"); }

function fmtDate(date) {
  if (!date) return "___________";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmt(n) { return (n || 0).toLocaleString("en-IN"); }

function getHeaderTemplate(logo) {
  return `<div style="width:100%;font-size:10px;margin:0;padding:0;">
  <div style="position:relative;height:42px;margin-left:48px;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:#2d2d2d;clip-path:polygon(25px 0,100% 0,100% 100%,72px 100%);"></div>
    <div style="position:absolute;left:-44px;top:-2px;width:78px;height:78px;z-index:10;">
      <img src="${logo}" style="width:78px;height:78px;object-fit:contain;" />
    </div>
    <div style="position:relative;z-index:5;display:flex;align-items:center;height:100%;padding:0 12px 0 68px;">
      <span style="flex:1;text-align:right;font-family:Arial,sans-serif;font-size:12px;font-weight:900;color:#e8a83e;letter-spacing:1px;white-space:nowrap;">NILKANTA MANAGEMENT SERIVICES PRIVATE LIMITED</span>
    </div>
  </div>
  <div style="position:relative;height:20px;margin-left:48px;">
    <div style="position:absolute;top:0;left:50%;right:0;bottom:0;background:#c8943e;clip-path:polygon(0 0,100% 0,100% 100%,22px 100%);"></div>
    <div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:flex-end;height:100%;padding-right:12px;">
      <span style="font-family:Arial,sans-serif;font-size:9px;font-weight:900;color:#1a1a1a;letter-spacing:0.5px;">CIN: U70200TS2025PTC198036</span>
    </div>
  </div>
  <div style="border-bottom:2px solid #2d2d2d;margin-top:8px;"></div>
</div>`;
}

const footerTemplate = `<div style="width:100%;font-size:10px;margin:0;padding:0;">
  <div style="border-top:2px solid #2d2d2d;margin:0 16px;"></div>
  <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:5px 18px 3px;font-family:Arial,sans-serif;font-size:7.5px;color:#333;">
    <div style="display:flex;align-items:flex-start;gap:4px;max-width:40%;line-height:1.3;">
      <svg width="12" height="15" viewBox="0 0 24 30" fill="#2d2d2d"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/></svg>
      <span>H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad,500061 TG.</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;text-align:right;">
      <div style="display:flex;align-items:center;gap:4px;">
        <svg width="14" height="11" viewBox="0 0 24 18" fill="none" stroke="#2d2d2d" stroke-width="2"><rect x="1" y="1" width="22" height="16" rx="2"/><polyline points="1,1 12,10 23,1"/></svg>
        <a href="mailto:nilkantamanpower@gmail.com" style="color:#2456a4;text-decoration:underline;">nilkantamanpower@gmail.com</a>
      </div>
      <div style="margin-top:1px;">GST NO. <b>36AAKCN4393E1Z8</b></div>
    </div>
  </div>
  <div style="height:20px;margin-top:2px;position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;bottom:0;width:30%;height:100%;background:#c8943e;clip-path:polygon(0 0,85% 0,100% 100%,0 100%);"></div>
    <div style="position:absolute;left:18%;bottom:0;width:82%;height:100%;background:#2d2d2d;clip-path:polygon(14% 0,100% 0,100% 100%,0 100%);"></div>
  </div>
</div>`;

function generateHTML(emp, client) {
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

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@page { margin: 0; size: A4; }
* { margin:0;padding:0;box-sizing:border-box; }
body { font-family:'Times New Roman',Times,serif;font-size:11pt;color:#000;line-height:1.55; }

/* Table layout for repeating header/footer */
.page-table { width:100%;border-collapse:collapse; }
.page-table thead td { padding:0;vertical-align:top; }
.page-table tfoot td { padding:0;vertical-align:bottom;height:55px; }
.page-table tbody td { padding:0 28px;vertical-align:top; }

/* Force tfoot to bottom of page */
.page-table tfoot { display:table-footer-group; }
@media print {
  .page-table tfoot td { position:fixed;bottom:0;left:0;right:0;height:55px; }
  .ftr-placeholder { height:60px; }
}
.page-table { width:100%;border-collapse:collapse; }
.page-table thead td { padding:0; }
.page-table tfoot td { padding:0; }
.page-table tbody td { padding:0 28px; }

/* Header */
.hdr { position:relative;width:100%; }
.hdr-top { position:relative;height:50px;margin-left:55px; }
.hdr-top-bg { position:absolute;top:0;left:0;right:0;bottom:0;background:#2d2d2d;clip-path:polygon(30px 0,100% 0,100% 100%,85px 100%); }
.hdr-top-content { position:relative;z-index:5;display:flex;align-items:center;height:100%;padding:0 15px 0 80px; }
.hdr-logo { position:absolute;left:3px;top:-2px;width:95px;height:95px;z-index:10; }
.hdr-logo img { width:88px;height:88px;object-fit:contain; }
.hdr-name { flex:1;text-align:right;font-family:Arial,sans-serif;font-size:13.5pt;font-weight:900;color:#e8a83e;letter-spacing:1px;white-space:nowrap; }
.hdr-cin { position:relative;height:26px;margin-left:55px; }
.hdr-cin-bg { position:absolute;top:0;left:50%;right:0;bottom:0;background:#c8943e;clip-path:polygon(0 0,100% 0,100% 100%,30px 100%); }
.hdr-cin-text { position:relative;z-index:5;display:flex;align-items:center;justify-content:flex-end;height:100%;padding-right:10px;font-family:Arial,sans-serif;font-size:12pt;font-weight:900;color:#1a1a1a;letter-spacing:0.5px; }
.hdr-line { border-bottom:2.5px solid #2d2d2d;margin-top:12px; }
.hdr-spacer { height:10px; }

/* Footer */
.ftr { width:100%; }
.ftr-spacer { height:8px; }
.ftr-line { border-top:2.5px solid #2d2d2d;margin:0 18px; }
.ftr-content { display:flex;align-items:flex-start;justify-content:space-between;padding:5px 20px 4px;font-size:8.5pt;color:#333;font-family:Arial,sans-serif; }
.ftr-addr { display:flex;align-items:flex-start;gap:5px;max-width:40%;line-height:1.3; }
.ftr-right { display:flex;flex-direction:column;align-items:flex-end;text-align:right; }
.ftr-right a { color:#2456a4;text-decoration:underline; }

/* Content */
.bold { font-weight:bold; }
ol { margin-left:16px; }
ol>li { margin-bottom:7px;text-align:justify; }
ol.rom { list-style-type:lower-roman;margin-left:24px; }
ol.rom li { margin-bottom:5px;text-align:justify; }
.st { width:82%;margin:10px auto;border-collapse:collapse;font-size:10pt; }
.st th,.st td { border:1px solid #333;padding:3px 8px; }
.st th { background:#e0e0e0;text-align:center;font-weight:bold; }
.st .sh { background:#d0d0d0;font-weight:bold;text-align:center; }
.st .hg { background:#c6efce; } .st .hy { background:#fff2cc; } .st .hb { background:#d6e4f0; }
.st td:last-child { text-align:right; }
.sr { display:flex;justify-content:space-between;margin-top:30px; }
.sr div { width:45%; }
.pb { page-break-before:always; }
.wm { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:380px;height:380px;opacity:0.22;pointer-events:none;z-index:0; }
.wm img { width:100%;height:100%;object-fit:contain; }
</style></head><body>

<div class="wm"><img src="${logoBase64}" /></div>

<table class="page-table">
<thead><tr><td>
  <div class="hdr">
    <div class="hdr-logo"><img src="${logoBase64}" /></div>
    <div class="hdr-top"><div class="hdr-top-bg"></div><div class="hdr-top-content"><div class="hdr-name">NILKANTA MANAGEMENT SERIVICES PRIVATE LIMITED</div></div></div>
    <div class="hdr-cin"><div class="hdr-cin-bg"></div><div class="hdr-cin-text">CIN: U70200TS2025PTC198036</div></div>
    <div class="hdr-line"></div>
    <div class="hdr-spacer"></div>
  </div>
</td></tr></thead>
<tfoot><tr><td>
  <div class="ftr">
    <div class="ftr-spacer"></div>
    <div class="ftr-line"></div>
    <div class="ftr-content">
      <div class="ftr-addr">
        <svg width="12" height="15" viewBox="0 0 24 30" fill="#2d2d2d"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/></svg>
        <span>H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad,500061 TG.</span>
      </div>
      <div class="ftr-right">
        <div style="display:flex;align-items:center;gap:4px;"><svg width="14" height="11" viewBox="0 0 24 18" fill="none" stroke="#2d2d2d" stroke-width="2"><rect x="1" y="1" width="22" height="16" rx="2"/><polyline points="1,1 12,10 23,1"/></svg><a href="#">nilkantamanpower@gmail.com</a></div>
        <div style="margin-top:1px;">GST NO. <b>36AAKCN4393E1Z8</b></div>
      </div>
    </div>
  </div>
</td></tr></tfoot>
<tbody><tr><td>

<div style="text-align:center;font-weight:bold;font-size:12pt;text-decoration:underline;margin:10px 0 12px;">CONTRACT EMPLOYMENT LETTER</div>
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
</div>

<div class="ftr-placeholder"></div>
</div><!-- end content -->
</td></tr></tbody>
</table>
</body></html>`;
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const employee = await Employee.findById(params.id).lean();
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  let client = null;
  if (employee.client) client = await Client.findById(employee.client).lean();

  const html = generateHTML(employee, client);

  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
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

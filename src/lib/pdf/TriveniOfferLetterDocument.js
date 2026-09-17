import { Document, View, Text, Image } from "@react-pdf/renderer";
import { BrandedPage } from "./BrandedPage";
import { B, U, NumberedItem, RomanItem } from "./text";
import { SalaryTable } from "./SalaryTable";
import { getStampBase64 } from "@/lib/pdfLayout";

function fmtDate(date) {
  if (!date) return "___________";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmt(n) {
  return (n || 0).toLocaleString("en-IN");
}
function maxFlatSlab(slabs) {
  if (!Array.isArray(slabs) || !slabs.length) return 0;
  return slabs.reduce((max, s) => (s.type === "Flat" && Number(s.value) > max ? Number(s.value) : max), 0);
}

const CO = "Nilkanta";
const PF_WAGE_CEILING = 15000;

export function TriveniOfferLetterDocument({ employee: emp, client }) {
  const name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  const address = [emp.address, emp.city].filter(Boolean).join(", ") || "___________";
  const doj = fmtDate(emp.dateOfJoining);
  const CL = (client?.clientName || "___________").toUpperCase();
  const clLoc = emp.clientLocation || "";
  const desig = emp.designation || "___________";
  const empCode = emp.employeeId || "___________";
  const stamp = getStampBase64();

  const basic = emp.basicSalary || 0;
  const da = emp.da || 0;
  const hra = emp.hra || 0;
  const specialAllowance = maxFlatSlab(emp.specialAllowanceSlabs);
  const performanceAllowance = maxFlatSlab(emp.performanceBonusSlabs);
  const leaveWithWages = maxFlatSlab(emp.leaveEncashmentSlabs);
  const gross = basic + da + specialAllowance + performanceAllowance + hra + leaveWithWages;

  const pfWage = Math.min(basic + da, PF_WAGE_CEILING);
  const epfE = emp.pfEnabled ? Math.round(pfWage * 0.12) : 0;
  const esicE = emp.esiEnabled && gross <= 21000 ? Math.round(gross * 0.0075) : 0;
  const pt = emp.professionalTax || 0;
  const tds = Math.round(gross * ((emp.tdsPercent || 0) / 100));
  const lwf = emp.lwf || 0;
  const totDed = epfE + esicE + pt + tds + lwf;
  const net = gross - totDed;
  const epfR = emp.pfEnabled ? Math.round(pfWage * 0.13) : 0;
  const esicR = emp.esiEnabled && gross <= 21000 ? Math.round(gross * 0.0325) : 0;
  const ctc = gross + epfR + esicR;

  const rowDefs = [
    { label: "Basic", n: basic },
    { label: "DA", n: da },
    { label: "Special Allowance", n: specialAllowance },
    { label: "Performance Allowance", n: performanceAllowance },
    { label: "HRA", n: hra },
    { label: "Leave with wages", n: leaveWithWages },
    { label: "Gross Salary (A)", n: gross, bold: true, variant: "green" },
    { label: "EPF Contribution [Employee] (12%)", n: epfE },
    { label: "ESIC Contribution [Employee] (0.75%)", n: esicE },
    { label: "Professional Tax", n: pt },
    { label: "TDS", n: tds },
    { label: "LWF", n: lwf },
    { label: "Total Deduction (B)", n: totDed, bold: true, variant: "yellow" },
    { label: "Net Take Home Salary (A - B)", n: net, bold: true, variant: "blue" },
    { label: "EPF Contribution [Employer] (13%)", n: epfR },
    { label: "ESIC Contribution [Employer] (3.25%)", n: esicR },
    { label: "Cost to Company (CTC)", n: ctc, bold: true, variant: "green" },
  ];
  const rows = rowDefs.map((r) => ({
    label: r.label,
    value: fmt(r.n),
    yearly: fmt(r.n * 12),
    bold: r.bold,
    variant: r.variant,
  }));

  return (
    <Document>
      <BrandedPage>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", fontSize: 12, textDecoration: "underline", marginBottom: 12 }}>
          CONTRACT EMPLOYMENT LETTER
        </Text>
        <Text style={{ textAlign: "right", fontFamily: "Times-Bold", marginBottom: 8 }}>Date: {doj}</Text>

        <Text style={{ marginBottom: 12 }}><B>Employee Code:</B> <B>{empCode}</B></Text>
        <Text style={{ marginBottom: 4 }}><B>Name:</B> {name}</Text>
        <Text style={{ marginBottom: 12 }}><B>Address:</B> {address}</Text>
        <Text style={{ fontFamily: "Times-Bold", marginBottom: 12 }}>Dear {name}</Text>
        <Text style={{ textAlign: "justify", marginBottom: 12 }}>
          We are pleased to appoint you in our organization as <B>{desig}</B> subject to the following terms and conditions:
        </Text>

        <NumberedItem index={1}>
          Your contract will commence from <B>{doj}</B> and expire for three months during which you will render
          services to our client <B>{CL}</B> at their premises subject to the terms and conditions of the contract
          employment letter executed by you on <B>{doj}</B> and in accordance to the instructions received by you
          from us or any other authorized person and will be bound by our rules and regulations.
        </NumberedItem>

        <NumberedItem index={2}>You hereby agree to be liable for the following terms and conditions:</NumberedItem>
        <View style={{ marginTop: -6 }}>
          <RomanItem index={1}>
            Fully perform the services, in a professional manner, at our client location at {CL}'s location until
            the completion of the term of the work assignment.
          </RomanItem>
          <RomanItem index={2}>
            During the term of the work assignment, render services exclusively to our client {CL} and such
            performance shall not be inconsistent with any obligation you may have to other third parties.
          </RomanItem>
          <RomanItem index={3}>
            Not engage in any conduct which is detrimental to the interest of the {CL} or {CO} Management
            Services Private Limited.
          </RomanItem>
          <RomanItem index={4}>
            Not receive any payments of any nature directly or indirectly from the {CL} unless agreed to by{" "}
            {CO} Management Services Private Limited.
          </RomanItem>
          <RomanItem index={5}>
            Neither directly nor indirectly offers you employment with our client {CL} or its affiliates during the
            period of the work assignment without prior permission of the vendor {CO} Management Services
            Private Limited.
          </RomanItem>
          <RomanItem index={6}>
            Extend all cooperation to our client {CL} employees, consultants, representatives, etc. and do all such
            things as may be necessary and comply with all terms of the Appointment letter so as to effectively
            undertake the work.
          </RomanItem>
          <RomanItem index={7}>
            Report and be present at the designated location during the working hours mentioned herein and abide
            by the rules and regulations as required by our client the {CL}.
          </RomanItem>
          <RomanItem index={8}>
            Comply with the safety, health and other rules and regulations of {CO} Management Services
            Private Limited and our client {CL} that you have been made aware of.
          </RomanItem>
          <RomanItem index={9}>
            During the course of your contract, you can be transferred to a location within the territory of India
            as and when required by {CO} Management Services Private Limited for executing the services
            provided herein.
          </RomanItem>
        </View>

        <NumberedItem index={3}>
          Should you be selected to perform the Work Assignment, the nature of your relationship with the{" "}
          {CO} Management Services Private Limited will be that of a Contract of Service for a fixed period.
          By executing this letter of engagement neither do we offer you employment with {CO} Management Services
          Private Limited nor do you become an employee of {CO} Management Services Private Limited. Upon expiry or
          termination of the Work Assignment, your employment with {CO} Management Services Private Limited shall
          stand terminated forthwith.
        </NumberedItem>
        <NumberedItem index={4}>
          Except for expiry of a Work Assignment due to completion/expiry of the same or in respect of a Work
          Assignment of one week or a lesser period of time, either party may terminate this Work Assignment Letter
          by issuing 7 days&rsquo; notice in writing or payment thereof.
        </NumberedItem>
        <NumberedItem index={5}>
          The Employee is responsible for all company assets under their supervision. They are accountable for any
          asset loss or damage that occurs during their presence or under their process control, even if not
          directly involved. The Company may recover the cost of lost or damaged assets from the Employee&rsquo;s
          remuneration. The Employee will be notified of any recovery decision.
        </NumberedItem>
        <NumberedItem index={6}>
          Termination of this letter of engagement shall not affect the obligations of the parties that have been
          incurred prior to such termination and {CO} Management Services Private Limited shall promptly settle all
          your dues after making the applicable deductions.
        </NumberedItem>
        <NumberedItem index={7}>
          You agree to defend, indemnify and hold {CO} Management Services Private Limited or our client {CL}{" "}
          harmless from any and all claims, damages, liability, attorney&rsquo;s fees and expenses on account of
          your failure to satisfy any of your obligations under this work assignment letter or for misconduct or
          for violation of any law or creation of any legal liability by you.
        </NumberedItem>
        <NumberedItem index={8}>
          Any dispute between you and {CO} Management Services Private Limited shall be referred to a sole
          arbitrator appointed by {CO} Management Services Private Limited the arbitration shall be conducted in
          English language, in accordance with the Arbitration and Conciliation Act 1996, at Bangalore, Karnataka,
          India. This Engagement Letter shall be governed by the laws of India.
        </NumberedItem>
        <NumberedItem index={9}>
          Details of your salary breakup will be as per the Annexure attached herein. You hereby authorize {CO}{" "}
          Management Services Private Limited to make all salary payments required to be made to you by {CO}{" "}
          Management Services Private Limited including all reimbursements either by way of Cheque or by directly
          crediting the amounts to your bank account.
        </NumberedItem>
        <NumberedItem index={10}>
          You shall be subject to background check and in the event the background check is negative, the company
          reserves the right to terminate your employment without any further notice.
        </NumberedItem>
        <NumberedItem index={11}>The salary payout will be made at the latest by 9th of the following month.</NumberedItem>
        <NumberedItem index={12}>
          You will be entitled to an employer&rsquo;s contribution of Provident fund to the extent of 12% of your
          basic salary and applicable ESI contribution. You will also be covered under Medical and Accident
          Insurance and will be entitled to all other statutory benefits whichever is applicable during the
          contract period. It is hereby clarified that if you fail to submit the ESIC, PF, Gratuity nomination
          forms together with any other document as required under the applicable labour legislations, {CO}{" "}
          Management Services Private Limited shall not incur any liability with regards to any Claims under the
          said applicable labour legislations.
        </NumberedItem>
        <NumberedItem index={13}>
          In addition to the terms contained herein, your relationship with {CO} Management Services Private
          Limited may be subject to such other additional terms and conditions as may be communicated to you from
          time to time in writing by {CO} Management Services Private Limited and you hereby agree to have read and
          clearly understood the terms of employment provided in the Service Rules, which is attached herein.
        </NumberedItem>
        <NumberedItem index={14}>
          During your employment with the {CO} Management Services Private Limited, if we find any irregularity or
          insufficiency in the documents submitted by you, this Contract Employment Letter would stand
          cancelled/revoked.
        </NumberedItem>
        <NumberedItem index={15}>
          The nature of your relationship with {CO} Management Services Private Limited will be that of contract of
          service for three months from your date of joining, upon expiry or termination of the work Assignment,
          your employment with {CO} Management Services Private Limited shall stand terminated forthwith.
        </NumberedItem>
        <NumberedItem index={16}>
          You shall not, either during or after termination of your employment with our client {CL} give out to any
          third part by word of mouth or otherwise, the Proprietary and/or Confidential Information of the Company,
          that shall include but not limited to all information, software (whether in object or source code),
          statistics, data, data base, knowledge, trade secrets, inventions, products detail, knowhow, formula,
          processes, designs, drawings, charts, maps, concepts, ideas, systems, project plans, business plans, {CL}{" "}
          details, security information, any other creations of whatsoever nature, kind or description,
          organizational matters pertaining to company or our client {CL}. Further, you shall not at any time,
          whether during or after the period of employment, use such Proprietary or Confidential information or any
          part thereof, for your own benefit or for the benefit of any person, firm, company or other legal entity
          other that our client {CL}. These <U>Non-Disclosure</U> obligations enumerated above shall be binding on
          you at all times, irrespective of whether you continue to be employed by the company or not.
        </NumberedItem>
        <NumberedItem index={17}>
          This Contract Employment letter shall be coterminous with the agreement we have with our client {CL}.
        </NumberedItem>
        <NumberedItem index={18}>
          If the employee desires to leave the company, he/she needs to serve notice period of &lsquo;15&rsquo; days
          in prior and give a written letter. If Employee does not serve the complete notice period, then the short
          served days will be deducted from his/her salary; the employee will be eligible for salary only if he/she
          works for a minimum of 15 days with us.
        </NumberedItem>
        <NumberedItem index={19}>
          The Employee is responsible for all company assets under their supervision. They are accountable for any
          asset loss or damage that occurs during their presence or under their process control, even if not
          directly involved. The Company may recover the cost of lost or damaged assets from the Employee&rsquo;s
          remuneration. The Employee will be notified of any recovery decision.
        </NumberedItem>
        <NumberedItem index={20}>
          Please note that we want to keep the payout time cycle of 21st to 20th of every month; the salary payout
          will happen by the 7th of the following month.
        </NumberedItem>
        <NumberedItem index={21}>
          You shall not, either during or after termination of your employment with the client, give out to any
          third party by word of mouth or otherwise, the Proprietary and/or Confidential Information of the
          Company, that shall include but not limited to all information, software (whether in object or source
          code), statistics, data, data base, knowledge, trade secrets, inventions, products detail, know-how,
          formula, processes, designs, drawings, charts, maps, concepts, ideas, systems, project plans, business
          plans, client details, security information, and any other creations of whatsoever nature, kind or
          description, organizational matters pertaining to the company or our client. Further, you shall not at
          any time, whether during or after the period of employment, use such Proprietary or Confidential
          information or any part thereof, for your own benefit or for the benefit of any person, firm, company or
          other legal entity other than our client. These non-disclosure obligations enumerated above shall be
          binding on you at all times, irrespective of whether you continue to be employed by the company or not.
        </NumberedItem>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontFamily: "Times-Bold", textDecoration: "underline", marginBottom: 8 }}>ENDORSEMENT</Text>
          <Text style={{ marginBottom: 12 }}>
            I hereby confirm acceptance of the above assignment, on the terms and conditions stipulated therein.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 30 }}>
            <View style={{ width: "45%" }}>
              <Text style={{ fontFamily: "Times-Bold" }}>For {CO} Management Services Pvt Ltd</Text>
              {stamp ? (
                <Image src={stamp} style={{ width: 70, marginTop: 6, marginBottom: 4, marginLeft: 15, opacity: 0.85 }} />
              ) : null}
              <Text style={{ marginTop: stamp ? 0 : 40, fontFamily: "Times-Bold" }}>Authorized Signatory</Text>
              <Text>P. Bikshapathi</Text>
              <Text>Head &ndash; Human Resources</Text>
            </View>
            <View style={{ width: "45%" }}>
              <Text>Accepted and Agreed</Text>
              <Text style={{ marginTop: 40 }}>Signature and date: {doj}</Text>
              <Text style={{ fontFamily: "Times-Bold" }}>Name: {name}</Text>
            </View>
          </View>
        </View>
      </BrandedPage>

      <BrandedPage>
        <SalaryTable
          title={`Salary Annexure I${clLoc ? " - " + clLoc : ""}`}
          columnHeaders={["Particulars", "Amount (Per Month)", "Yearly"]}
          rows={rows}
        />
        <Text style={{ textAlign: "center", fontSize: 9, color: "#555555", marginTop: 8 }}>
          *A minimum attendance of 26 days is required to be eligible for all the above-mentioned bonuses.
        </Text>
        <Text style={{ marginTop: 20 }}>I hereby accept the above-mentioned terms and conditions.</Text>
        <View style={{ marginTop: 40, width: "55%", marginLeft: "auto", alignItems: "flex-end" }}>
          <Text style={{ fontFamily: "Times-Bold" }}>Signature:</Text>
          <Text style={{ fontFamily: "Times-Bold" }}>Name: {name}</Text>
          <Text style={{ fontFamily: "Times-Bold" }}>Date: {doj}</Text>
        </View>
      </BrandedPage>
    </Document>
  );
}

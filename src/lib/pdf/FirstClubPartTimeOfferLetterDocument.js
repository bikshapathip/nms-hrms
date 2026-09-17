import { Document, View, Text, Image } from "@react-pdf/renderer";
import { BrandedPage } from "./BrandedPage";
import { B, U } from "./text";
import { getStampBase64 } from "@/lib/pdfLayout";

function fmtDate(date) {
  if (!date) return "___________";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmt(n) {
  return (n || 0).toLocaleString("en-IN");
}

const CO = "Nilkanta";

function Section({ index, title, children }) {
  return (
    <View style={{ marginBottom: 10 }} wrap={false}>
      <Text style={{ fontFamily: "Times-Bold", marginBottom: 2 }}>{index}. {title}</Text>
      <Text style={{ textAlign: "justify" }}>{children}</Text>
    </View>
  );
}

function CheckItem({ children }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 6 }}>
      <Text style={{ width: 14 }}>&bull;</Text>
      <Text style={{ flex: 1, textAlign: "justify" }}>{children}</Text>
    </View>
  );
}

export function FirstClubPartTimeOfferLetterDocument({ employee: emp, client }) {
  const name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  const address = [emp.address, emp.addressCity].filter(Boolean).join(", ") || "___________";
  const doj = fmtDate(emp.dateOfJoining);
  const clLoc = emp.clientLocation || "___________";
  const CL = (client?.clientName || "___________").toUpperCase();
  const empCode = emp.employeeId || "___________";
  const pay = fmt(emp.basicSalary || 11000);
  const stamp = getStampBase64();

  return (
    <Document>
      <BrandedPage>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", fontSize: 12, textDecoration: "underline", marginBottom: 12 }}>
          PART TIMER ENGAGEMENT LETTER
        </Text>
        <Text style={{ textAlign: "right", fontFamily: "Times-Bold", marginBottom: 8 }}>Date: {doj}</Text>

        <Text style={{ fontFamily: "Times-Bold", marginBottom: 10 }}>To,</Text>
        <Text style={{ marginBottom: 2 }}><B>Name:</B> <B>{name}</B></Text>
        <Text style={{ marginBottom: 12 }}><B>Address:</B> {address}</Text>
        <Text style={{ marginBottom: 12 }}><B>Part Timer EMP ID:</B> <B>{empCode}</B></Text>

        <Text style={{ fontFamily: "Times-Bold", marginBottom: 8 }}>Subject: Offer of Part-Time Engagement</Text>
        <Text style={{ fontFamily: "Times-Bold", marginBottom: 8 }}>Dear {name}</Text>

        <Text style={{ textAlign: "justify", marginBottom: 10 }}>
          We are pleased to provide you an engagement letter as a Part-Time Worker with{" "}
          <B>{CO.toUpperCase()} MANAGEMENT SERVICES PRIVATE LIMITED</B> for the role of Part Timer. Please find below
          the key terms of this offer:
        </Text>
        <Text style={{ textAlign: "justify", marginBottom: 14 }}>
          This is a service-based, non-employment gig engagement. It is not an offer of permanent, full-time or
          fixed-term employment unless expressly stated in writing by the Company. Your relationship with the
          Company will be governed by this letter, the Company&rsquo;s policies and standard operating procedures
          (&ldquo;SOPs&rdquo;), and applicable Indian law, including the Code on Social Security, 2020, as and when
          its relevant provisions are notified and made applicable.
        </Text>

        <Section index={1} title="Role and Location">
          You will be engaged as a <B>Part Timer &ndash; On Demand Model</B> and will work out at our client place{" "}
          <B>{clLoc}</B> &ndash; {CL}.
        </Section>
        <Section index={2} title="Nature of Engagement">
          This is a part-time, flexible engagement. You may choose working four hour of slots / shifts based on
          availability, subject to a maximum of Four hours per day.
        </Section>
        <Section index={3} title="Date of Joining">
          Your engagement will commence on <B>{doj}</B>.
        </Section>
        <Section index={4} title="Compensation">
          You will be paid <B>INR {pay}</B> fixed provided you are working for 31 days in the entire month subject
          to applicable deductions and taxes. Payouts will be made on a monthly basis plus you shall be covered
          under insurance coverage.
        </Section>

        <View style={{ marginBottom: 10 }} wrap={false}>
          <Text style={{ fontFamily: "Times-Bold", marginBottom: 2 }}>5. Working Terms</Text>
          <Text style={{ textAlign: "justify" }}>
            i. You will be required to log in and complete assigned tasks as per the agreed schedule. ii. You will
            be provided training/orientation prior to commencing work. iii. You are expected to follow the
            Company&rsquo;s code of conduct, hygiene, and safety guidelines at all times.
          </Text>
        </View>

        <Section index={6} title="Documents Required">
          Please carry a valid photo ID proof, address proof, and bank account details for the purpose of
          onboarding and payment processing.
        </Section>
        <Section index={7} title="Termination">
          Either party may end this engagement at any time by providing prior intimation, without any notice period
          requirement.
        </Section>

        <Text style={{ textAlign: "justify", marginBottom: 10 }}>
          This offer is contingent upon successful completion of any background verification checks required by
          the Company.
        </Text>
        <Text style={{ textAlign: "justify", marginBottom: 20 }}>
          We look forward to having You as part of our team. Please sign and return a copy of this letter as a
          token of Your acceptance.
        </Text>

        <View wrap={false}>
          <Text style={{ fontFamily: "Times-Bold" }}>For {CO} Management Services Pvt Ltd</Text>
          {stamp ? (
            <Image src={stamp} style={{ width: 70, marginTop: 6, marginBottom: 4, marginLeft: 15, opacity: 0.85 }} />
          ) : null}
          <Text style={{ marginTop: stamp ? 0 : 40, fontFamily: "Times-Bold" }}>Authorized Signatory</Text>
          <Text>P. Bikshapathi</Text>
        </View>

        <View style={{ marginTop: 24 }} wrap={false}>
          <Text style={{ fontFamily: "Times-Bold", marginBottom: 8 }}>Acceptance</Text>
          <Text style={{ textAlign: "justify", marginBottom: 8 }}>
            I, <B>{name}</B>, by signing below or by accepting digitally through the Company application, confirm
            and declare that:
          </Text>
          <CheckItem>I have read and understood this engagement letter and accept its terms.</CheckItem>
          <CheckItem>
            I understand this is a gig engagement and not permanent/fixed-term employment unless expressly stated
            in writing.
          </CheckItem>
          <CheckItem>The information and documents I have provided are true, accurate and complete.</CheckItem>
          <CheckItem>
            I consent to the Company&rsquo;s policies, SOPs, privacy policy, and location tracking for operational
            purposes.
          </CheckItem>
          <CheckItem>
            I acknowledge the insurance and benefits described are subject to the actual policy terms, eligibility
            and applicable law.
          </CheckItem>
          <Text style={{ marginTop: 30 }}>_____________________</Text>
          <Text>Name and Signature of Candidate</Text>
        </View>
      </BrandedPage>
    </Document>
  );
}

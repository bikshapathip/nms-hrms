import { Document, View, Text, Image } from "@react-pdf/renderer";
import { BrandedPage } from "./BrandedPage";
import { B, U, NumberedItemWrap, RomanItem, Paragraph } from "./text";
import { getStampBase64 } from "@/lib/pdfLayout";

function ordinalDate(date) {
  const d = date ? new Date(date) : new Date();
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";
  const month = d.toLocaleDateString("en-IN", { month: "long" });
  return `${String(day).padStart(2, "0")}${suffix} Day of ${month}, ${d.getFullYear()}`;
}

function formatAadhaar(a) {
  const digits = (a || "").replace(/\D/g, "");
  if (!digits) return "___________";
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function Bullet({ children }) {
  return (
    <View style={{ flexDirection: "row", marginLeft: 42, marginBottom: 6 }}>
      <Text style={{ width: 12 }}>-</Text>
      <Text style={{ flex: 1, textAlign: "justify" }}>{children}</Text>
    </View>
  );
}

export function ElasticRunAgreementDocument({ employee: emp }) {
  const name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  const residence = [emp.address, emp.addressCity, emp.addressState].filter(Boolean).join(", ") +
    (emp.addressZipCode ? ` - ${emp.addressZipCode}` : "") || "___________";
  const desig = emp.designation || "___________";
  const pan = emp.panNumber || "___________";
  const aadhaar = formatAadhaar(emp.aadharNumber);
  const agreementDate = ordinalDate(emp.dateOfJoining);
  const stamp = getStampBase64();

  return (
    <Document>
      <BrandedPage>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", fontSize: 12, textDecoration: "underline", marginBottom: 12 }}>
          BUSINESS PARTNER AGREEMENT
        </Text>

        <Paragraph>
          This Business Partner Agreement (&quot;Agreement&quot;) is made on this <B>{agreementDate}</B>
        </Paragraph>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", marginBottom: 8 }}>BY AND BETWEEN</Text>
        <Paragraph>
          <U>NILKANTA MANAGEMENT SERIVICES PRIVATE LIMITED</U> a Company established under the laws of India, having
          its registered place of business at H.No.12-10-409/25/1, BIDAL BASTI, SITAPHALMANDI, SECUNDERABAD,
          HYDERABAD- 500061, Telangana, (which expression shall unless it be repugnant to the context or the meaning
          thereof, mean and include its successors-in-interest and permitted assigns) being &quot;Company&quot; of the FIRST
          PART.
        </Paragraph>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", marginBottom: 8 }}>AND</Text>
        <Paragraph>
          <U>{name}</U> individual having its residence at {residence}. bearing Pan No. <B>{pan}</B> and Aadhaar No{" "}
          <B>{aadhaar}</B> (which expression shall unless it be repugnant to the context or the meaning thereof,
          mean and include its successors-in-interest and permitted assigns) being &ldquo;Business Partner&rdquo; of the
          OTHER PART. (Company and Business Partner shall hereinafter be individually referred to as &lsquo;Party&rsquo; and
          collectively referred to as &lsquo;Parties&rsquo;) WHEREAS, The Company is inter-alia engaged in the business of
          providing diversified delivery services, return services, cash pickup services and other services to
          E-commerce companies as well as such third-party consignors.
        </Paragraph>
        <Paragraph>
          AND WHEREAS, Business Partner represents to the Company that it is engaged in performing services such as
          delivery of the allocated packages, planning daily travel routes based on delivery location, accepting and
          recording payments after delivering packages, acquiring acknowledgement from the customers, sorting,
          packaging and other activities, in the capacity of an independent contractor.
        </Paragraph>
        <Paragraph>
          AND WHEREAS, based on the proposal and representations submitted by Business Partner, Company is willing
          to engage the services purely as an independent contractor and the Business Partner is willing to provide
          the same service purely as an independent contractor on such terms and conditions agreed herein below.
        </Paragraph>
        <Paragraph>
          NOW THEREFORE, in consideration of the mutual covenants herein contained, the parties hereby agree, as
          follows:
        </Paragraph>
        <Paragraph>
          The parties hereto agree that the aforesaid recitals shall form the integral and operative part of this
          Agreement and shall be treated as covenants hereof.
        </Paragraph>

        <NumberedItemWrap index={1}>
          <B>Purpose of The Agreement:</B> Business Partner shall perform services such as delivery services,
          return services, cash pickup services, loading/unloading services etc. from time to time, as more
          specifically defined in Annexure II and other services according to the service level standards
          mentioned in Annexure I herewith. The Business Partner shall be responsible for providing any or all
          services from those listed in the Annexure-II as the Company may require from time to time.
        </NumberedItemWrap>
        <NumberedItemWrap index={2}>
          The Business Partner hereby agrees and undertakes that while performing the services it shall abide by
          the following terms and conditions:
        </NumberedItemWrap>
        <View style={{ marginTop: -6 }}>
          <RomanItem index={1}>Fully perform the services, in a professional manner, at the location intimated by the Company.</RomanItem>
          <RomanItem index={2}>Not to act in any manner which is detrimental to the interest of the Company or any customer of the Company.</RomanItem>
          <RomanItem index={3}>Not receive any payments of any nature directly or indirectly from the customer of the Company unless agreed to by the Company.</RomanItem>
          <RomanItem index={4}>
            Extend all cooperation with the Company&rsquo;s employees, consultants, representatives, etc. and do all
            such things as may be necessary and comply with all terms of this Agreement to effectively undertake
            the work assigned to you.
          </RomanItem>
          <RomanItem index={5}>
            Report and be present at the designated location and time and provide services as may be required by
            the Company or its Customer and abide by the rules, regulations and code of conduct as required by the
            Company.
          </RomanItem>
          <RomanItem index={6}>Comply with the safety, health and other rules and regulations of the Company and its Customer as applicable.</RomanItem>
          <RomanItem index={7}>
            The Business Partner shall not commit breach of any law, fraud, misrepresentation, forgery, or any
            other act or omission that is detrimental to the Company or any of its customers. In addition to
            compliance with the applicable laws the Business Partner shall ensure that he abides by the policies,
            code of conduct and other rules, Policies etc. of the Company and its customer, for whom the Personnel
            are deployed.
          </RomanItem>
          <RomanItem index={8}>Comply with the safety, health and other rules and regulations of the Company and its Customer as applicable.</RomanItem>
          <RomanItem index={9}>Fully perform the services, in a professional manner, at the location intimated by the Company during the term of this Agreement.</RomanItem>
          <RomanItem index={10}>It shall not claim any employment rights from the Company or any third party for whom the Business Partner is deployed.</RomanItem>
        </View>

        <NumberedItemWrap index={3}>
          <B>Term of The Agreement:</B> This Agreement shall be valid for a period of Three Years commencing from
          (&ldquo;Effective Date&rdquo;). However, this is not a contract of services but a gig worker arrangement. There is
          no binding commitment from the Company that the Business Partner will be engaged for any specific
          services.
        </NumberedItemWrap>
        <NumberedItemWrap index={4}>
          <B>Compensation and Payment:</B> Upon Business Partner performing its obligations as set out in this
          Agreement and observing and complying with the same, the Company shall pay the Business Partner fees as
          detailed in Annexure III below (herein referred to as Service Charges). The total payment shall be made
          at the intervals determined by the Company after the deduction of TDS (Tax Deducted at Source) or if any
          statutory charges are applicable under any law. It is expressly agreed between the parties that no other
          charges, fee, rent, compensation etc. will be paid to Business Partner. Business Partner agrees to
          reconcile the outstanding amounts and provide &ldquo;No Dues Confirmation&rdquo; to Company as and when required by
          the Company.
        </NumberedItemWrap>
        <NumberedItemWrap index={5}>
          <B>Termination of Engagement:</B> Company may terminate this Agreement upon 7 (seven) days prior written
          notice to the Business Partner of its intention to do so during the term of this Agreement without
          assigning any reason thereof. The Company shall also have the right to terminate this Agreement or any
          ongoing engagement with immediate effect, without incurring any liability whatsoever, in the event the
          Business Partner commits any unlawful activity, breaches any of the terms of the Agreement or the code of
          conduct, commits any fraud, theft, misappropriation, or any other civil or criminal offence, or alleged
          to have committed any such offence, or for any other acts or omission that are detrimental to the
          interest of the Company, or is against the applicable laws, falsifies any records of the company, or the
          background verification of the Business Partner has any discrepancy. In such a case the Company shall
          also be entitled to recover all the loss, damage, liability etc., incurred or caused to the Company owing
          to the same. The Company&rsquo;s decision in this regard shall be final and binding.
        </NumberedItemWrap>
        <NumberedItemWrap index={6}>
          <B>Force Majeure:</B> Notwithstanding anything contained in this Agreement, neither Party shall be held
          liable for any default or delay in performance of any obligation under the Agreement on account of any
          reason beyond its reasonable control, including but not limited to flood, natural calamity, Act of God,
          Pandemic, the enactment of any Act of Parliament or the act of any other legally constituted authority.
          Non-performance on account of aforesaid reasons shall not be deemed to constitute a breach of this
          Agreement. If force majeure is continued for a continuous period of one month, then Company shall have a
          right to terminate the Agreement forthwith.
        </NumberedItemWrap>
        <NumberedItemWrap index={7}>
          <B>Dispute Resolution:</B> The Parties shall attempt to resolve amicably all disputes arising out of or
          in connection with this Agreement, including its existence and interpretation. However, if the parties
          fail to do so, the dispute shall be resolved by the courts having jurisdiction over the matter in
          accordance with the provisions of this Agreement. This Agreement is governed by and will be construed in
          accordance with the laws of India. The Courts at Pune alone shall have the exclusive jurisdiction to try
          all suits or proceedings, matters or things in connection with this Agreement.
        </NumberedItemWrap>
        <NumberedItemWrap index={8}>
          <B>Indemnification:</B> Notwithstanding anything contained contrary in this Agreement, Business Partner
          hereby irrevocably undertakes to indemnify Company and its customer from and against all third-party
          claims arising out of or in relation to any acts or omissions of the Business Partner.
        </NumberedItemWrap>

        <NumberedItemWrap index={9}><B>Confidentiality:</B></NumberedItemWrap>
        <View style={{ marginLeft: 18, marginTop: -6 }}>
          <Paragraph>
            During the performance of its obligations under this Agreement, Business Partner may have access to
            oral &amp; written information which is considered confidential and trade secret of The Company which
            shall be kept fully confidential by Business Partner. Information considered confidential by The
            Company includes, without limitation, matters of technical nature such as trade secret processes or
            devices, matters of business nature such as information about costs, profits, pricing policies,
            markets, sales, suppliers, customers, employees, product plans and marketing plans or strategies,
            information received from third parties under an obligation of confidentiality and other information
            of a similar nature not generally disclosed by The Company to the public (herein referred to as
            &ldquo;Confidential Information&rdquo;). Business Partner agrees and undertakes that such Confidential Information
            is to be considered as the Company&rsquo;s proprietary information and property. Business Partner shall treat
            such Confidential Information provided or disclosed by The Company, received by the Business Partner
            via any application of the Company, or disclosed by the any customer or third party of the Company or
            developed therefrom with the same degree of care as Business Partner applies to its own Confidential
            and Proprietary Information, but in all cases with at least a reasonable degree of care.
          </Paragraph>
          <Paragraph>
            Business Partner agrees that during the term of this Agreement it will not disclose any Confidential
            Information to any third party without the prior written consent of The Company. Provided that the
            aforesaid disclosure shall not be applicable and shall impose no obligation on Business Partner with
            respect to any portion of information disclosed pursuant to the requirements of any statute/ law or a
            court/ tribunal order but with the prior written intimation to The Company along with a copy of such
            order/notice and other sufficient details immediately upon receipt of such orders in order to permit
            The Company to make an application for an appropriate protective order and provide such
            information/documents as may be advised by The Company in writing.
          </Paragraph>
          <Paragraph>
            Except as set forth in this Agreement, Business Partner shall not use, disclose, make or have made any
            copies of any materials or information provided by The Company, shared via any application of the
            Company or its customer, or any information shared by the Customer of the Company or any information
            developed therefrom in whole or in part, without the prior written approval of The Company.
          </Paragraph>
          <Paragraph>
            Business Partner understands and agrees that any use or dissemination of any information or materials
            in violation or breach of this Agreement will cause The Company irreparable harm, will leave The
            Company with no adequate remedy at law and will entitle The Company to injunctive relief in addition to
            all other remedies available under law for the time being in force. In case Business Partner violates
            its obligations hereunder, it shall reimburse The Company for reasonable costs and expenses incurred in
            enforcement of this Clause.
          </Paragraph>
          <Paragraph>The Confidentiality Obligations of the Parties shall survive after the termination or expiry of this agreement.</Paragraph>
        </View>

        <NumberedItemWrap index={10}><B>Relationship between the Parties:</B></NumberedItemWrap>
        <View style={{ marginTop: -6 }}>
          <RomanItem index={1}>
            The Business Partner acknowledges that he is an independent contractor and not an employee, agent or
            representative of the Company. Nothing in this agreement shall be construed as creating an
            employer-employee relationship, partnership, joint venture, agency or any other form of legal
            association between the business partner and the Company.
          </RomanItem>
          <RomanItem index={2}>
            The Business Partner shall have full discretion in determining how to perform the agreed services,
            provided that he adheres to the Company&rsquo;s service, quality standards and operational policies.
          </RomanItem>
          <RomanItem index={3}>The Business Partner shall not be entitled to any employment-related benefits from the Company including but not limited to:</RomanItem>
        </View>
        <Bullet>Provident fund contribution, gratuity or pension benefits.</Bullet>
        <Bullet>Medical, accident or life insurance coverage.</Bullet>
        <Bullet>Paid leaves, sick leaves or holiday benefits.</Bullet>
        <View>
          <RomanItem index={4}>
            The Business Partner shall be solely responsible for all applicable taxes, insurance and statutory
            deductions related to his earnings under this agreement. The Company shall have no obligations to
            withhold or remit any taxes or statutory contributions on behalf of the Business Partner.
          </RomanItem>
          <RomanItem index={5}>
            The Business Partner is free to engage in other work or assignments with Third Parties provided that
            such engagements do not interfere with his obligations under this Agreement or result in a conflict of
            interest with the Company&rsquo;s business.
          </RomanItem>
          <RomanItem index={6}>The Business Partner shall bear all costs and expenses associated with the performance of his services including but not limited to:</RomanItem>
        </View>
        <Bullet>Fuel and vehicle maintenance expenses.</Bullet>
        <Bullet>Mobile or Internet charges used for communicating delivery updates.</Bullet>
        <Bullet>Any required licenses or permits necessary for conducting the services.</Bullet>
        <View>
          <RomanItem index={7}>
            The Business Partner shall use his own resources and equipment to perform the services. If the Company
            provides any equipment, it shall remain the property of the Company and must be returned upon
            termination of this Agreement.
          </RomanItem>
          <RomanItem index={8}>
            The Business Partner agrees that he shall not claim any rights as a permanent employee of the Company
            under any prevailing laws including the Industrial Disputes Act, 1947 or any other applicable labour
            legislation.
          </RomanItem>
          <RomanItem index={9}>
            The Business Partner shall follow the process as may be required by the Company to record the
            provisions of services or attendance of the Business Partner for payment or other purposes.
          </RomanItem>
          <RomanItem index={10}>
            The Business Partner hereby provides consent to the Company to collect and process personal data
            including any sensitive personal data of the Business Partner, in relation to any background
            verification, taking insurance policy or any other purpose that is a legitimate and in the interest of
            the Business Partner.
          </RomanItem>
        </View>

        <Paragraph style={{ marginTop: 8 }}>
          Business Partner agrees and hereby declare that he/she has read and understood the contents of this
          Agreement through its appointed Lawyer/Legal Advisor. The contents of the Agreement are also made
          available to understand in the Vernacular language and have then been signed and attested hereto.
        </Paragraph>
        <Paragraph>
          IN WITNESS WHEREOF the Parties hereto have hereunto set and subscribe their respective hands on the day
          and year first hereinabove written.
        </Paragraph>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 24 }} wrap={false}>
          <View style={{ width: "45%", position: "relative" }}>
            <Text style={{ fontFamily: "Times-Bold" }}>For NILKANTA MANAGEMENT SERIVICES PRIVATE LIMITED</Text>
            {stamp ? (
              <Image src={stamp} style={{ position: "absolute", top: 28, left: 15, width: 85, opacity: 0.85 }} />
            ) : null}
            <Text style={{ marginTop: 40 }}>Name: P.Bikshapathi</Text>
            <Text>Designation: Director</Text>
          </View>
          <View style={{ width: "45%" }}>
            <Text style={{ fontFamily: "Times-Bold" }}>For Business Partner</Text>
            <Text style={{ marginTop: 40 }}>Name: {name}</Text>
            <Text>Title: {desig}</Text>
          </View>
        </View>
      </BrandedPage>

      <BrandedPage>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", fontSize: 11, textDecoration: "underline", marginBottom: 10 }}>
          ANNEXURE - I
        </Text>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", marginBottom: 10 }}>
          General Service Level Standards for Delivery Services
        </Text>
        <Text style={{ fontFamily: "Times-Bold", marginBottom: 6 }}>A. General Service Level Standards:</Text>
        <Paragraph>
          While performing delivery and allied services, The Company requires you to provide Services as per best
          industries standards, including and subject to the terms and scope contained herein below.
        </Paragraph>

        <Text style={{ fontFamily: "Times-Bold", marginBottom: 4 }}>Successfully delivering packages to customers:</Text>
        <Bullet><B>Delivery Completion:</B> Company requires that the Packages tendered to you are delivered to customers as specified within the delivery app.</Bullet>
        <Bullet><B>Late deliveries:</B> Company requires that you deliver the Packages on time in accordance with Company&rsquo;s specifications. Unless specified otherwise in the delivery app, you must deliver all Packages by 9 pm (local time) on the day they are tendered to you.</Bullet>
        <Bullet><B>Packages marked as delivered but not received by the customer:</B> If you make a delivery as per the delivery instructions in the delivery app, Company expects that the customer will find and receive the Package(s).</Bullet>
        <Bullet><B>Un-attempted or undeliverable Packages not returned to Company in a timely manner:</B> In instances where delivery is not possible, you must return all undelivered Packages tendered to you, unless otherwise instructed (in writing) by the Company.</Bullet>
        <Bullet><B>Cash on Delivery (COD) Packages:</B> You will collect cash as applicable on delivery of COD Package(s) (Carrier Operation Management Platform).</Bullet>

        <Text style={{ fontFamily: "Times-Bold", marginTop: 6, marginBottom: 4 }}>
          Reliably attending and performing all pre-arranged Services, including route commitments:
        </Text>
        <Bullet><B>Arriving on time and performing all pre-arranged Services:</B> You must perform Services accepted by you, including route commitments within the prescribed timelines.</Bullet>

        <Text style={{ fontFamily: "Times-Bold", marginTop: 6, marginBottom: 4 }}>Maintaining a professional reputation while performing Services:</Text>
        <Bullet><B>Professional behavior:</B> You must behave respectfully and professionally when providing Services, including when interacting with third parties such as customers, station operators, merchants, other delivery service partners, and the public.</Bullet>
        <Bullet><B>Following instructions:</B> You must follow the delivery instructions in the delivery app or otherwise provided by a customer as long as the customer&rsquo;s instructions are reasonable and are not inconsistent with safety standards or applicable Law.</Bullet>
        <Bullet><B>Providing reasonable care of Packages:</B> You must handle all Packages with care, including not tossing, throwing, slamming, kicking, flipping, shaking, leaving in the rain and/or elements, or otherwise handling Packages in any way that may damage or could be perceived as damaging the Package or its contents or customer property.</Bullet>

        <Text style={{ fontFamily: "Times-Bold", marginTop: 6, marginBottom: 4 }}>Prohibition of Drugs/Alcohol:</Text>
        <Paragraph>
          You will be under the obligation to maintain utmost professionalism during the working hours of the
          organization. Under no circumstances you will be under the influence of Alcohol/Tobacco or narcotics, or
          controlled substances in any form or any such thing which is detrimental to the position held by you. If
          you are found to violate the aforesaid clause you will be liable to strict disciplinary action.
        </Paragraph>

        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", fontSize: 11, textDecoration: "underline", marginTop: 20, marginBottom: 10 }}>
          ANNEXURE - II
        </Text>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", marginBottom: 10 }}>SCOPE OF SERVICES</Text>
        <Paragraph>
          Business Partner will perform the below services as &ndash; <B>{desig}</B>
        </Paragraph>
        <Paragraph>
          overseeing daily operations, driving team productivity, ensuring company policies are followed, and
          acting as a coach to support employee development and performance
        </Paragraph>

        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", fontSize: 11, textDecoration: "underline", marginTop: 20, marginBottom: 10 }}>
          ANNEXURE - III
        </Text>
        <Text style={{ textAlign: "center", fontFamily: "Times-Bold", marginBottom: 10 }}>RATES / FEES / CHARGES</Text>
        <Text style={{ marginBottom: 6 }}>Monthly Service Fee - Indian Rupee 16,000/- (30/31 as per calendar month)</Text>
        <Text style={{ marginBottom: 6 }}>Monthly Attendance Allowance &ndash; Indian Rupee 500/- (*If Applicable and Terms and Conditions Applied)</Text>
        <Text style={{ marginBottom: 6 }}>Monthly Mobile Allowance &ndash; Indian Rupee _____/- (*If Applicable and Terms and Conditions Applied)</Text>
        <Text style={{ marginBottom: 12 }}>Monthly (Retention/Joining) Incentive _____/- (*If Applicable and Terms and Conditions Applied)</Text>
        <Paragraph>
          As per the company standard basis for the services provided and total payment shall be made at the end
          of the month for complete month pay out or on monthly basis after the deduction of TDS (Tax Deducted at
          Source) or if any statutory charges applicable under any law (if applicable).
        </Paragraph>
      </BrandedPage>
    </Document>
  );
}

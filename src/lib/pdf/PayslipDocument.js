import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import { BrandedPage } from "./BrandedPage";
import { SalaryTable } from "./SalaryTable";
import { InfoTable } from "./InfoTable";

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

const s = StyleSheet.create({
  title: { textAlign: "center", fontFamily: "Times-Bold", fontSize: 14, textDecoration: "underline", marginBottom: 4 },
  period: { textAlign: "center", fontSize: 11, marginBottom: 16 },
  netBox: {
    width: "82%",
    marginHorizontal: "9%",
    marginVertical: 14,
    borderWidth: 2,
    borderColor: "#333333",
    borderRadius: 4,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f6f9f6",
  },
  netLabel: { fontFamily: "Times-Bold", fontSize: 11 },
  netWords: { fontSize: 9, color: "#444444", marginTop: 2 },
  netAmt: { fontSize: 16, fontFamily: "Times-Bold" },
  note: { textAlign: "center", fontSize: 9, color: "#555555", marginTop: 16 },
});

export function PayslipDocument({ payslip }) {
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

  const earningRows = [
    ...earnings.map((e) => ({ label: e.label, value: fmt(e.value) })),
    { label: "Gross Earnings (A)", value: fmt(payslip.earnedGross), bold: true, variant: "green" },
  ];

  const deductionRows = deductions.length
    ? [
        ...deductions.map((d) => ({ label: d.label, value: fmt(d.value) })),
        { label: "Total Deductions (B)", value: fmt(payslip.totalDeductions), bold: true, variant: "yellow" },
      ]
    : [
        { label: "No deductions", value: "" },
        { label: "Total Deductions (B)", value: fmt(payslip.totalDeductions), bold: true, variant: "yellow" },
      ];

  return (
    <Document>
      <BrandedPage>
        <Text style={s.title}>PAYSLIP</Text>
        <Text style={s.period}>{MONTHS[payslip.month - 1]} {payslip.year}</Text>

        <InfoTable
          rows={[
            ["Employee Name", empName, "Employee ID", emp.employeeId || "___________"],
            ["Designation", emp.designation || "___________", "Department", emp.department || "___________"],
            ["Date of Joining", fmtDate(emp.dateOfJoining), "Bank Account", emp.bankAccount || "___________"],
            ["PAN Number", emp.panNumber || "___________", "UAN Number", emp.uanNumber || "___________"],
            ["Working Days", String(payslip.totalWorkingDays), "Days Worked", String(payslip.daysWorked)],
            ["Leave Days", String(leaveDays)],
          ]}
        />

        <SalaryTable title="Earnings" rows={earningRows} />
        <SalaryTable title="Deductions" rows={deductionRows} />

        <View style={s.netBox}>
          <View>
            <Text style={s.netLabel}>Net Salary Payable (A - B)</Text>
            <Text style={s.netWords}>{numberToWords(payslip.netSalary)}</Text>
          </View>
          <Text style={s.netAmt}>Rs. {fmt(payslip.netSalary)}</Text>
        </View>

        <Text style={s.note}>This is a system-generated payslip and does not require a signature.</Text>
      </BrandedPage>
    </Document>
  );
}

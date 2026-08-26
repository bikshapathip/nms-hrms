"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FullPageLoader from "@/components/FullPageLoader";

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

export default function PayslipDetailPage() {
  const params = useParams();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchPayslip() {
      try {
        const res = await fetch(`/api/payslips/${params.id}`);
        const data = await res.json();
        setPayslip(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayslip();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" style={{ color: 'var(--primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <span style={{ color: 'var(--text-secondary)' }}>Loading payslip...</span>
        </div>
      </div>
    );
  }
  if (!payslip) return <div className="keka-card text-center py-16" style={{ color: 'var(--text-secondary)' }}>Payslip not found</div>;

  const emp = payslip.employee;
  const leaveDays = payslip.totalWorkingDays - payslip.daysWorked;

  const earnings = [
    { label: "Basic Salary", value: payslip.earnedBasic },
    { label: "HRA", value: payslip.earnedHra },
    { label: "DA (Dearness Allowance)", value: payslip.earnedDa },
    { label: "Other Allowance", value: payslip.earnedOtherAllowance },
    { label: "Leave Encashment", value: payslip.leaveEncashment },
    { label: "Attendance Bonus", value: payslip.attendanceBonus },
    { label: "Performance Bonus", value: payslip.performanceBonus },
    { label: "Special Allowance", value: payslip.specialAllowance },
    { label: "Night Allowance", value: payslip.nightAllowance },
    { label: "Travelling Allowance", value: payslip.travellingAllowance },
    { label: "OT Amount", value: payslip.otAmount },
  ].filter((e) => e.value > 0);

  const deductions = [
    { label: "Provident Fund (12%)", value: payslip.pfDeduction },
    { label: "ESI (0.75%)", value: payslip.esiDeduction },
    { label: "Professional Tax", value: payslip.professionalTax },
    { label: "TDS", value: payslip.tdsDeduction },
  ].filter((d) => d.value > 0);

  return (
    <div>
      {downloading && <FullPageLoader text="Downloading Payslip..." />}
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/payslips" style={{ color: 'var(--primary)' }} className="font-medium hover:underline">Payslips</Link>
          <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: 'var(--text-secondary)' }}>{emp?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setDownloading(true);
              try {
                const res = await fetch(`/api/payslips/${params.id}/pdf`);
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "payslip.pdf";
                  a.click();
                  URL.revokeObjectURL(url);
                }
              } finally { setDownloading(false); }
            }}
            className="btn-success px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Payslip Document */}
      <div className="doc-preview max-w-3xl mx-auto overflow-hidden rounded-xl shadow-sm" id="payslip">
        {/* Header */}
        <div className="doc-hdr">
          <div className="doc-hdr-logo"><img src="/logo.png" alt="Nilkanta" /></div>
          <div className="doc-hdr-top">
            <div className="doc-hdr-top-bg"></div>
            <div className="doc-hdr-top-content"><div className="doc-hdr-name">NILKANTA MANAGEMENT SERIVICES PRIVATE LIMITED</div></div>
          </div>
          <div className="doc-hdr-cin">
            <div className="doc-hdr-cin-bg"></div>
            <div className="doc-hdr-cin-text">CIN: U70200TS2025PTC198036</div>
          </div>
          <div className="doc-hdr-line"></div>
          <div className="doc-hdr-spacer"></div>
        </div>

        <div className="p-8 pt-2">
          <div className="doc-ps-title">PAYSLIP</div>
          <div className="doc-ps-period">{MONTHS[payslip.month - 1]} {payslip.year}</div>

          {/* Employee Details */}
          <table className="doc-ps-info">
            <tbody>
              {[
                ["Employee Name", emp?.name || "—", "Employee ID", emp?.employeeId || "—"],
                ["Designation", emp?.designation || "—"],
                ["Date of Joining", emp?.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString("en-IN") : "—", "Bank Account", emp?.bankAccount || "—"],
                ["PAN Number", emp?.panNumber || "—", "UAN Number", emp?.uanNumber || "—"],
              ].map(([l1, v1, l2, v2]) => (
                <tr key={l1}>
                  <td className="doc-lbl">{l1}</td>
                  {l2 ? (
                    <>
                      <td>{v1}</td>
                      <td className="doc-lbl">{l2}</td>
                      <td>{v2}</td>
                    </>
                  ) : (
                    <td colSpan={3}>{v1}</td>
                  )}
                </tr>
              ))}
              <tr>
                <td className="doc-lbl">Working Days</td>
                <td>{payslip.totalWorkingDays}</td>
                <td className="doc-lbl">Days Worked</td>
                <td>{payslip.daysWorked}</td>
              </tr>
              <tr>
                <td className="doc-lbl">Leave Days</td>
                <td colSpan={3}>{leaveDays}</td>
              </tr>
            </tbody>
          </table>

          {/* Earnings */}
          <table className="doc-st">
            <tbody>
              <tr><th colSpan={2} className="doc-sh">Earnings</th></tr>
              {earnings.map((e) => (
                <tr key={e.label}>
                  <td>{e.label}</td>
                  <td>{e.value.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              <tr className="doc-hg">
                <td><b>Gross Earnings (A)</b></td>
                <td><b>{payslip.earnedGross.toLocaleString("en-IN")}</b></td>
              </tr>
            </tbody>
          </table>

          {/* Deductions */}
          <table className="doc-st">
            <tbody>
              <tr><th colSpan={2} className="doc-sh">Deductions</th></tr>
              {deductions.length > 0 ? deductions.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td>{d.value.toLocaleString("en-IN")}</td>
                </tr>
              )) : (
                <tr><td colSpan={2} className="text-center" style={{ color: '#888' }}>No deductions</td></tr>
              )}
              <tr className="doc-hy">
                <td><b>Total Deductions (B)</b></td>
                <td><b>{payslip.totalDeductions.toLocaleString("en-IN")}</b></td>
              </tr>
            </tbody>
          </table>

          {/* Net Salary */}
          <div className="doc-ps-net">
            <div>
              <p className="doc-lbl">Net Salary Payable (A - B)</p>
              <p className="doc-words">{numberToWords(payslip.netSalary)}</p>
            </div>
            <p className="doc-amt">₹{payslip.netSalary.toLocaleString("en-IN")}</p>
          </div>

          <p className="doc-ps-note">This is a system-generated payslip and does not require a signature.</p>
        </div>

        {/* Footer */}
        <div className="doc-ftr">
          <div className="doc-ftr-spacer"></div>
          <div className="doc-ftr-line"></div>
          <div className="doc-ftr-content">
            <div className="doc-ftr-addr">
              <span>H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad,500061 TG.</span>
            </div>
            <div className="doc-ftr-right">
              <a href="mailto:nilkantamanpower@gmail.com">nilkantamanpower@gmail.com</a>
              <div style={{ marginTop: '1px' }}>GST NO. <b>36AAKCN4393E1Z8</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

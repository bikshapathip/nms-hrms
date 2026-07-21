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
    { label: "Special Allowance", value: payslip.earnedSpecialAllowance },
    { label: "Other Allowance", value: payslip.earnedOtherAllowance },
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
      <div className="flex items-center justify-between mb-6 no-print">
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
          <button onClick={() => window.print()} className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      {/* Payslip Document */}
      <div className="keka-card max-w-3xl mx-auto overflow-hidden" id="payslip">
        {/* Header */}
        <div className="p-8 pb-6" style={{ background: 'linear-gradient(135deg, #1a1d3b 0%, #2d3161 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">PAYSLIP</h1>
                  <p className="text-xs" style={{ color: '#9ca0c7' }}>Salary Statement</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <p className="text-white font-bold">{MONTHS[payslip.month - 1]} {payslip.year}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Employee Details */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            {[
              ["Employee ID", emp?.employeeId],
              ["Date of Joining", emp?.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString("en-IN") : "—"],
              ["Employee Name", emp?.name],
              ["PAN Number", emp?.panNumber || "—"],
              ["Designation", emp?.designation],
              ["UAN Number", emp?.uanNumber || "—"],
              ["Department", emp?.department || "—"],
              ["Bank Account", emp?.bankAccount || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-xs font-medium min-w-[100px]" style={{ color: 'var(--text-secondary)' }}>{label}:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-input)' }}>
              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Working Days</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--primary)' }}>{payslip.totalWorkingDays}</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: '#ecfdf5' }}>
              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Days Worked</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#10b981' }}>{payslip.daysWorked}</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: leaveDays > 0 ? '#fef2f2' : '#f8f9fc' }}>
              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Leave Days</p>
              <p className="text-xl font-bold mt-1" style={{ color: leaveDays > 0 ? '#ef4444' : '#374151' }}>{leaveDays}</p>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Earnings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 rounded-full" style={{ background: '#10b981' }}></div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Earnings</h3>
              </div>
              <div className="space-y-3">
                {earnings.map((e) => (
                  <div key={e.label} className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{e.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>₹{e.value.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '2px solid var(--border-color)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Gross Earnings</span>
                  <span className="text-sm font-bold" style={{ color: '#10b981' }}>₹{payslip.earnedGross.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'var(--danger)' }}></div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Deductions</h3>
              </div>
              <div className="space-y-3">
                {deductions.length > 0 ? deductions.map((d) => (
                  <div key={d.label} className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>₹{d.value.toLocaleString("en-IN")}</span>
                  </div>
                )) : (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No deductions</p>
                )}
                <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '2px solid var(--border-color)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total Deductions</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--danger)' }}>₹{payslip.totalDeductions.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#059669' }}>Net Salary Payable</p>
                <p className="text-xs mt-2" style={{ color: '#047857' }}>{numberToWords(payslip.netSalary)}</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#059669' }}>₹{payslip.netSalary.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This is a system-generated payslip and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

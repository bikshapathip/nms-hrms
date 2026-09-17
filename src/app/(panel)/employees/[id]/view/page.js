"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FullPageLoader from "@/components/FullPageLoader";
import Toast from "@/components/common/Toast";
import { Icon, Field, Section, StatusBadge, SkeletonSection, fmtDate, fmtMoney } from "@/components/detailView";

export default function ViewEmployeePage() {
  const params = useParams();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState(null);

  async function downloadOfferLetter() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/employees/${params.id}/offer-letter`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "offer-letter.pdf";
        a.click();
        URL.revokeObjectURL(url);
        setToast({ type: "success", message: "Offer letter downloaded successfully!" });
      } else {
        setToast({ type: "error", message: "Failed to download offer letter." });
      }
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/employees/${params.id}`);
        if (!res.ok) throw new Error("Employee not found");
        setEmp(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const name = emp ? (emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()) : "";
  const gross = emp ? (emp.basicSalary || 0) + (emp.hra || 0) + (emp.da || 0) + (emp.statutoryBonus || 0) + (emp.otherAllowance || 0) : 0;
  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "";

  return (
    <div>
      {downloading && <FullPageLoader text="Downloading Offer Letter..." />}
      <Toast isOpen={!!toast} type={toast?.type} message={toast?.message} onClose={() => setToast(null)} />
      <div
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div>
          <div className="flex items-center gap-2 text-sm mb-1">
            <Link href="/employees" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Employees</Link>
            <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span style={{ color: '#9ca0c7' }}>View</span>
          </div>
          {loading ? (
            <div className="h-6 w-40 rounded bg-white/10 animate-pulse"></div>
          ) : (
            <h1 className="text-lg sm:text-xl font-bold text-white">{name || "Employee"}</h1>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!loading && emp && (
            <button
              onClick={downloadOfferLetter}
              disabled={downloading}
              className="btn-info px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {downloading ? "Downloading..." : "Download Offer Letter"}
            </button>
          )}
          <Link href={`/employees/${params.id}/payroll`} className="btn-warning px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
            View Payroll
          </Link>
          <Link href={`/employees/${params.id}`} className="btn-primary px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </Link>
        </div>
      </div>

      {error ? (
        <div className="keka-card p-8 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <Link href="/employees" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Back to Employees</Link>
        </div>
      ) : loading ? (
        <>
          <div className="keka-card p-6 mb-5 flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse flex-shrink-0" style={{ background: 'var(--border-color)' }}></div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
              <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-light)' }}></div>
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
          </div>
          <div className="space-y-5">
            <SkeletonSection title="Personal Information" count={7} />
            <SkeletonSection title="Employment Details" count={8} />
            <SkeletonSection title="Address" count={4} />
            <SkeletonSection title="Documents" count={4} />
            <SkeletonSection title="Bank Details" count={3} />
            <SkeletonSection title="Salary (Monthly)" count={7} />
            <SkeletonSection title="Deductions" count={7} />
          </div>
        </>
      ) : !emp ? (
        <div className="keka-card p-8 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Employee not found</p>
          <Link href="/employees" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Back to Employees</Link>
        </div>
      ) : (
        <>
          <div className="keka-card p-6 mb-5 flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: '#6366f1' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{name}</p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{emp.employeeId}</p>
            </div>
            <StatusBadge active={emp.isActive} />
          </div>

          <div className="space-y-5">
            <Section title="Personal Information" theme="indigo" icon={Icon.User}>
              <Field label="Gender" value={emp.gender} icon={Icon.User} />
              <Field label="Date of Birth" value={fmtDate(emp.dateOfBirth)} icon={Icon.Calendar} />
              <Field label="Marital Status" value={emp.maritalStatus} icon={Icon.User} />
              <Field label="Contact Number" value={emp.contactNumber} icon={Icon.Phone} />
              <Field label="Email" value={emp.email} icon={Icon.Mail} />
              <Field label="Reference" value={emp.referenceUser ? `${emp.referenceUser.firstName || ""} ${emp.referenceUser.lastName || ""}`.trim() : ""} icon={Icon.User} />
              <Field label="Remarks" value={emp.remarks} icon={Icon.Note} />
            </Section>

            <Section title="Employment Details" theme="blue" icon={Icon.Briefcase}>
              <Field label="Designation" value={emp.designation} icon={Icon.Briefcase} />
              <Field label="Client" value={emp.client?.clientName} icon={Icon.Building} />
              <Field label="Client Location" value={emp.clientLocation} icon={Icon.MapPin} />
              <Field label="Working City" value={emp.city} icon={Icon.MapPin} />
              <Field label="Working State" value={emp.state} icon={Icon.MapPin} />
              <Field label="Date of Joining" value={fmtDate(emp.dateOfJoining)} icon={Icon.Calendar} />
              <Field label="Working Status" value={emp.workingStatus} icon={Icon.Flag} />
              <Field label="Offer Letter Template" value={emp.offerLetterTemplate} icon={Icon.File} />
            </Section>

            <Section title="Address" theme="teal" icon={Icon.MapPin}>
              <Field label="Address" value={emp.address} icon={Icon.MapPin} />
              <Field label="City" value={emp.addressCity} icon={Icon.MapPin} />
              <Field label="State" value={emp.addressState} icon={Icon.MapPin} />
              <Field label="PIN Code" value={emp.addressZipCode} icon={Icon.Hash} />
            </Section>

            <Section title="Documents" theme="violet" icon={Icon.Hash}>
              <Field label="PAN Number" value={emp.panNumber} icon={Icon.Hash} />
              <Field label="Aadhar Number" value={emp.aadharNumber} icon={Icon.Hash} />
              <Field label="ESIC Number" value={emp.esicNumber} icon={Icon.Hash} />
              <Field label="UAN Number" value={emp.uanNumber} icon={Icon.Hash} />
            </Section>

            <Section title="Bank Details" theme="amber" icon={Icon.Bank}>
              <Field label="Bank Name" value={emp.bankName} icon={Icon.Bank} />
              <Field label="Bank Account" value={emp.bankAccount} icon={Icon.Hash} />
              <Field label="IFSC Code" value={emp.ifscCode} icon={Icon.Hash} />
            </Section>

            <Section title="Salary (Monthly)" theme="emerald" icon={Icon.Rupee}>
              <Field label="Basic Salary" value={fmtMoney(emp.basicSalary)} icon={Icon.Rupee} />
              <Field label="HRA" value={fmtMoney(emp.hra)} icon={Icon.Rupee} />
              <Field label="DA" value={fmtMoney(emp.da)} icon={Icon.Rupee} />
              <Field label="Statutory Bonus" value={fmtMoney(emp.statutoryBonus)} icon={Icon.Rupee} />
              <Field label="Other Allowance" value={fmtMoney(emp.otherAllowance)} icon={Icon.Rupee} />
              <Field label="OT Rate (₹/Hour)" value={fmtMoney(emp.otAmount)} icon={Icon.Rupee} />
              <Field label="Gross Salary" value={fmtMoney(gross)} icon={Icon.Rupee} />
            </Section>

            <Section title="Deductions" theme="rose" icon={Icon.Shield}>
              <Field label="PF" value={emp.pfEnabled ? `Enabled (${emp.pfPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="Employer PF" value={emp.employerPfEnabled ? `Enabled (${emp.employerPfPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="ESI" value={emp.esiEnabled ? `Enabled (${emp.esiPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="Employer ESI" value={emp.employerEsiEnabled ? `Enabled (${emp.employerEsiPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="Professional Tax" value={fmtMoney(emp.professionalTax)} icon={Icon.Rupee} />
              <Field label="TDS" value={`${emp.tdsPercent || 0}%`} icon={Icon.Percent} />
              <Field label="LWF" value={fmtMoney(emp.lwf)} icon={Icon.Rupee} />
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

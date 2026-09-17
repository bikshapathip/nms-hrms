"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FullPageLoader from "@/components/FullPageLoader";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

async function downloadPdf(id, setDownloading) {
  setDownloading(true);
  try {
    const res = await fetch(`/api/payslips/${id}/pdf`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "payslip.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  } finally {
    setDownloading(false);
  }
}

export default function EmployeePayrollPage() {
  const params = useParams();
  const [employee, setEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/payslips/employee/${params.id}`);
        const data = await res.json();
        setEmployee(data.employee || null);
        setPayslips(Array.isArray(data.payslips) ? data.payslips : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const totalGross = payslips.reduce((sum, p) => sum + p.earnedGross, 0);
  const totalDeductions = payslips.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalNet = payslips.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div>
      {downloading && <FullPageLoader text="Downloading Payslip..." />}

      <div
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div className="flex items-center gap-2 text-sm mb-1">
          <Link href="/employees" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Employees</Link>
          <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          {loading ? (
            <div className="h-3.5 w-24 rounded bg-white/10 animate-pulse"></div>
          ) : (
            <Link href={`/employees/${params.id}/view`} style={{ color: '#9ca0c7' }} className="font-medium hover:underline">{employee?.name}</Link>
          )}
          <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: '#9ca0c7' }}>Payroll</span>
        </div>
        {loading ? (
          <>
            <div className="h-6 w-56 rounded bg-white/10 animate-pulse mb-1.5"></div>
            <div className="h-3 w-40 rounded bg-white/10 animate-pulse"></div>
          </>
        ) : !employee ? (
          <h1 className="text-lg sm:text-xl font-bold text-white">Employee not found</h1>
        ) : (
          <>
            <h1 className="text-lg sm:text-xl font-bold text-white">{employee.name}&apos;s Payroll</h1>
            <p className="text-xs mt-0.5" style={{ color: '#9ca0c7' }}>{employee.employeeId} · {employee.designation}</p>
          </>
        )}
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="keka-card p-5">
                <div className="h-2.5 w-20 rounded bg-gray-200 animate-pulse mb-3" style={{ background: 'var(--border-color)' }}></div>
                <div className="h-7 w-16 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-light)' }}></div>
              </div>
            ))}
          </div>
          <div className="keka-card overflow-hidden">
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                    {[...Array(7)].map((_, i) => (
                      <th key={i} className="text-left px-5 py-3"><div className="h-3 w-16 rounded" style={{ background: 'var(--border-color)' }}></div></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-3.5"><div className="h-3.5 w-16 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
                  <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" style={{ background: 'var(--border-light)' }}></div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : !employee ? (
        <div className="keka-card text-center py-16" style={{ color: 'var(--text-secondary)' }}>Employee not found</div>
      ) : (
      <>
      {payslips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="keka-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Payslips</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--primary)' }}>{payslips.length}</p>
          </div>
          <div className="keka-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Deductions</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--danger)' }}>₹{totalDeductions.toLocaleString("en-IN")}</p>
          </div>
          <div className="keka-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Paid</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>₹{totalNet.toLocaleString("en-IN")}</p>
          </div>
        </div>
      )}

      {payslips.length === 0 ? (
        <div className="keka-card text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
          </div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No payslips generated yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Payslips appear here once generated from the Payslips page</p>
        </div>
      ) : (
        <div className="keka-card overflow-hidden">
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Month</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Days</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Leave</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Gross</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Deductions</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Net Pay</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p) => {
                  const leaveDays = Math.max(0, p.totalWorkingDays - p.daysWorked);
                  return (
                    <tr key={p._id} className="transition hover:bg-[var(--bg-header)]" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{MONTHS[p.month - 1]} {p.year}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.daysWorked}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/{p.totalWorkingDays}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: leaveDays > 0 ? '#fef2f2' : '#ecfdf5', color: leaveDays > 0 ? '#dc2626' : '#059669' }}>
                          {leaveDays}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-medium" style={{ color: 'var(--text-primary)' }}>₹{p.earnedGross.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5 text-right text-sm" style={{ color: 'var(--danger)' }}>-₹{p.totalDeductions.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-bold" style={{ color: '#10b981' }}>₹{p.netSalary.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/payslips/${p._id}`} className="action-icon-btn" aria-label="View Payslip" style={{ '--tt-bg': '#e0e7ff', '--tt-fg': '#6366f1' }}>
                            <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            <span className="action-tooltip">View Payslip</span>
                          </Link>
                          <button onClick={() => downloadPdf(p._id, setDownloading)} className="action-icon-btn" aria-label="Download PDF" style={{ '--tt-bg': '#d1fae5', '--tt-fg': '#10b981' }}>
                            <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="action-tooltip">Download PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-header)', borderTop: '2px solid var(--border-color)' }}>
                  <td className="px-5 py-4 text-sm font-bold" style={{ color: 'var(--text-primary)' }} colSpan={3}>Total Paid ({payslips.length} month{payslips.length === 1 ? "" : "s"})</td>
                  <td className="px-5 py-4 text-right text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹{totalGross.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4 text-right text-sm font-bold" style={{ color: 'var(--danger)' }}>-₹{totalDeductions.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4 text-right text-sm font-bold" style={{ color: '#10b981' }}>₹{totalNet.toLocaleString("en-IN")}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {payslips.map((p) => {
              const leaveDays = Math.max(0, p.totalWorkingDays - p.daysWorked);
              return (
                <div key={p._id} className="p-4" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{MONTHS[p.month - 1]} {p.year}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium" style={{ background: leaveDays > 0 ? '#fef2f2' : '#ecfdf5', color: leaveDays > 0 ? '#dc2626' : '#059669' }}>
                      {leaveDays} leave
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center py-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                    <div><p style={{ color: 'var(--text-muted)' }}>Days</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.daysWorked}/{p.totalWorkingDays}</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>Gross</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{p.earnedGross.toLocaleString("en-IN")}</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>Net</p><p className="font-bold" style={{ color: '#10b981' }}>₹{p.netSalary.toLocaleString("en-IN")}</p></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link href={`/payslips/${p._id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#eef2ff', color: '#6366f1' }}>View</Link>
                    <button onClick={() => downloadPdf(p._id, setDownloading)} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#ecfdf5', color: '#059669' }}>Download</button>
                  </div>
                </div>
              );
            })}
            <div className="p-4" style={{ background: 'var(--bg-header)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total Paid</p>
                <p className="text-sm font-bold" style={{ color: '#10b981' }}>₹{totalNet.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

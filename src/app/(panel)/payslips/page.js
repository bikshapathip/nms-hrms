"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FullPageLoader from "@/components/FullPageLoader";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayslipsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [allPayslips, setAllPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch("/api/clients/list").then(r => r.json()).then(data => setClients(Array.isArray(data) ? data : []));
  }, []);

  function filterByClient(slips, clientId) {
    if (!clientId) return slips;
    return slips.filter(p => p.employee?.client === clientId || p.employee?.client?._id === clientId);
  }

  async function fetchPayslips() {
    setLoading(true);
    setFetched(false);
    setMessage("");
    try {
      const res = await fetch(`/api/payslips?month=${month}&year=${year}`);
      const data = await res.json();
      const slips = Array.isArray(data) ? data : [];
      setAllPayslips(slips);
      setPayslips(filterByClient(slips, selectedClient));
      setFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generatePayslips() {
    setGenerating(true);
    setMessage("");
    try {
      const res = await fetch("/api/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      setMessage(data.message || `Generated ${data.count} payslips`);
      fetchPayslips();
    } catch (err) {
      setMessage("Error generating payslips");
    } finally {
      setGenerating(false);
    }
  }

  const years = [];
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) years.push(y);

  const totalPayroll = payslips.reduce((sum, p) => sum + p.netSalary, 0);
  const totalGross = payslips.reduce((sum, p) => sum + p.earnedGross, 0);
  const totalDeductions = payslips.reduce((sum, p) => sum + p.totalDeductions, 0);

  const selectStyle = { border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-card)' };

  return (
    <div>
      {downloading && <FullPageLoader text="Downloading Payslip..." />}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Payslips</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Generate and manage monthly payslips</p>
      </div>

      {/* Controls */}
      <div className="keka-card p-4 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Month</label>
            <select value={month} onChange={(e) => { setMonth(parseInt(e.target.value)); setFetched(false); }} className="px-4 py-2.5 rounded-lg text-sm outline-none" style={selectStyle}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Year</label>
            <select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setFetched(false); }} className="px-4 py-2.5 rounded-lg text-sm outline-none" style={selectStyle}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client</label>
            <select value={selectedClient} onChange={(e) => { setSelectedClient(e.target.value); if (fetched) setPayslips(filterByClient(allPayslips, e.target.value)); }} className="px-4 py-2.5 rounded-lg text-sm outline-none" style={selectStyle}>
              <option value="">All Clients</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
            </select>
          </div>
          <button onClick={fetchPayslips} disabled={loading} className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Fetching...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Fetch Payslips</>
            )}
          </button>
          {fetched && (
            <button onClick={generatePayslips} disabled={generating} className="btn-success px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {generating ? (
                <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Generating...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Generate Payslips</>
              )}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-5" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          {message}
        </div>
      )}

      {/* Summary Cards */}
      {fetched && payslips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="keka-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Payslips</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--primary)' }}>{payslips.length}</p>
          </div>
          <div className="keka-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Gross</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#f97316' }}>₹{totalGross.toLocaleString("en-IN")}</p>
          </div>
          <div className="keka-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Net Payroll</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>₹{totalPayroll.toLocaleString("en-IN")}</p>
          </div>
        </div>
      )}

      {!fetched && !loading ? (
        <div className="keka-card text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
          </div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Select month & year, then click Fetch</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Payslip data will appear here</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5" style={{ color: 'var(--primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            <span style={{ color: 'var(--text-secondary)' }}>Loading payslips...</span>
          </div>
        </div>
      ) : payslips.length === 0 ? (
        <div className="keka-card text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
          </div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No payslips for {MONTHS[month - 1]} {year}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Update attendance first, then click &quot;Generate Payslips&quot;</p>
        </div>
      ) : (
        <div className="keka-card overflow-hidden">
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Employee</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Days</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Gross</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Deductions</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Net Salary</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p, i) => {
                const initials = (p.employee?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
                return (
                  <tr key={p._id} className="transition hover:bg-[var(--bg-header)]" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: colors[i % colors.length] }}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.employee?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.employee?.employeeId} · {p.employee?.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.daysWorked}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/{p.totalWorkingDays}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium" style={{ color: 'var(--text-primary)' }}>₹{p.earnedGross.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right text-sm" style={{ color: 'var(--danger)' }}>-₹{p.totalDeductions.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold" style={{ color: '#10b981' }}>₹{p.netSalary.toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/payslips/${p._id}`} className="p-2 rounded-lg transition hover:bg-indigo-50" title="View Payslip">
                          <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button
                          onClick={async () => {
                            setDownloading(true);
                            try {
                              const res = await fetch(`/api/payslips/${p._id}/pdf`);
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
                          className="p-2 rounded-lg transition hover:bg-green-50" title="Download PDF"
                        >
                          <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {payslips.map((p, i) => {
              const initials = (p.employee?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
              return (
                <div key={p._id} className="p-4" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: colors[i % 6] }}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.employee?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.employee?.employeeId} · {p.employee?.designation}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center py-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                    <div><p style={{ color: 'var(--text-muted)' }}>Days</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.daysWorked}/{p.totalWorkingDays}</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>Gross</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{p.earnedGross.toLocaleString("en-IN")}</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>Net</p><p className="font-bold" style={{ color: '#10b981' }}>₹{p.netSalary.toLocaleString("en-IN")}</p></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link href={`/payslips/${p._id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#eef2ff', color: '#6366f1' }}>View</Link>
                    <button onClick={async () => {
                      setDownloading(true);
                      try {
                        const res = await fetch(`/api/payslips/${p._id}/pdf`);
                        if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "payslip.pdf"; a.click(); URL.revokeObjectURL(url); }
                      } finally { setDownloading(false); }
                    }} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#ecfdf5', color: '#059669' }}>Download</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

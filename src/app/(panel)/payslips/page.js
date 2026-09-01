"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";
import SweetAlert, { showCreateConfirm, showSuccessCreate, showError, showLoading } from "@/components/common/SweetAlert";

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
  const [alertConfig, setAlertConfig] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    fetch("/api/clients/list").then(r => r.json()).then(data => setClients(Array.isArray(data) ? data : []));
  }, []);

  function uniqueValues(field, { client, state, city } = {}) {
    const pool = client ? clients.filter((c) => c._id === client) : clients;
    return [...new Set(
      pool.flatMap((c) => (c.locations || [])
        .filter((l) => (!state || l.state === state) && (!city || l.city === city))
        .map((l) => l[field])
      ).filter(Boolean)
    )];
  }

  const availableStates = uniqueValues("state", { client: selectedClient });
  const availableCities = uniqueValues("city", { client: selectedClient, state: selectedState });
  const availableLocations = uniqueValues("location", { client: selectedClient, state: selectedState, city: selectedCity });

  function applyFilters(slips, { client, state, city, location }) {
    return slips.filter((p) => {
      const emp = p.employee;
      if (client && !(emp?.client === client || emp?.client?._id === client)) return false;
      if (state && emp?.state !== state) return false;
      if (city && emp?.city !== city) return false;
      if (location && emp?.clientLocation !== location) return false;
      return true;
    });
  }

  function updateFilters(patch) {
    const next = { client: selectedClient, state: selectedState, city: selectedCity, location: selectedLocation, ...patch };
    if (patch.client !== undefined) { next.state = ""; next.city = ""; next.location = ""; setSelectedState(""); setSelectedCity(""); setSelectedLocation(""); setSelectedClient(patch.client); }
    if (patch.state !== undefined) { next.city = ""; next.location = ""; setSelectedCity(""); setSelectedLocation(""); setSelectedState(patch.state); }
    if (patch.city !== undefined) { next.location = ""; setSelectedLocation(""); setSelectedCity(patch.city); }
    if (patch.location !== undefined) { setSelectedLocation(patch.location); }
    if (fetched) setPayslips(applyFilters(allPayslips, next));
  }

  async function fetchPayslips() {
    setLoading(true);
    setFetched(false);
    try {
      const res = await fetch(`/api/payslips?month=${month}&year=${year}`);
      const data = await res.json();
      const slips = Array.isArray(data) ? data : [];
      setAllPayslips(slips);
      setPayslips(applyFilters(slips, { client: selectedClient, state: selectedState, city: selectedCity, location: selectedLocation }));
      setFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function performGenerate() {
    setGenerating(true);
    try {
      setAlertConfig(showLoading("Generating payslips..."));
      const res = await fetch("/api/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate payslips");
      setAlertConfig(showSuccessCreate(data.message || `Generated ${data.count} payslips`, () => setAlertConfig(null)));
      fetchPayslips();
    } catch (err) {
      setAlertConfig(showError(err.message || "Error generating payslips", () => setAlertConfig(null)));
    } finally {
      setGenerating(false);
    }
  }

  function generatePayslips() {
    setAlertConfig(
      showCreateConfirm(
        `Do you want to generate payslips for ${MONTHS[month - 1]} ${year}?`,
        async () => performGenerate(),
        () => setAlertConfig(null)
      )
    );
  }

  const years = [];
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) years.push(y);

  const totalPayroll = payslips.reduce((sum, p) => sum + p.netSalary, 0);
  const totalGross = payslips.reduce((sum, p) => sum + p.earnedGross, 0);
  const totalDeductions = payslips.reduce((sum, p) => sum + p.totalDeductions, 0);

  return (
    <div>
      {alertConfig && (
        <SweetAlert
          isOpen={!!alertConfig}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          variant={alertConfig.variant}
        />
      )}
      <div
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <h1 className="text-lg sm:text-xl font-bold text-white">Payslips</h1>
        <p className="text-xs mt-0.5" style={{ color: '#9ca0c7' }}>Generate and manage monthly payslips</p>
      </div>

      {/* Controls */}
      <div className="keka-card p-4 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>Month</label>
            <SearchableSelect
              className="w-36"
              clearable={false}
              value={month.toString()}
              onChange={(v) => { setMonth(parseInt(v)); setFetched(false); }}
              options={MONTHS.map((m, i) => ({ value: (i + 1).toString(), label: m }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>Year</label>
            <SearchableSelect
              className="w-24"
              clearable={false}
              value={year.toString()}
              onChange={(v) => { setYear(parseInt(v)); setFetched(false); }}
              options={years.map((y) => y.toString())}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>Client</label>
            <SearchableSelect
              className="w-40"
              value={selectedClient}
              onChange={(v) => updateFilters({ client: v })}
              options={clients.map(c => ({ value: c._id, label: c.clientName }))}
              placeholder="All Clients"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>State</label>
            <SearchableSelect
              className="w-36"
              value={selectedState}
              onChange={(v) => updateFilters({ state: v })}
              options={availableStates}
              placeholder="All States"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>City</label>
            <SearchableSelect
              className="w-36"
              value={selectedCity}
              onChange={(v) => updateFilters({ city: v })}
              options={availableCities}
              placeholder="All Cities"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>Location</label>
            <SearchableSelect
              className="w-40"
              value={selectedLocation}
              onChange={(v) => updateFilters({ location: v })}
              options={availableLocations}
              placeholder="All Locations"
            />
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
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Payroll</th>
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
                      <Link href={`/employees/${p.employee?._id}/payroll`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-indigo-50" style={{ color: 'var(--primary)' }} title="View full payroll history">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                        View History
                      </Link>
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
                  <Link href={`/employees/${p.employee?._id}/payroll`} className="block text-center py-2 mt-3 rounded-lg text-xs font-semibold" style={{ background: '#eef2ff', color: '#6366f1' }}>View Payroll History</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

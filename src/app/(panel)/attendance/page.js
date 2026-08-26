"use client";

import { useState, useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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

  function applyFilters(emps, { client, state, city, location }) {
    return emps.filter((e) => {
      if (client && !(e.client === client || e.client?._id === client)) return false;
      if (state && e.state !== state) return false;
      if (city && e.city !== city) return false;
      if (location && e.clientLocation !== location) return false;
      return true;
    });
  }

  function updateFilters(patch) {
    const next = { client: selectedClient, state: selectedState, city: selectedCity, location: selectedLocation, ...patch };
    if (patch.client !== undefined) { next.state = ""; next.city = ""; next.location = ""; setSelectedState(""); setSelectedCity(""); setSelectedLocation(""); setSelectedClient(patch.client); }
    if (patch.state !== undefined) { next.city = ""; next.location = ""; setSelectedCity(""); setSelectedLocation(""); setSelectedState(patch.state); }
    if (patch.city !== undefined) { next.location = ""; setSelectedLocation(""); setSelectedCity(patch.city); }
    if (patch.location !== undefined) { setSelectedLocation(patch.location); }
    if (fetched) setEmployees(applyFilters(allEmployees, next));
  }

  async function fetchAttendance() {
    setLoading(true);
    setFetched(false);
    setEditMode(false);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/attendance?month=${month}&year=${year}`);
      const data = await res.json();
      const emps = Array.isArray(data) ? data : [];
      setAllEmployees(emps);
      setEmployees(applyFilters(emps, { client: selectedClient, state: selectedState, city: selectedCity, location: selectedLocation }));
      setFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFieldChange(empId, field, value) {
    setEmployees((prev) =>
      prev.map((e) => e._id === empId ? { ...e, attendance: { ...e.attendance, [field]: parseInt(value) || 0 } } : e)
    );
  }

  async function saveAll() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const promises = employees.map((emp) =>
        fetch("/api/attendance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: emp._id,
            month,
            year,
            totalWorkingDays: emp.attendance.totalWorkingDays,
            daysWorked: emp.attendance.daysWorked,
            leaveDays: Math.max(0, emp.attendance.totalWorkingDays - emp.attendance.daysWorked),
            overtimeHours: emp.attendance.overtimeHours,
          }),
        })
      );
      await Promise.all(promises);
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const years = [];
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) years.push(y);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Attendance</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage monthly attendance for all employees</p>
      </div>

      {/* Month/Year Selector + Fetch */}
      <div className="keka-card p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
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
          <div className="self-end">
            <button onClick={fetchAttendance} disabled={loading} className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Fetching...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Fetch Attendance</>
              )}
            </button>
          </div>
          {fetched && (
            <div className="self-end ml-auto flex items-center gap-2">
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
              ) : (
                <>
                  <button onClick={() => setEditMode(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium transition" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Cancel</button>
                  <button onClick={saveAll} disabled={saving} className="btn-success px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                    {saving ? (
                      <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Save All</>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-5" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Attendance saved successfully for {MONTHS[month - 1]} {year}!
        </div>
      )}

      {!fetched && !loading ? (
        <div className="keka-card text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Select month & year, then click Fetch</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Attendance data will appear here</p>
        </div>
      ) : loading ? (
        <div className="keka-card overflow-hidden">
          <table className="w-full min-w-[700px]">
            <thead><tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
              <th className="text-left px-5 py-3"><div className="h-3 w-24 rounded bg-gray-200"></div></th>
              <th className="text-center px-4 py-3"><div className="h-3 w-16 rounded bg-gray-200 mx-auto"></div></th>
              <th className="text-center px-4 py-3"><div className="h-3 w-16 rounded bg-gray-200 mx-auto"></div></th>
              <th className="text-center px-4 py-3"><div className="h-3 w-14 rounded bg-gray-200 mx-auto"></div></th>
              <th className="text-center px-4 py-3"><div className="h-3 w-14 rounded bg-gray-200 mx-auto"></div></th>
            </tr></thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div><div className="space-y-1.5"><div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse"></div><div className="h-2.5 w-20 rounded bg-gray-100 animate-pulse"></div></div></div></td>
                  <td className="px-4 py-4 text-center"><div className="h-8 w-16 rounded bg-gray-200 animate-pulse mx-auto"></div></td>
                  <td className="px-4 py-4 text-center"><div className="h-8 w-16 rounded bg-gray-200 animate-pulse mx-auto"></div></td>
                  <td className="px-4 py-4 text-center"><div className="h-6 w-10 rounded bg-gray-200 animate-pulse mx-auto"></div></td>
                  <td className="px-4 py-4 text-center"><div className="h-8 w-16 rounded bg-gray-200 animate-pulse mx-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : employees.length === 0 ? (
        <div className="keka-card text-center py-20">
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No active employees found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Add employees first to update attendance</p>
        </div>
      ) : (
        <div className="keka-card overflow-hidden">
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Employee</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Working Days</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Days Worked</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Leave Days</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>OT Hours</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => {
                const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
                const avatarColor = colors[i % colors.length];
                const leaveDays = Math.max(0, emp.attendance.totalWorkingDays - emp.attendance.daysWorked);
                return (
                  <tr key={emp._id} className="transition hover:bg-[var(--bg-header)]" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>{initials}</div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{emp.employeeId} · {emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {editMode ? (
                        <input type="number" min="0" max="31" value={emp.attendance.totalWorkingDays}
                          onChange={(e) => handleFieldChange(emp._id, "totalWorkingDays", e.target.value)}
                          className="w-16 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                          style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; }}
                        />
                      ) : (
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{emp.attendance.totalWorkingDays}</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {editMode ? (
                        <input type="number" min="0" max="31" value={emp.attendance.daysWorked}
                          onChange={(e) => handleFieldChange(emp._id, "daysWorked", e.target.value)}
                          className="w-16 px-2 py-1.5 rounded-lg text-sm text-center outline-none font-semibold"
                          style={{ border: '1px solid var(--primary)', color: 'var(--text-primary)' }}
                        />
                      ) : (
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{emp.attendance.daysWorked}</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: leaveDays > 0 ? '#fef2f2' : '#ecfdf5', color: leaveDays > 0 ? '#dc2626' : '#059669' }}>
                        {leaveDays}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {editMode ? (
                        <input type="number" min="0" max="300" value={emp.attendance.overtimeHours}
                          onChange={(e) => handleFieldChange(emp._id, "overtimeHours", e.target.value)}
                          className="w-16 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                          style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; }}
                        />
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{emp.attendance.overtimeHours}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {employees.map((emp, i) => {
              const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
              const avatarColor = colors[i % colors.length];
              const leaveDays = Math.max(0, emp.attendance.totalWorkingDays - emp.attendance.daysWorked);
              return (
                <div key={emp._id} className="p-4" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{emp.employeeId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-input)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Working Days</p>
                      {editMode ? (
                        <input type="number" min="0" max="31" value={emp.attendance.totalWorkingDays}
                          onChange={(e) => handleFieldChange(emp._id, "totalWorkingDays", e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-center outline-none mt-1 font-semibold"
                          style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
                      ) : (
                        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{emp.attendance.totalWorkingDays}</p>
                      )}
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-input)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Days Worked</p>
                      {editMode ? (
                        <input type="number" min="0" max="31" value={emp.attendance.daysWorked}
                          onChange={(e) => handleFieldChange(emp._id, "daysWorked", e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-center outline-none mt-1 font-bold"
                          style={{ border: '1px solid var(--primary)', color: 'var(--text-primary)' }} />
                      ) : (
                        <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{emp.attendance.daysWorked}</p>
                      )}
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: leaveDays > 0 ? '#fef2f2' : '#ecfdf5' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Leave</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: leaveDays > 0 ? '#dc2626' : '#059669' }}>{leaveDays}</p>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-input)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>OT Hours</p>
                      {editMode ? (
                        <input type="number" min="0" max="300" value={emp.attendance.overtimeHours}
                          onChange={(e) => handleFieldChange(emp._id, "overtimeHours", e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-center outline-none mt-1"
                          style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
                      ) : (
                        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{emp.attendance.overtimeHours}</p>
                      )}
                    </div>
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

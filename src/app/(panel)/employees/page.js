"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import FullPageLoader from "@/components/FullPageLoader";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: perPage.toString(), sortField, sortOrder });
      if (search) params.set("search", search);
      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      setEmployees(data.employees || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, perPage, sortField, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  }

  const { total, totalPages } = pagination;
  const startRecord = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endRecord = perPage === 0 ? total : Math.min(page * perPage, total);

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function SortIcon({ field }) {
    const isActive = sortField === field;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-0.5">
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none">
          <path d="M1 4.5L5 1L9 4.5" stroke={isActive && sortOrder === "asc" ? "#6366f1" : "#c7c9d9"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none">
          <path d="M1 1.5L5 5L9 1.5" stroke={isActive && sortOrder === "desc" ? "#6366f1" : "#c7c9d9"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }

  // Generate page numbers to show
  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  return (
    <div>
      {downloading && <FullPageLoader text="Downloading Offer Letter..." />}
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Employees</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{total} total employees</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/employees/new" className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>
      </div>

      {total === 0 && !search && !loading ? (
        <div className="keka-card text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No employees added yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-secondary)' }}>Start by adding your first employee</p>
          <Link href="/employees/new" className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>
      ) : (
        <div className="keka-card overflow-hidden">
          {/* Search bar + Per page */}
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="relative max-w-sm flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, ID, designation, department..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'var(--bg-card)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-input)'; }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Per page:</label>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(parseInt(e.target.value)); setPage(1); }}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-input)' }}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={75}>75</option>
                <option value={100}>100</option>
                <option value={0}>All</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                    <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                    <th className="text-left px-5 py-3"><div className="h-3 w-20 rounded" style={{ background: 'var(--border-color)' }}></div></th>
                    <th className="text-left px-5 py-3"><div className="h-3 w-20 rounded" style={{ background: 'var(--border-color)' }}></div></th>
                    <th className="text-left px-5 py-3"><div className="h-3 w-20 rounded" style={{ background: 'var(--border-color)' }}></div></th>
                    <th className="text-right px-5 py-3"><div className="h-3 w-16 rounded ml-auto" style={{ background: 'var(--border-color)' }}></div></th>
                    <th className="text-center px-5 py-3"><div className="h-3 w-14 rounded mx-auto" style={{ background: 'var(--border-color)' }}></div></th>
                    <th className="text-right px-5 py-3"><div className="h-3 w-14 rounded ml-auto" style={{ background: 'var(--border-color)' }}></div></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(perPage || 10)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse"></div>
                            <div className="h-2.5 w-16 rounded bg-gray-100 animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse"></div></td>
                      <td className="px-5 py-4"><div className="h-3.5 w-20 rounded bg-gray-200 animate-pulse"></div></td>
                      <td className="px-5 py-4"><div className="h-3.5 w-16 rounded bg-gray-200 animate-pulse ml-auto"></div></td>
                      <td className="px-5 py-4"><div className="h-5 w-14 rounded-full bg-gray-200 animate-pulse mx-auto"></div></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-7 h-7 rounded bg-gray-200 animate-pulse"></div>
                          <div className="w-7 h-7 rounded bg-gray-200 animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No employees found for &quot;{search}&quot;</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("name")}>
                        <span className="inline-flex items-center">Employee<SortIcon field="name" /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("designation")}>
                        <span className="inline-flex items-center">Designation<SortIcon field="designation" /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("department")}>
                        <span className="inline-flex items-center">Department<SortIcon field="department" /></span>
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("basicSalary")}>
                        <span className="inline-flex items-center justify-end">Gross Salary<SortIcon field="basicSalary" /></span>
                      </th>
                      <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("isActive")}>
                        <span className="inline-flex items-center justify-center">Status<SortIcon field="isActive" /></span>
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => {
                      const gross = emp.basicSalary + emp.hra + emp.da + emp.specialAllowance + emp.otherAllowance;
                      const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
                      const avatarColor = colors[((page - 1) * perPage + i) % colors.length];
                      return (
                        <tr key={emp._id} className="transition" style={{ borderBottom: '1px solid var(--border-light)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>
                                {initials}
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                                <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{emp.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-on-card)' }}>{emp.designation}</td>
                          <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{emp.department || "—"}</td>
                          <td className="px-5 py-4 text-sm text-right font-medium" style={{ color: 'var(--text-primary)' }}>₹{gross.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{
                              background: emp.isActive ? '#ecfdf5' : '#fef2f2',
                              color: emp.isActive ? '#059669' : '#dc2626',
                            }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: emp.isActive ? '#10b981' : '#ef4444' }}></span>
                              {emp.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/employees/${emp._id}`} className="p-2 rounded-lg transition hover:bg-indigo-50" title="Edit">
                                <svg className="w-4 h-4" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button onClick={() => handleDelete(emp._id, emp.name)} className="p-2 rounded-lg transition hover:bg-red-50" title="Delete">
                                <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <button
                                onClick={async () => {
                                  setDownloading(true);
                                  try {
                                    const res = await fetch(`/api/employees/${emp._id}/offer-letter`);
                                    if (res.ok) {
                                      const blob = await res.blob();
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement("a");
                                      a.href = url;
                                      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "offer-letter.pdf";
                                      a.click();
                                      URL.revokeObjectURL(url);
                                    }
                                  } finally { setDownloading(false); }
                                }}
                                className="p-2 rounded-lg transition hover:bg-green-50" title="Download Offer Letter"
                              >
                                <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
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
                {employees.map((emp, i) => {
                  const gross = emp.basicSalary + emp.hra + emp.da + emp.specialAllowance + emp.otherAllowance;
                  const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
                  const avatarColor = colors[i % colors.length];
                  return (
                    <div key={emp._id} className="p-4" style={{ borderColor: 'var(--border-light)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>{initials}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{emp.employeeId}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: emp.isActive ? '#ecfdf5' : '#fef2f2', color: emp.isActive ? '#059669' : '#dc2626' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: emp.isActive ? '#10b981' : '#ef4444' }}></span>
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span style={{ color: 'var(--text-muted)' }}>Designation: </span><span style={{ color: 'var(--text-on-card)' }}>{emp.designation}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Department: </span><span style={{ color: 'var(--text-on-card)' }}>{emp.department || "—"}</span></div>
                        <div className="col-span-2"><span style={{ color: 'var(--text-muted)' }}>Gross Salary: </span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{gross.toLocaleString("en-IN")}</span></div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                        <Link href={`/employees/${emp._id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#eef2ff', color: '#6366f1' }}>Edit</Link>
                        <button onClick={() => handleDelete(emp._id, emp.name)} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#fef2f2', color: '#ef4444' }}>Delete</button>
                        <button onClick={async () => {
                          setDownloading(true);
                          try {
                            const res = await fetch(`/api/employees/${emp._id}/offer-letter`);
                            if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "offer-letter.pdf"; a.click(); URL.revokeObjectURL(url); }
                          } finally { setDownloading(false); }
                        }} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#ecfdf5', color: '#059669' }}>Offer Letter</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {perPage > 0 && totalPages > 1 && (
              <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Showing <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{startRecord}</span> to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{endRecord}</span> of <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span> employees
                </p>

                <div className="flex items-center gap-1">
                  {/* First */}
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition"
                    style={{ color: 'var(--text-secondary)' }}
                    title="First page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                  </button>

                  {/* Previous */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Prev
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers()[0] > 1 && (
                    <span className="px-1 text-xs" style={{ color: 'var(--text-muted)' }}>...</span>
                  )}
                  {getPageNumbers().map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-lg text-sm font-semibold transition"
                      style={{
                        background: p === page ? 'var(--primary)' : 'transparent',
                        color: p === page ? '#ffffff' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => { if (p !== page) e.target.style.background = 'var(--bg-card-hover)'; }}
                      onMouseLeave={(e) => { if (p !== page) e.target.style.background = 'transparent'; }}
                    >
                      {p}
                    </button>
                  ))}
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                    <span className="px-1 text-xs" style={{ color: 'var(--text-muted)' }}>...</span>
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages || totalPages === 0}
                    className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Next
                  </button>

                  {/* Last */}
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages || totalPages === 0}
                    className="p-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Last page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

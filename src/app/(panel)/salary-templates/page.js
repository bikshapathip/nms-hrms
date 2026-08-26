"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

export default function SalaryTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    fetch("/api/clients/list").then((r) => r.json()).then((d) => setClients(Array.isArray(d) ? d : []));
  }, []);

  const selectedClient = clients.find((c) => c._id === clientFilter);
  const availableStates = [...new Set((selectedClient?.locations || []).map((l) => l.state).filter(Boolean))];
  const availableCities = [...new Set((selectedClient?.locations || []).filter((l) => !stateFilter || l.state === stateFilter).map((l) => l.city).filter(Boolean))];
  const availableLocations = (selectedClient?.locations || []).filter((l) => (!stateFilter || l.state === stateFilter) && (!cityFilter || l.city === cityFilter)).map((l) => l.location).filter(Boolean);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: perPage.toString(), sortField, sortOrder });
      if (search) params.set("search", search);
      if (clientFilter) params.set("client", clientFilter);
      if (stateFilter) params.set("state", stateFilter);
      if (cityFilter) params.set("city", cityFilter);
      if (locationFilter) params.set("location", locationFilter);
      const res = await fetch(`/api/salary-templates?${params}`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, perPage, sortField, sortOrder, clientFilter, stateFilter, cityFilter, locationFilter]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/salary-templates/${id}`, { method: "DELETE" });
      if (res.ok) fetchTemplates();
    } catch (err) { console.error(err); }
  }

  function handleSort(field) {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
    setPage(1);
  }

  function SortIcon({ field }) {
    const isActive = sortField === field;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-0.5">
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none"><path d="M1 4.5L5 1L9 4.5" stroke={isActive && sortOrder === "asc" ? "#6366f1" : "#c7c9d9"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none"><path d="M1 1.5L5 5L9 1.5" stroke={isActive && sortOrder === "desc" ? "#6366f1" : "#c7c9d9"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }

  const { total, totalPages } = pagination;
  const startRecord = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endRecord = perPage === 0 ? total : Math.min(page * perPage, total);

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  const noResultsMessage = search
    ? `No salary templates found for "${search}"`
    : (clientFilter || stateFilter || cityFilter || locationFilter) ? "No templates match the selected filters" : "No salary templates added yet";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Salary Templates</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{total} total templates</p>
        </div>
        <Link href="/salary-templates/new" className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Template
        </Link>
      </div>

      <div className="keka-card">
        <div className="p-4 border-b flex items-center flex-wrap gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name, role..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
          </div>
          <SearchableSelect
            className="w-44"
            value={clientFilter}
            onChange={(v) => { setClientFilter(v); setStateFilter(""); setCityFilter(""); setLocationFilter(""); setPage(1); }}
            options={clients.map((c) => ({ value: c._id, label: c.clientName }))}
            placeholder="All Clients"
          />
          <SearchableSelect
            className="w-36"
            value={stateFilter}
            onChange={(v) => { setStateFilter(v); setCityFilter(""); setLocationFilter(""); setPage(1); }}
            options={availableStates}
            placeholder="All States"
            disabled={!clientFilter}
          />
          <SearchableSelect
            className="w-36"
            value={cityFilter}
            onChange={(v) => { setCityFilter(v); setLocationFilter(""); setPage(1); }}
            options={availableCities}
            placeholder="All Cities"
            disabled={!clientFilter}
          />
          <SearchableSelect
            className="w-40"
            value={locationFilter}
            onChange={(v) => { setLocationFilter(v); setPage(1); }}
            options={availableLocations}
            placeholder="All Locations"
            disabled={!clientFilter}
          />
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Per page:</label>
            <SearchableSelect
              className="w-24"
              value={perPage.toString()}
              onChange={(v) => { setPerPage(parseInt(v) || 0); setPage(1); }}
              options={[{ value: "10", label: "10" }, { value: "25", label: "25" }, { value: "50", label: "50" }, { value: "100", label: "100" }, { value: "0", label: "All" }]}
              placeholder="10"
            />
          </div>
        </div>

        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead><tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                {[...Array(7)].map((_, i) => <th key={i} className="text-left px-5 py-3"><div className="h-3 w-24 rounded bg-gray-200 animate-pulse"></div></th>)}
              </tr></thead>
              <tbody>
                {[...Array(perPage || 10)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse"></div></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("name")}><span className="inline-flex items-center">Template Name<SortIcon field="name" /></span></th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Client</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("role")}><span className="inline-flex items-center">Role<SortIcon field="role" /></span></th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Branch</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Gender</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("basicSalary")}><span className="inline-flex items-center justify-end">Basic Salary<SortIcon field="basicSalary" /></span></th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("isActive")}><span className="inline-flex items-center justify-center">Status<SortIcon field="isActive" /></span></th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>{noResultsMessage}</td></tr>
                  ) : templates.map((t) => (
                    <tr key={t._id} className="transition" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-on-card)' }}>{t.client?.clientName || "—"}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-on-card)' }}>{t.role}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {[t.location, t.city, t.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-on-card)' }}>{t.gender}</td>
                      <td className="px-5 py-4 text-sm font-mono text-right" style={{ color: 'var(--text-on-card)' }}>₹{Number(t.basicSalary || 0).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: t.isActive ? '#ecfdf5' : '#fef2f2', color: t.isActive ? '#059669' : '#dc2626' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.isActive ? '#10b981' : '#ef4444' }}></span>
                          {t.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/salary-templates/${t._id}`} className="p-2 rounded-lg transition hover:bg-indigo-50" title="Edit">
                            <svg className="w-4 h-4" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <button onClick={() => handleDelete(t._id, t.name)} className="p-2 rounded-lg transition hover:bg-red-50" title="Delete">
                            <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
              {templates.length === 0 ? (
                <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>{noResultsMessage}</div>
              ) : templates.map((t) => (
                <div key={t._id} className="p-4" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t.client?.clientName || "—"} · {t.role}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: t.isActive ? '#ecfdf5' : '#fef2f2', color: t.isActive ? '#059669' : '#dc2626' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.isActive ? '#10b981' : '#ef4444' }}></span>
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div><span style={{ color: 'var(--text-muted)' }}>Branch: </span><span style={{ color: 'var(--text-on-card)' }}>{[t.location, t.city, t.state].filter(Boolean).join(", ") || "—"}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Basic: </span><span className="font-mono" style={{ color: 'var(--text-on-card)' }}>₹{Number(t.basicSalary || 0).toLocaleString("en-IN")}</span></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <Link href={`/salary-templates/${t._id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#eef2ff', color: '#6366f1' }}>Edit</Link>
                    <button onClick={() => handleDelete(t._id, t.name)} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#fef2f2', color: '#ef4444' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {perPage > 0 && totalPages > 1 && (
              <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Showing <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{startRecord}</span> to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{endRecord}</span> of <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span> templates
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-100" style={{ color: 'var(--text-secondary)' }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-100" style={{ color: 'var(--text-secondary)' }}>Prev</button>
                  {getPageNumbers()[0] > 1 && <span className="px-1 text-xs" style={{ color: 'var(--text-muted)' }}>...</span>}
                  {getPageNumbers().map((p) => (
                    <button key={p} onClick={() => setPage(p)} className="w-9 h-9 rounded-lg text-sm font-semibold transition" style={{ background: p === page ? '#6366f1' : 'transparent', color: p === page ? '#fff' : 'var(--text-secondary)' }}>{p}</button>
                  ))}
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages && <span className="px-1 text-xs" style={{ color: 'var(--text-muted)' }}>...</span>}
                  <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-100" style={{ color: 'var(--text-secondary)' }}>Next</button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-100" style={{ color: 'var(--text-secondary)' }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

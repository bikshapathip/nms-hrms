"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

function uniqueValues(clients, { field, state, city }) {
  return [...new Set(
    clients.flatMap((c) => (c.locations || [])
      .filter((l) => (!state || l.state === state) && (!city || l.city === city))
      .map((l) => l[field])
    ).filter(Boolean)
  )];
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    fetch("/api/clients/list").then((r) => r.json()).then((d) => setAllClients(Array.isArray(d) ? d : []));
  }, []);

  const availableStates = uniqueValues(allClients, { field: "state" });
  const availableCities = uniqueValues(allClients, { field: "city", state: stateFilter });
  const availableLocations = uniqueValues(allClients, { field: "location", state: stateFilter, city: cityFilter });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: perPage.toString(), sortField, sortOrder });
      if (search) params.set("search", search);
      if (stateFilter) params.set("state", stateFilter);
      if (cityFilter) params.set("city", cityFilter);
      if (locationFilter) params.set("location", locationFilter);
      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, perPage, sortField, sortOrder, stateFilter, cityFilter, locationFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) fetchClients();
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
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none"><path d="M1 4.5L5 1L9 4.5" stroke={isActive && sortOrder === "asc" ? "#6366f1" : "#c7c9d9"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none"><path d="M1 1.5L5 5L9 1.5" stroke={isActive && sortOrder === "desc" ? "#6366f1" : "#c7c9d9"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Clients</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{total} total clients</p>
        </div>
        <Link href="/clients/new" className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Client
        </Link>
      </div>

      <div className="keka-card">
        <div className="p-4 border-b flex items-center flex-wrap gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name, email, GST..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
          </div>
          <SearchableSelect
            className="w-40"
            value={stateFilter}
            onChange={(v) => { setStateFilter(v); setCityFilter(""); setLocationFilter(""); setPage(1); }}
            options={availableStates}
            placeholder="All States"
          />
          <SearchableSelect
            className="w-40"
            value={cityFilter}
            onChange={(v) => { setCityFilter(v); setLocationFilter(""); setPage(1); }}
            options={availableCities}
            placeholder="All Cities"
          />
          <SearchableSelect
            className="w-44"
            value={locationFilter}
            onChange={(v) => { setLocationFilter(v); setPage(1); }}
            options={availableLocations}
            placeholder="All Locations"
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
            <table className="w-full min-w-[700px]">
              <thead><tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-5 py-3"><div className="h-3 w-28 rounded bg-gray-200 animate-pulse"></div></th>
                <th className="text-left px-5 py-3"><div className="h-3 w-32 rounded bg-gray-200 animate-pulse"></div></th>
                <th className="text-left px-5 py-3"><div className="h-3 w-20 rounded bg-gray-200 animate-pulse"></div></th>
                <th className="text-left px-5 py-3"><div className="h-3 w-28 rounded bg-gray-200 animate-pulse"></div></th>
                <th className="text-center px-5 py-3"><div className="h-3 w-14 rounded bg-gray-200 animate-pulse mx-auto"></div></th>
                <th className="text-right px-5 py-3"><div className="h-3 w-14 rounded bg-gray-200 animate-pulse ml-auto"></div></th>
              </tr></thead>
              <tbody>
                {[...Array(perPage || 10)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="px-5 py-4"><div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-3.5 w-36 rounded bg-gray-200 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-5 w-14 rounded-full bg-gray-200 animate-pulse mx-auto"></div></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><div className="w-7 h-7 rounded bg-gray-200 animate-pulse"></div><div className="w-7 h-7 rounded bg-gray-200 animate-pulse"></div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("clientName")}><span className="inline-flex items-center">Client Name<SortIcon field="clientName" /></span></th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("email")}><span className="inline-flex items-center">Email<SortIcon field="email" /></span></th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("phone")}><span className="inline-flex items-center">Phone<SortIcon field="phone" /></span></th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("gstNumber")}><span className="inline-flex items-center">GST Number<SortIcon field="gstNumber" /></span></th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Locations</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("isActive")}><span className="inline-flex items-center justify-center">Status<SortIcon field="isActive" /></span></th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
                        {search ? `No clients found for "${search}"` : (stateFilter || cityFilter || locationFilter) ? "No clients match the selected filters" : "No clients added yet"}
                      </td>
                    </tr>
                  ) : clients.map((client) => (
                    <tr key={client._id} className="transition" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{client.clientName}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-on-card)' }}>{client.email}</td>
                      <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{client.phone || "—"}</td>
                      <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-on-card)' }}>{client.gstNumber || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {client.locations?.length > 0 ? client.locations.map((loc, idx) => (
                            <span key={idx} className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{loc.location}{loc.city ? ` (${loc.city})` : ""}</span>
                          )) : <span className="text-sm" style={{ color: 'var(--text-muted)' }}>—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: client.isActive ? '#ecfdf5' : '#fef2f2', color: client.isActive ? '#059669' : '#dc2626' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: client.isActive ? '#10b981' : '#ef4444' }}></span>
                          {client.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/clients/${client._id}`} className="p-2 rounded-lg transition hover:bg-indigo-50" title="Edit">
                            <svg className="w-4 h-4" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <button onClick={() => handleDelete(client._id, client.clientName)} className="p-2 rounded-lg transition hover:bg-red-50" title="Delete">
                            <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
              {clients.length === 0 ? (
                <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
                  {search ? `No clients found for "${search}"` : (stateFilter || cityFilter || locationFilter) ? "No clients match the selected filters" : "No clients added yet"}
                </div>
              ) : clients.map((client) => (
                <div key={client._id} className="p-4" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{client.clientName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{client.email}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: client.isActive ? '#ecfdf5' : '#fef2f2', color: client.isActive ? '#059669' : '#dc2626' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: client.isActive ? '#10b981' : '#ef4444' }}></span>
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div><span style={{ color: 'var(--text-muted)' }}>Phone: </span><span style={{ color: 'var(--text-on-card)' }}>{client.phone || "—"}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>GST: </span><span className="font-mono" style={{ color: 'var(--text-on-card)' }}>{client.gstNumber || "—"}</span></div>
                  </div>
                  {client.locations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {client.locations.map((loc, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{loc.location}{loc.city ? ` (${loc.city})` : ""}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <Link href={`/clients/${client._id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#eef2ff', color: '#6366f1' }}>Edit</Link>
                    <button onClick={() => handleDelete(client._id, client.clientName)} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#fef2f2', color: '#ef4444' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {perPage > 0 && totalPages > 1 && (
              <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Showing <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{startRecord}</span> to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{endRecord}</span> of <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span> clients
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

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";
import SweetAlert, { showDeleteConfirm, showSuccessDelete, showError, showLoading } from "@/components/common/SweetAlert";
import NoResults from "@/components/common/NoResults";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [alertConfig, setAlertConfig] = useState(null);

  // Password modal state
  const [passwordModal, setPasswordModal] = useState({ open: false, userId: null, userName: "" });
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: perPage.toString(), sortField, sortOrder });
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, perPage, sortField, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function performDelete(id) {
    try {
      setAlertConfig(showLoading("Deleting user..."));
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
      setAlertConfig(showSuccessDelete("User deleted successfully!", () => setAlertConfig(null)));
    } catch (err) {
      setAlertConfig(showError(err.message || "Failed to delete user", () => setAlertConfig(null)));
    }
  }

  function handleDelete(id, name) {
    setAlertConfig(
      showDeleteConfirm(
        `Do you want to delete user "${name}"?`,
        async () => performDelete(id),
        () => setAlertConfig(null)
      )
    );
  }

  function openPasswordModal(id, name) {
    setPasswordModal({ open: true, userId: id, userName: name });
    setNewPassword("");
    setPasswordError("");
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPasswordError("");
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch(`/api/users/${passwordModal.userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPasswordError(data.error || "Failed to update password");
      } else {
        setPasswordModal({ open: false, userId: null, userName: "" });
      }
    } catch (err) {
      setPasswordError("Something went wrong");
    } finally {
      setPasswordSaving(false);
    }
  }

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
          <path d="M1 4.5L5 1L9 4.5" stroke={isActive && sortOrder === "asc" ? "var(--primary)" : "var(--text-muted)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none">
          <path d="M1 1.5L5 5L9 1.5" stroke={isActive && sortOrder === "desc" ? "var(--primary)" : "var(--text-muted)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
      {/* Header */}
      <div
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Users</h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca0c7' }}>{total} total users</p>
        </div>
        <Link href="/users/new" className="btn-primary px-4 sm:px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </Link>
      </div>

      <div className="keka-card">
        {/* Search + Per page */}
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, username, email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; }}
            />
          </div>
          <div className="flex items-center gap-2">
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
            <table className="w-full min-w-[800px]">
              <thead>
                <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                  <th className="text-left px-5 py-3"><div className="h-3 w-20 rounded bg-gray-200" style={{ background: 'var(--border-color)' }}></div></th>
                  <th className="text-left px-5 py-3"><div className="h-3 w-16 rounded bg-gray-200" style={{ background: 'var(--border-color)' }}></div></th>
                  <th className="text-left px-5 py-3"><div className="h-3 w-24 rounded bg-gray-200" style={{ background: 'var(--border-color)' }}></div></th>
                  <th className="text-left px-5 py-3"><div className="h-3 w-20 rounded bg-gray-200" style={{ background: 'var(--border-color)' }}></div></th>
                  <th className="text-center px-5 py-3"><div className="h-3 w-14 rounded bg-gray-200 mx-auto" style={{ background: 'var(--border-color)' }}></div></th>
                  <th className="text-right px-5 py-3"><div className="h-3 w-14 rounded bg-gray-200 ml-auto" style={{ background: 'var(--border-color)' }}></div></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(perPage || 10)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div><div className="space-y-2"><div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div><div className="h-2.5 w-16 rounded bg-gray-100 animate-pulse" style={{ background: 'var(--border-light)' }}></div></div></div></td>
                    <td className="px-5 py-4"><div className="h-3.5 w-20 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div></td>
                    <td className="px-5 py-4"><div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div></td>
                    <td className="px-5 py-4"><div className="h-3.5 w-20 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div></td>
                    <td className="px-5 py-4"><div className="h-5 w-14 rounded-full bg-gray-200 animate-pulse mx-auto" style={{ background: 'var(--border-color)' }}></div></td>
                    <td className="px-5 py-4"><div className="flex items-center justify-end gap-2">{[...Array(4)].map((_, k) => <div key={k} className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : users.length === 0 ? (
          <NoResults
            message={search ? `No users found for "${search}"` : "No users added yet"}
            onClear={search ? clearFilters : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("firstName")}>
                      <span className="inline-flex items-center">User<SortIcon field="firstName" /></span>
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("userType")}>
                      <span className="inline-flex items-center">User Type<SortIcon field="userType" /></span>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("username")}>
                      <span className="inline-flex items-center">Username<SortIcon field="username" /></span>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("email")}>
                      <span className="inline-flex items-center">Email<SortIcon field="email" /></span>
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition" style={{ color: 'var(--text-secondary)' }} onClick={() => handleSort("isActive")}>
                      <span className="inline-flex items-center justify-center">Status<SortIcon field="isActive" /></span>
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
                    const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
                    const avatarColor = colors[((page - 1) * perPage + i) % colors.length];
                    return (
                      <tr key={user._id} className="transition hover:bg-[var(--bg-header)]" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.phone || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {(() => {
                            const type = (user.userType || user.user_type || "RECRUITER").toUpperCase();
                            const isAdmin = type === "ADMIN";
                            return (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold" style={{
                                background: isAdmin ? 'var(--bg-input)' : '#fff7ed',
                                color: isAdmin ? 'var(--primary)' : '#ea580c',
                              }}>{isAdmin ? "Admin" : "Recruiter"}</span>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-on-card)' }}>{user.username}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium status-badge ${user.isActive ? 'is-active' : 'is-inactive'}`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: user.isActive ? '#10b981' : '#ef4444' }}></span>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/users/${user._id}/view`} className="action-icon-btn" aria-label="View" style={{ '--tt-bg': '#e0f2fe', '--tt-fg': '#0284c7' }}>
                              <svg className="w-4 h-4" style={{ color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="action-tooltip">View</span>
                            </Link>
                            <Link href={`/users/${user._id}`} className="action-icon-btn" aria-label="Edit" style={{ '--tt-bg': '#e0e7ff', '--tt-fg': '#6366f1' }}>
                              <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="action-tooltip">Edit</span>
                            </Link>
                            <button onClick={() => openPasswordModal(user._id, `${user.firstName} ${user.lastName}`)} className="action-icon-btn" aria-label="Update Password" style={{ '--tt-bg': '#fef3c7', '--tt-fg': '#b45309' }}>
                              <svg className="w-4 h-4" style={{ color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                              <span className="action-tooltip">Update Password</span>
                            </button>
                            <button onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)} className="action-icon-btn" aria-label="Delete" style={{ '--tt-bg': '#fee2e2', '--tt-fg': '#ef4444' }}>
                              <svg className="w-4 h-4" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="action-tooltip">Delete</span>
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
              {users.map((user, i) => {
                const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
                const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];
                const avatarColor = colors[i % colors.length];
                const type = (user.userType || user.user_type || "RECRUITER").toUpperCase();
                return (
                  <div key={user._id} className="p-4" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>{initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.username}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 status-badge ${user.isActive ? 'is-active' : 'is-inactive'}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: user.isActive ? '#10b981' : '#ef4444' }}></span>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span style={{ color: 'var(--text-muted)' }}>Type: </span><span className="font-semibold" style={{ color: type === 'ADMIN' ? 'var(--primary)' : '#ea580c' }}>{type === 'ADMIN' ? 'Admin' : 'Recruiter'}</span></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Email: </span><span style={{ color: 'var(--text-on-card)' }}>{user.email}</span></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Phone: </span><span style={{ color: 'var(--text-on-card)' }}>{user.phone || '—'}</span></div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                      <Link href={`/users/${user._id}/view`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#e0f2fe', color: '#0284c7' }}>View</Link>
                      <Link href={`/users/${user._id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#eef2ff', color: '#6366f1' }}>Edit</Link>
                      <button onClick={() => openPasswordModal(user._id, `${user.firstName} ${user.lastName}`)} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#fffbeb', color: '#f59e0b' }}>Password</button>
                      <button onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: '#fef2f2', color: '#ef4444' }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {perPage > 0 && totalPages > 1 && (
              <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Showing <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{startRecord}</span> to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{endRecord}</span> of <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span> users
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition hover-surface" style={{ color: 'var(--text-pagination)' }} title="First">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition hover-surface" style={{ color: 'var(--text-pagination)' }}>Prev</button>
                  {getPageNumbers()[0] > 1 && <span className="px-1 text-xs" style={{ color: 'var(--text-muted)' }}>...</span>}
                  {getPageNumbers().map((p) => (
                    <button key={p} onClick={() => setPage(p)} className="w-9 h-9 rounded-lg text-sm font-semibold transition"
                      style={{ background: p === page ? 'var(--primary)' : 'transparent', color: p === page ? '#ffffff' : 'var(--text-pagination)' }}
                      onMouseEnter={(e) => { if (p !== page) e.target.style.background = 'var(--bg-input)'; }}
                      onMouseLeave={(e) => { if (p !== page) e.target.style.background = 'transparent'; }}>{p}</button>
                  ))}
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages && <span className="px-1 text-xs" style={{ color: 'var(--text-muted)' }}>...</span>}
                  <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition hover-surface" style={{ color: 'var(--text-pagination)' }}>Next</button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition hover-surface" style={{ color: 'var(--text-pagination)' }} title="Last">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Password Update Modal */}
      {passwordModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPasswordModal({ open: false, userId: null, userName: "" })}></div>
          <div className="relative keka-card w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Update Password</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Set a new password for <strong>{passwordModal.userName}</strong></p>

            <form onSubmit={handlePasswordUpdate}>
              {passwordError && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-4" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {passwordError}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>
                  New Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; }}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button type="button" onClick={() => setPasswordModal({ open: false, userId: null, userName: "" })}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--bg-input)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                  Cancel
                </button>
                <button type="submit" disabled={passwordSaving} className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

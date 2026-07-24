"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function normalizeOptions(options) {
  return (options || []).map((o) =>
    typeof o === "object" && o !== null ? { value: String(o.value), label: String(o.label) } : { value: String(o), label: String(o) }
  );
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "— Select —",
  disabled = false,
  clearable = true,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const selected = normalized.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return normalized;
    const q = query.trim().toLowerCase();
    return normalized.filter((o) => o.label.toLowerCase().includes(q));
  }, [normalized, query]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  function selectOption(v) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  function clearValue(e) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition flex items-center justify-between gap-2 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border-color)'}`,
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          background: 'var(--bg-input)',
          boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && !disabled && clearable && (
            <span
              onClick={clearValue}
              className="p-0.5 rounded hover:bg-black/10 flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
              title="Clear"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
          )}
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg overflow-hidden shadow-lg"
          style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
        >
          <div className="p-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-input)' }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {clearable && (
              <div
                onClick={() => selectOption("")}
                className="px-3.5 py-2 text-sm cursor-pointer transition"
                style={{ color: 'var(--text-muted)', background: !value ? 'var(--bg-card-hover)' : 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = !value ? 'var(--bg-card-hover)' : 'transparent'; }}
              >
                {placeholder}
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="px-3.5 py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>No matches</div>
            ) : filtered.map((o) => (
              <div
                key={o.value}
                onClick={() => selectOption(o.value)}
                className="px-3.5 py-2 text-sm cursor-pointer transition"
                style={{ color: 'var(--text-primary)', background: o.value === value ? 'var(--bg-card-hover)' : 'transparent', fontWeight: o.value === value ? 600 : 400 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = o.value === value ? 'var(--bg-card-hover)' : 'transparent'; }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

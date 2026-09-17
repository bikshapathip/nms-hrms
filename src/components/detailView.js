"use client";

import { useTheme } from "@/components/ThemeProvider";

function svgIcon(path) {
  return function IconComponent() {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
      </svg>
    );
  };
}

export const Icon = {
  User: svgIcon("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"),
  Calendar: svgIcon("M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"),
  Phone: svgIcon("M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.657.829a11.037 11.037 0 006.105 6.105l.828-1.657a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"),
  Mail: svgIcon("M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"),
  Note: svgIcon("M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7l-5-5H8a2 2 0 00-2 2v14a2 2 0 002 2z"),
  Briefcase: svgIcon("M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a1 1 0 00-1 1v10a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1zM9 7V5h6v2"),
  Building: svgIcon("M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"),
  MapPin: svgIcon("M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"),
  Hash: svgIcon("M7 4l-2 16m10-16l-2 16M4 9h16M3 15h16"),
  File: svgIcon("M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7l-5-5H8a2 2 0 00-2 2v14a2 2 0 002 2z"),
  Flag: svgIcon("M5 3v18M5 4h11l-2 4 2 4H5"),
  Bank: svgIcon("M3 21h18M4 21V10m16 11V10M4 10l8-6 8 6M9 21v-7m6 7v-7"),
  Rupee: svgIcon("M7 4h10M7 8h10M7 4c4 0 6 1.5 6 4s-2 4-6 4h-1l7 8"),
  Percent: svgIcon("M19 5L5 19M7 8a2 2 0 100-4 2 2 0 000 4zm10 12a2 2 0 100-4 2 2 0 000 4z"),
  Shield: svgIcon("M12 3l7 3v6c0 4.418-3.134 7.632-7 9-3.866-1.368-7-4.582-7-9V6l7-3z"),
  IdCard: svgIcon("M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM7 9h2v2H7zM7 13h6M7 16h10"),
  Lock: svgIcon("M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM8 9V7a4 4 0 118 0v2"),
  Users: svgIcon("M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"),
  Tag: svgIcon("M7 7h.01M3 11V6a2 2 0 012-2h5l11 11-7 7L3 11z"),
};

export const SECTION_THEME = {
  indigo: {
    grad: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    light: { tint: "#eef2ff", fg: "#6366f1" },
    dark: { tint: "rgba(129, 140, 248, 0.16)", fg: "#a5b4fc" },
  },
  blue: {
    grad: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    light: { tint: "#e0f2fe", fg: "#0284c7" },
    dark: { tint: "rgba(56, 189, 248, 0.16)", fg: "#7dd3fc" },
  },
  teal: {
    grad: "linear-gradient(135deg, #14b8a6, #0d9488)",
    light: { tint: "#f0fdfa", fg: "#0d9488" },
    dark: { tint: "rgba(45, 212, 191, 0.16)", fg: "#5eead4" },
  },
  violet: {
    grad: "linear-gradient(135deg, #a855f7, #7c3aed)",
    light: { tint: "#f5f3ff", fg: "#7c3aed" },
    dark: { tint: "rgba(192, 132, 252, 0.16)", fg: "#c4b5fd" },
  },
  amber: {
    grad: "linear-gradient(135deg, #fbbf24, #d97706)",
    light: { tint: "#fef3c7", fg: "#d97706" },
    dark: { tint: "rgba(251, 191, 36, 0.16)", fg: "#fcd34d" },
  },
  emerald: {
    grad: "linear-gradient(135deg, #34d399, #059669)",
    light: { tint: "#ecfdf5", fg: "#059669" },
    dark: { tint: "rgba(52, 211, 153, 0.16)", fg: "#6ee7b7" },
  },
  rose: {
    grad: "linear-gradient(135deg, #fb7185, #e11d48)",
    light: { tint: "#fff1f2", fg: "#e11d48" },
    dark: { tint: "rgba(251, 113, 133, 0.16)", fg: "#fda4af" },
  },
};

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function fmtMoney(n) {
  return `₹${(n || 0).toLocaleString("en-IN")}`;
}

export function Field({ label, value, icon: IconEl }) {
  return (
    <div
      className="flex items-start gap-3 p-2.5 rounded-xl transition"
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--field-tint, var(--bg-card-hover))'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--field-tint)', color: 'var(--field-fg)' }}
      >
        {IconEl ? <IconEl /> : null}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{label}</p>
        <p className="text-sm font-semibold break-words leading-snug" style={{ color: 'var(--text-primary)' }}>{value || value === 0 ? value : "—"}</p>
      </div>
    </div>
  );
}

export function Section({ title, theme = "indigo", icon: IconEl, children }) {
  const { theme: mode } = useTheme();
  const t = SECTION_THEME[theme];
  const { grad } = t;
  const { tint, fg } = t[mode === "dark" ? "dark" : "light"];
  return (
    <div
      className="keka-card p-6 relative overflow-hidden"
      style={{ '--field-grad': grad, '--field-tint': tint, '--field-fg': fg, '--field-shadow': `${fg}40` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: grad }}></div>
      <div className="flex items-center gap-3 mb-5">
        {IconEl && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: grad, boxShadow: `0 3px 8px -1px ${fg}50` }}
          >
            <IconEl />
          </div>
        )}
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">{children}</div>
    </div>
  );
}

export function StatusBadge({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) {
  const { theme: mode } = useTheme();
  const dark = mode === "dark";
  const bg = active
    ? (dark ? "rgba(52, 211, 153, 0.16)" : "#ecfdf5")
    : (dark ? "rgba(248, 113, 113, 0.16)" : "#fef2f2");
  const fg = active
    ? (dark ? "#6ee7b7" : "#059669")
    : (dark ? "#fca5a5" : "#dc2626");
  const dot = active ? "#10b981" : "#ef4444";
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: bg, color: fg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }}></span>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function SkeletonField() {
  return (
    <div className="flex items-start gap-3 p-2.5">
      <div className="w-9 h-9 rounded-xl flex-shrink-0 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
      <div className="space-y-2 flex-1 pt-1">
        <div className="h-2.5 w-16 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
        <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-light)' }}></div>
      </div>
    </div>
  );
}

export function SkeletonSection({ title, count }) {
  return (
    <div className="keka-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex-shrink-0 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
        {[...Array(count)].map((_, i) => <SkeletonField key={i} />)}
      </div>
    </div>
  );
}

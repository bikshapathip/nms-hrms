"use client";

import { useEffect } from "react";

/**
 * Lightweight, non-blocking notification — slides in top-right, auto-dismisses.
 * Unlike SweetAlert, it never blocks interaction with the page behind it.
 */
export default function Toast({ isOpen, message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [isOpen, message, duration, onClose]);

  if (!isOpen) return null;

  const color = type === "error" ? "var(--danger)" : type === "warning" ? "var(--accent)" : "var(--success)";

  return (
    <div
      className="fixed top-5 right-5 flex items-start gap-3 rounded-xl px-4 py-3.5 max-w-sm"
      style={{
        background: "var(--bg-card)",
        boxShadow: "0 12px 32px -8px rgba(0,0,0,0.25), 0 0 0 1px var(--border-color)",
        borderLeft: `4px solid ${color}`,
        zIndex: 9999,
        animation: "toast-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}
      >
        {type === "error" ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        )}
      </div>
      <p className="text-sm font-medium flex-1 pt-0.5" style={{ color: "var(--text-on-card)" }}>{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition"
        style={{ color: "var(--text-muted)" }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

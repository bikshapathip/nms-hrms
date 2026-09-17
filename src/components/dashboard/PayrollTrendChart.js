"use client";

import { useState } from "react";

function niceCeil(n) {
  if (n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const fraction = n / base;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * base;
}

function formatCompactINR(n) {
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${+(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
}

function formatFullINR(n) {
  return `₹${(n || 0).toLocaleString("en-IN")}`;
}

/**
 * data: [{ label: "Apr", fullLabel: "April 2026", value: 123456 }, ...]
 * Single-series bar chart — no legend needed (chart title names the series).
 */
export default function PayrollTrendChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const hasData = data.some((d) => d.value > 0);
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = niceCeil(max);
  const ticks = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  return (
    <div className="keka-card p-5 mb-8">
      <div className="mb-1">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Payroll Cost Trend</h2>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Net payroll paid, last 6 months</p>
      </div>

      {!hasData ? (
        <div className="py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          No payslips generated yet — generate payslips to see the trend here.
        </div>
      ) : (
        <>
          <div className="flex mt-6" style={{ height: 180 }}>
            <div className="flex flex-col justify-between text-right pr-3 flex-shrink-0" style={{ width: 48 }}>
              {ticks.map((t) => (
                <span key={t} className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>{formatCompactINR(t)}</span>
              ))}
            </div>
            <div className="flex-1 relative">
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute left-0 right-0 border-t"
                  style={{ bottom: `${(t / niceMax) * 100}%`, borderColor: 'var(--border-light)' }}
                />
              ))}
              <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-3">
                {data.map((d, i) => {
                  const pct = Math.max((d.value / niceMax) * 100, d.value > 0 ? 2 : 0);
                  const isLast = i === data.length - 1;
                  return (
                    <div
                      key={d.label + i}
                      className="flex-1 h-full flex items-end justify-center relative cursor-default"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                      onFocus={() => setHovered(i)}
                      onBlur={() => setHovered((h) => (h === i ? null : h))}
                      tabIndex={0}
                    >
                      {hovered === i && (
                        <div
                          className="absolute -top-10 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none"
                          style={{ background: 'var(--text-primary)', color: 'var(--bg-card)', zIndex: 10, boxShadow: '0 6px 16px -4px rgba(0,0,0,0.3)' }}
                        >
                          <span className="font-semibold">{formatFullINR(d.value)}</span>
                          <span className="opacity-70"> · {d.fullLabel}</span>
                        </div>
                      )}
                      {isLast && d.value > 0 && (
                        <span
                          className="absolute text-[10px] font-semibold whitespace-nowrap"
                          style={{ color: 'var(--text-primary)', bottom: `calc(${pct}% + 6px)` }}
                        >
                          {formatCompactINR(d.value)}
                        </span>
                      )}
                      <div
                        className="rounded-t transition-colors"
                        style={{
                          height: `${pct}%`,
                          width: 22,
                          maxWidth: '60%',
                          background: hovered === i ? 'var(--primary-dark)' : 'var(--primary)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex">
            <div style={{ width: 48 }} className="flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between gap-2 sm:gap-3 mt-2">
              {data.map((d, i) => (
                <span key={i} className="flex-1 text-center text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

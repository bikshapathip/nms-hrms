"use client";

import SearchableSelect from "@/components/SearchableSelect";

const cellClass = "w-full px-2 py-1.5 rounded-md text-xs outline-none transition";
const cellStyle = { border: '1px solid var(--border-input)', color: 'var(--text-primary)' };

export default function SlabField({ label, slabs, onAdd, onRemove, onUpdate }) {
  return (
    <div className="py-3 first:pt-0" style={{ borderTop: '1px solid var(--border-color)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-on-card)' }}>{label}</span>
        <button type="button" onClick={onAdd} className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded transition hover:bg-indigo-50" style={{ color: 'var(--primary)' }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add
        </button>
      </div>
      <div className="space-y-1.5">
        {slabs.map((slab, idx) => (
          <div key={idx} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: '72px 72px 110px 1fr auto' }}>
            <input type="number" value={slab.minDays} onChange={(e) => onUpdate(idx, "minDays", e.target.value)} placeholder="Min" className={cellClass} style={cellStyle} />
            <input type="number" value={slab.maxDays} onChange={(e) => onUpdate(idx, "maxDays", e.target.value)} placeholder="Max" className={cellClass} style={cellStyle} />
            <SearchableSelect value={slab.type} onChange={(v) => onUpdate(idx, "type", v)} options={["Flat", "Percentage"]} clearable={false} />
            <input type="number" value={slab.value} onChange={(e) => onUpdate(idx, "value", e.target.value)} placeholder={slab.type === "Percentage" ? "% of Basic" : "₹ Amount"} className={cellClass} style={cellStyle} />
            {slabs.length > 1 && (
              <button type="button" onClick={() => onRemove(idx)} className="p-1.5 rounded hover:bg-red-50 flex-shrink-0" title="Remove">
                <svg className="w-3.5 h-3.5" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

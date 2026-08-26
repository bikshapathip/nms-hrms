export default function PercentToggle({ label, name, checked, percentName, percentValue, onChange, disabled }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg" style={{ border: '1px solid var(--border-color)' }}>
      <label className="flex items-center gap-3 flex-1 cursor-pointer">
        <input
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 rounded flex-shrink-0"
          style={{ accentColor: 'var(--primary)' }}
        />
        <span className="text-sm" style={{ color: 'var(--text-on-card)' }}>{label}</span>
      </label>
      <div className="relative w-20 flex-shrink-0">
        <input
          name={percentName}
          type="number"
          step="0.01"
          value={percentValue}
          onChange={onChange}
          disabled={disabled || !checked}
          className="w-full pl-2 pr-5 py-1.5 rounded text-sm text-right outline-none disabled:opacity-50"
          style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--text-muted)' }}>%</span>
      </div>
    </div>
  );
}

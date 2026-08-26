const BASIS_STYLES = {
  Basic: { background: '#eef2ff', color: '#6366f1' },
  Gross: { background: '#eff6ff', color: '#3b82f6' },
  Flat: { background: 'var(--bg-input)', color: 'var(--text-muted)' },
};

export default function BasisTag({ basis }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ml-2" style={BASIS_STYLES[basis] || BASIS_STYLES.Flat}>
      {basis}
    </span>
  );
}

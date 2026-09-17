"use client";

export default function NoResults({ message, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
        <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs font-semibold mt-2 hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

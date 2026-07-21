"use client";

export default function FullPageLoader({ text = "Loading..." }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(255,255,255,0.85)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '20px' }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#e8eaf0" strokeWidth="4" />
          <circle cx="28" cy="28" r="24" fill="none" stroke="#6366f1" strokeWidth="4"
            strokeDasharray="120" strokeDashoffset="90" strokeLinecap="round" />
        </svg>
      </div>
      <p style={{
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px', fontWeight: 600, color: '#1a1d3b',
        letterSpacing: '0.3px',
      }}>{text}</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

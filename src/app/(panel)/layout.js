"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:sticky top-0 left-0 z-50 h-screen transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 lg:hidden flex items-center gap-3 px-4 py-3" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>HRIS</span>
          </div>
        </div>

        {/* Decorative tree - right side */}
        <div className="fixed pointer-events-none" style={{ opacity: 'var(--tree-opacity, 0.15)', width: '600px', height: '100vh', right: '-150px', bottom: '-75px', zIndex: 1 }}>
          <img src="/tree.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom right' }} />
        </div>

        {/* Decorative tree-2 - left side */}
        <div className="fixed pointer-events-none" style={{ opacity: 'var(--tree-opacity, 0.15)', width: '400px', height: '85vh', left: '280px', bottom: '-115px', zIndex: 1 }}>
          <img src="/tree-2.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom left' }} />
        </div>

        {/* Decorative grass - bottom footer (on top of trees) */}
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ opacity: 'var(--tree-opacity, 0.15)', height: '150px', backgroundImage: 'url(/grass.png)', backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: 'bottom', zIndex: 2 }}>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">{children}</main>
      </div>
    </div>
  );
}

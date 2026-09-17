"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import "@/components/public.css";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader active="" />

      {/* Login Content */}
      <div className="flex-1 flex" style={{ background: '#f0f2f8', minHeight: 'calc(100vh - 72px)' }}>
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-16" style={{ background: 'linear-gradient(135deg, #ddd6fe 0%, #e0e7ff 50%, #ede9fe 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Background decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }}></div>
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(139,92,246,0.08)' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(99,102,241,0.04)' }}></div>
        
        <div className="max-w-md text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center justify-center mx-auto mb-6" style={{ width: '90px', height: '90px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 20px 40px rgba(99,102,241,0.25)' }}>
            <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ letterSpacing: '2px', color: '#312e81' }}>HRMS</h1>
          <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto' }}>
            Complete payroll management system. Manage employees, track attendance, and generate payslips effortlessly.
          </p>
          
          <div style={{ marginTop: '48px', padding: '24px 32px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div className="flex justify-center gap-10">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#4f46e5' }}>6</div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }}>Step Payroll</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(99,102,241,0.2)' }}></div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#4f46e5' }}>100%</div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }}>Accurate</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(99,102,241,0.2)' }}></div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#4f46e5' }}>24/7</div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }}>Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a1d3b' }}>HRMS</h1>
          </div>

          <div className="keka-card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold" style={{ color: '#1a1d3b' }}>Welcome back</h2>
              <p className="text-sm mt-2" style={{ color: '#6b7194' }}>Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #e0e3ed', color: '#1a1d3b' }}
                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e3ed'; e.target.style.boxShadow = 'none'; }}
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #e0e3ed', color: '#1a1d3b' }}
                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e3ed'; e.target.style.boxShadow = 'none'; }}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5"
                    style={{ color: '#6b7280' }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {!showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.24 19.5 12 19.5c.993 0 1.954-.138 2.865-.395M6.228 6.228A9.956 9.956 0 0112 4.5c4.76 0 8.774 3.162 10.066 7.5a10.478 10.478 0 01-4.135 5.411M6.228 6.228L3 3m3.228 3.228l3.65 3.65m0 0a3 3 0 004.243 4.243m-4.243-4.243l4.243 4.243M21 21l-6.772-6.772" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#9ca3af' }}>
            HRMS Payroll Management System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
      </div>

      <PublicFooter />
    </div>
  );
}

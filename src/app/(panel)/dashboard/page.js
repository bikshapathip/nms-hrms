"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PayrollTrendChart from "@/components/dashboard/PayrollTrendChart";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ employees: 0 });
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const empRes = await fetch("/api/employees?all=true");
        const employees = await empRes.json();

        const now = new Date();
        const months = [...Array(6)].map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return {
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            label: d.toLocaleString("en-US", { month: "short" }),
            fullLabel: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
          };
        });

        const monthlyPayslips = await Promise.all(
          months.map((m) => fetch(`/api/payslips?month=${m.month}&year=${m.year}`).then((r) => r.json()))
        );

        const trendData = months.map((m, i) => ({
          label: m.label,
          fullLabel: m.fullLabel,
          value: Array.isArray(monthlyPayslips[i]) ? monthlyPayslips[i].reduce((sum, p) => sum + (p.netSalary || 0), 0) : 0,
        }));
        setTrend(trendData);

        const currentMonthPayslips = monthlyPayslips[monthlyPayslips.length - 1];

        setStats({
          employees: Array.isArray(employees) ? employees.length : 0,
          activeEmployees: Array.isArray(employees) ? employees.filter((e) => e.isActive).length : 0,
          payslipsGenerated: Array.isArray(currentMonthPayslips) ? currentMonthPayslips.length : 0,
          totalPayroll: trendData[trendData.length - 1]?.value || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        {/* Welcome Banner Skeleton */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-card)' }}>
          <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse mt-3" style={{ background: 'var(--border-color)' }}></div>
          <div className="h-3.5 w-64 rounded bg-gray-200 animate-pulse mt-3" style={{ background: 'var(--border-color)' }}></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="keka-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-2.5 w-20 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
                  <div className="h-6 w-16 rounded bg-gray-200 animate-pulse mt-3" style={{ background: 'var(--border-color)' }}></div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Trend Chart Skeleton */}
        <div className="keka-card p-5 mb-8">
          <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
          <div className="h-3 w-56 rounded bg-gray-200 animate-pulse mt-2" style={{ background: 'var(--border-light)' }}></div>
          <div className="h-40 rounded bg-gray-200 animate-pulse mt-6" style={{ background: 'var(--border-light)' }}></div>
        </div>

        {/* Quick Actions Skeleton */}
        <div>
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse mb-4" style={{ background: 'var(--border-color)' }}></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="keka-card p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" style={{ background: 'var(--border-color)' }}></div>
                  <div className="flex-1">
                    <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
                    <div className="h-2.5 w-36 rounded bg-gray-200 animate-pulse mt-2" style={{ background: 'var(--border-color)' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const statCards = [
    {
      title: "Total Employees",
      value: stats.employees,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      bg: "#f0f0ff",
      href: "/employees",
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      bg: "#ecfdf5",
      href: "/employees",
    },
    {
      title: "Payslips This Month",
      value: stats.payslipsGenerated || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #f97316, #ea580c)",
      bg: "#fff7ed",
      href: "/payslips",
    },
    {
      title: "Total Payroll",
      value: `₹${(stats.totalPayroll || 0).toLocaleString("en-IN")}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #ec4899, #be185d)",
      bg: "#fdf2f8",
      href: "/payslips",
    },
  ];

  const quickActions = [
    {
      title: "Add Employee",
      desc: "Register a new employee",
      href: "/employees/new",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      iconBg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    },
    {
      title: "Update Attendance",
      desc: "Update monthly attendance",
      href: "/attendance",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: "linear-gradient(135deg, #10b981, #059669)",
    },
    {
      title: "Generate Payslips",
      desc: "Generate & share payslips",
      href: "/payslips",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
      iconBg: "linear-gradient(135deg, #f97316, #ea580c)",
    },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1d3b 0%, #2d3161 60%, #3b3f7a 100%)' }}>
        <div className="relative z-10">
          <p className="text-sm font-medium" style={{ color: '#9ca0c7' }}>{greeting},</p>
          <h1 className="text-2xl font-bold text-white mt-1">{session?.user?.name || "Admin"} 👋</h1>
          <p className="text-sm mt-2" style={{ color: '#7b7faa' }}>Here&apos;s what&apos;s happening with your payroll today.</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-10" style={{ background: '#6366f1' }}></div>
        <div className="absolute right-20 top-0 w-20 h-20 rounded-full opacity-5" style={{ background: '#a855f7' }}></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="keka-card p-5 stat-card cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: card.gradient }}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Payroll Trend */}
      <PayrollTrendChart data={trend} />

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="keka-card p-5 stat-card cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: action.iconBg }}>
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{action.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{action.desc}</p>
                  </div>
                  <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

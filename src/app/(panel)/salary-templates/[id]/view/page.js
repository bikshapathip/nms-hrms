"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon, Field, Section, StatusBadge, SkeletonSection, fmtMoney } from "@/components/detailView";

const SLAB_LABELS = [
  ["leaveEncashmentSlabs", "Leave Encashment"],
  ["attendanceBonusSlabs", "Attendance Bonus"],
  ["performanceBonusSlabs", "Performance Bonus"],
  ["specialAllowanceSlabs", "Special Allowance"],
  ["nightAllowanceSlabs", "Night Allowance"],
  ["travellingAllowanceSlabs", "Travelling Allowance"],
];

function slabSummary(slabs) {
  if (!Array.isArray(slabs) || slabs.length === 0) return "";
  return slabs
    .map((s) => `${s.minDays}-${s.maxDays}d: ${s.type === "Percentage" ? `${s.value}%` : fmtMoney(s.value)}`)
    .join(",  ");
}

export default function ViewSalaryTemplatePage() {
  const params = useParams();
  const [tpl, setTpl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/salary-templates/${params.id}`);
        if (!res.ok) throw new Error("Salary template not found");
        setTpl(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const gross = tpl ? (tpl.basicSalary || 0) + (tpl.hra || 0) + (tpl.da || 0) + (tpl.statutoryBonus || 0) + (tpl.otherAllowance || 0) : 0;

  return (
    <div>
      <div
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div>
          <div className="flex items-center gap-2 text-sm mb-1">
            <Link href="/salary-templates" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Salary Templates</Link>
            <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span style={{ color: '#9ca0c7' }}>View</span>
          </div>
          {loading ? (
            <div className="h-6 w-52 rounded bg-white/10 animate-pulse"></div>
          ) : (
            <h1 className="text-lg sm:text-xl font-bold text-white">{tpl?.name || "Salary Template"}</h1>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/salary-templates/${params.id}`} className="btn-primary px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </Link>
        </div>
      </div>

      {error ? (
        <div className="keka-card p-8 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <Link href="/salary-templates" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Back to Salary Templates</Link>
        </div>
      ) : loading ? (
        <>
          <div className="keka-card p-6 mb-5 flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse flex-shrink-0" style={{ background: 'var(--border-color)' }}></div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
              <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-light)' }}></div>
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
          </div>
          <div className="space-y-5">
            <SkeletonSection title="Template Information" count={4} />
            <SkeletonSection title="Branch" count={3} />
            <SkeletonSection title="Salary (Monthly)" count={6} />
            <SkeletonSection title="Attendance-Based Slabs" count={6} />
            <SkeletonSection title="Deductions" count={7} />
          </div>
        </>
      ) : !tpl ? (
        <div className="keka-card p-8 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Salary template not found</p>
          <Link href="/salary-templates" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Back to Salary Templates</Link>
        </div>
      ) : (
        <>
          <div className="keka-card p-6 mb-5 flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: '#6366f1' }}>
              <Icon.Tag />
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{tpl.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tpl.client?.clientName || "—"}</p>
            </div>
            <StatusBadge active={tpl.isActive} />
          </div>

          <div className="space-y-5">
            <Section title="Template Information" theme="indigo" icon={Icon.Tag}>
              <Field label="Template Name" value={tpl.name} icon={Icon.Tag} />
              <Field label="Client" value={tpl.client?.clientName} icon={Icon.Building} />
              <Field label="Role" value={tpl.role} icon={Icon.Briefcase} />
              <Field label="Gender" value={tpl.gender} icon={Icon.User} />
            </Section>

            <Section title="Branch" theme="teal" icon={Icon.MapPin}>
              <Field label="State" value={tpl.state} icon={Icon.MapPin} />
              <Field label="City" value={tpl.city} icon={Icon.MapPin} />
              <Field label="Location" value={tpl.location} icon={Icon.MapPin} />
            </Section>

            <Section title="Salary (Monthly)" theme="emerald" icon={Icon.Rupee}>
              <Field label="Basic Salary" value={fmtMoney(tpl.basicSalary)} icon={Icon.Rupee} />
              <Field label="HRA" value={fmtMoney(tpl.hra)} icon={Icon.Rupee} />
              <Field label="DA" value={fmtMoney(tpl.da)} icon={Icon.Rupee} />
              <Field label="Statutory Bonus" value={fmtMoney(tpl.statutoryBonus)} icon={Icon.Rupee} />
              <Field label="Other Allowance" value={fmtMoney(tpl.otherAllowance)} icon={Icon.Rupee} />
              <Field label="OT Rate (₹/Hour)" value={fmtMoney(tpl.otAmount)} icon={Icon.Rupee} />
              <Field label="Gross Salary" value={fmtMoney(gross)} icon={Icon.Rupee} />
            </Section>

            <Section title="Attendance-Based Slabs" theme="violet" icon={Icon.Percent}>
              {SLAB_LABELS.map(([key, label]) => (
                <Field key={key} label={label} value={slabSummary(tpl[key])} icon={Icon.Percent} />
              ))}
            </Section>

            <Section title="Deductions" theme="rose" icon={Icon.Shield}>
              <Field label="Employee PF" value={tpl.pfEnabled ? `Enabled (${tpl.pfPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="Employer PF" value={tpl.employerPfEnabled ? `Enabled (${tpl.employerPfPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="Employee ESI" value={tpl.esiEnabled ? `Enabled (${tpl.esiPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="Employer ESI" value={tpl.employerEsiEnabled ? `Enabled (${tpl.employerEsiPercent}%)` : "Disabled"} icon={Icon.Shield} />
              <Field label="Professional Tax" value={fmtMoney(tpl.professionalTax)} icon={Icon.Rupee} />
              <Field label="TDS" value={`${tpl.tdsPercent || 0}%`} icon={Icon.Percent} />
              <Field label="LWF" value={fmtMoney(tpl.lwf)} icon={Icon.Rupee} />
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

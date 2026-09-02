"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";
import BasisTag from "@/components/BasisTag";
import PercentToggle from "@/components/PercentToggle";
import SlabField from "@/components/SlabField";
import { computeSalarySummary } from "@/lib/salaryCalc";
import { SLAB_FIELDS, initSlabState, slabsToBody } from "@/lib/slabFields";
import SweetAlert, { showCreateConfirm, showSuccessCreate, showError, showLoading } from "@/components/common/SweetAlert";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";
const inputStyle = { border: '1px solid var(--border-input)', color: 'var(--text-primary)' };

function Input({ label, required, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input {...props} required={required} className={inputClass}
        style={{ ...inputStyle, border: `1px solid ${error ? '#ef4444' : 'var(--border-input)'}` }}
        onFocus={(e) => { e.target.style.borderColor = error ? '#ef4444' : 'var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#ef4444' : 'var(--border-input)'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

function Select({ label, required, name, value, onChange, options, disabled, placeholder, clearable = true }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <SearchableSelect
        value={value}
        onChange={(v) => onChange({ target: { name, value: v } })}
        options={options}
        placeholder={placeholder || `Select ${label}`}
        disabled={disabled}
        clearable={clearable}
      />
    </div>
  );
}

const EARNING_FIELDS = [
  ["basicSalary", "Basic Salary", true],
  ["hra", "HRA"],
  ["da", "DA (Dearness Allowance)"],
  ["statutoryBonus", "Statutory Bonus"],
  ["otherAllowance", "Other Allowance"],
  ["otAmount", "OT Rate (₹ per Hour)"],
];

const DEDUCTION_FIELDS = [
  ["professionalTax", "Professional Tax (₹)"],
  ["tdsPercent", "TDS (%)"],
  ["lwf", "LWF (₹)"],
];

export default function NewSalaryTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [form, setForm] = useState({
    name: "", client: "", role: "", state: "", city: "", location: "", gender: "Any",
    basicSalary: "", hra: "", da: "", statutoryBonus: "", otherAllowance: "",
    otAmount: "", professionalTax: "200", tdsPercent: "0", lwf: "",
    pfEnabled: true, pfPercent: "12", employerPfEnabled: true, employerPfPercent: "13",
    esiEnabled: false, esiPercent: "0.75", employerEsiEnabled: false, employerEsiPercent: "3.25",
  });
  const [slabs, setSlabs] = useState(initSlabState());
  const [alertConfig, setAlertConfig] = useState(null);

  function addSlab(field) { setSlabs((prev) => ({ ...prev, [field]: [...prev[field], { minDays: "", maxDays: "", type: "Flat", value: "" }] })); }
  function removeSlab(field, idx) { setSlabs((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) })); }
  function updateSlab(field, idx, key, value) { setSlabs((prev) => ({ ...prev, [field]: prev[field].map((s, i) => i === idx ? { ...s, [key]: value } : s) })); }

  useEffect(() => {
    fetch("/api/clients/list").then(r => r.json()).then(data => setClients(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    const sel = clients.find(c => c._id === form.client);
    setAvailableStates([...new Set((sel?.locations || []).map(l => l.state).filter(Boolean))]);
  }, [clients, form.client]);

  useEffect(() => {
    const sel = clients.find(c => c._id === form.client);
    setAvailableCities([...new Set((sel?.locations || []).filter(l => l.state === form.state).map(l => l.city).filter(Boolean))]);
  }, [clients, form.client, form.state]);

  useEffect(() => {
    const sel = clients.find(c => c._id === form.client);
    setAvailableLocations((sel?.locations || []).filter(l => l.state === form.state && l.city === form.city).map(l => l.location).filter(Boolean));
  }, [clients, form.client, form.state, form.city]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "client") { next.state = ""; next.city = ""; next.location = ""; }
      else if (name === "state") { next.city = ""; next.location = ""; }
      else if (name === "city") { next.location = ""; }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function submitCreate() {
    setError("");
    setErrors({});
    setSaving(true);
    try {
      setAlertConfig(showLoading("Creating template..."));
      const body = { ...form, ...slabsToBody(slabs) };
      const res = await fetch("/api/salary-templates", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors); else setError(data.error || "Failed to create salary template");
        setAlertConfig(showError(data.error || "Failed to create salary template", () => setAlertConfig(null)));
        return;
      }
      setAlertConfig(showSuccessCreate("Salary template created successfully!", () => { setAlertConfig(null); router.push("/salary-templates"); }));
    } catch (err) {
      setError(err.message);
      setAlertConfig(showError(err.message || "Failed to create salary template", () => setAlertConfig(null)));
    } finally { setSaving(false); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAlertConfig(
      showCreateConfirm(
        "Do you want to create this salary template?",
        async () => submitCreate(),
        () => setAlertConfig(null)
      )
    );
  }

  const summary = computeSalarySummary(form);

  return (
    <div>
      {alertConfig && (
        <SweetAlert
          isOpen={!!alertConfig}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          variant={alertConfig.variant}
        />
      )}
      <div
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div className="flex items-center gap-2 text-sm mb-1">
          <Link href="/salary-templates" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Salary Templates</Link>
          <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: '#9ca0c7' }}>Add New</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Add Salary Template</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-5" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Template Setup */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m-6 4h6m-6 4h4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Template Setup</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Template Name" name="name" value={form.name} onChange={handleChange} required error={errors.name} placeholder="e.g. Zomato Pick & Packer Male" />
            <Select label="Client" name="client" value={form.client} onChange={handleChange} required
              options={clients.map(c => ({ value: c._id, label: c.clientName }))} />
            <Input label="Role" name="role" value={form.role} onChange={handleChange} required error={errors.role} placeholder="e.g. Pick & Packer" />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} clearable={false} options={["Male", "Female", "Any"]} />
            <Select label="State" name="state" value={form.state} onChange={handleChange} disabled={!form.client} options={availableStates} />
            <Select label="City" name="city" value={form.city} onChange={handleChange} disabled={!form.state} options={availableCities} />
            <Select label="Location / Branch" name="location" value={form.location} onChange={handleChange} disabled={!form.city} options={availableLocations} />
          </div>
        </div>

        {/* Earnings */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fdf2f8' }}>
              <svg className="w-4 h-4" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Salary Structure (Monthly ₹)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EARNING_FIELDS.map(([name, label, required]) => (
              <Input key={name} label={label} name={name} type="number" value={form[name]} onChange={handleChange} required={required} error={errors[name]} placeholder="0" />
            ))}
          </div>
        </div>

        {/* Attendance-Based Pay Slabs */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#ecfdf5' }}>
              <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Attendance-Based Pay Slabs</h2>
          </div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Each based on days present in the month — resolved automatically at payslip time from that month&apos;s attendance.</p>
          {SLAB_FIELDS.map(([key, label]) => (
            <SlabField
              key={key}
              label={label}
              slabs={slabs[key]}
              onAdd={() => addSlab(key)}
              onRemove={(idx) => removeSlab(key, idx)}
              onUpdate={(idx, field, value) => updateSlab(key, idx, field, value)}
            />
          ))}
        </div>

        {/* Deductions */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fef2f2' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Deductions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEDUCTION_FIELDS.map(([name, label]) => (
              <Input key={name} label={label} name={name} type="number" step={name === "tdsPercent" ? "0.1" : undefined} value={form[name]} onChange={handleChange} placeholder="0" />
            ))}
            <PercentToggle label="Employee PF" name="pfEnabled" checked={form.pfEnabled} percentName="pfPercent" percentValue={form.pfPercent} onChange={handleChange} />
            <PercentToggle label="Employer PF" name="employerPfEnabled" checked={form.employerPfEnabled} percentName="employerPfPercent" percentValue={form.employerPfPercent} onChange={handleChange} />
            <PercentToggle label="Employee ESI" name="esiEnabled" checked={form.esiEnabled} percentName="esiPercent" percentValue={form.esiPercent} onChange={handleChange} />
            <PercentToggle label="Employer ESI" name="employerEsiEnabled" checked={form.employerEsiEnabled} percentName="employerEsiPercent" percentValue={form.employerEsiPercent} onChange={handleChange} />
          </div>
        </div>

        {/* Summary */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
              <svg className="w-4 h-4" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m-6 4h6m-6 4h4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Summary</h2>
          </div>
          <div className="max-w-md space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Basic Salary</span>
              <span style={{ color: 'var(--text-primary)' }}>₹{(Number(form.basicSalary) || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gross Earnings</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{summary.grossEarnings.toLocaleString("en-IN")}</span>
            </div>
            {form.pfEnabled && (
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>PF ({form.pfPercent || 0}%)<BasisTag basis="Basic" /></span>
                <span style={{ color: 'var(--danger)' }}>− ₹{summary.pfAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {form.esiEnabled && (
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>ESI ({form.esiPercent || 0}%)<BasisTag basis="Gross" /></span>
                <span style={{ color: 'var(--danger)' }}>− ₹{summary.esiAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {summary.professionalTax > 0 && (
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Professional Tax<BasisTag basis="Flat" /></span>
                <span style={{ color: 'var(--danger)' }}>− ₹{summary.professionalTax.toLocaleString("en-IN")}</span>
              </div>
            )}
            {summary.tdsAmount > 0 && (
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>TDS ({form.tdsPercent || 0}%)<BasisTag basis="Gross" /></span>
                <span style={{ color: 'var(--danger)' }}>− ₹{summary.tdsAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {summary.lwf > 0 && (
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>LWF<BasisTag basis="Flat" /></span>
                <span style={{ color: 'var(--danger)' }}>− ₹{summary.lwf.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Deductions</span>
              <span className="font-semibold" style={{ color: 'var(--danger)' }}>− ₹{summary.totalDeductions.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-base" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Net Salary</span>
              <span className="font-bold" style={{ color: '#059669' }}>₹{summary.netSalary.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            {saving ? (<><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</>) : "Save Template"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-semibold transition" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-input)', boxShadow: 'var(--card-shadow)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

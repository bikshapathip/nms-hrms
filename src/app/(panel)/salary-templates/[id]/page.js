"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";
import BasisTag from "@/components/BasisTag";
import PercentToggle from "@/components/PercentToggle";
import SlabField from "@/components/SlabField";
import { computeSalarySummary } from "@/lib/salaryCalc";
import { SLAB_FIELDS, initSlabState, slabsFromDoc, slabsToBody } from "@/lib/slabFields";
import SweetAlert, { showUpdateConfirm, showSuccessUpdate, showError, showLoading } from "@/components/common/SweetAlert";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";
const inputStyle = { border: '1px solid var(--border-input)', color: 'var(--text-primary)' };

function Input({ label, required, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
      <input {...props} required={required} className={inputClass}
        style={{ ...inputStyle, border: `1px solid ${error ? '#ef4444' : 'var(--border-input)'}` }}
        onFocus={(e) => { e.target.style.borderColor = error ? '#ef4444' : 'var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#ef4444' : 'var(--border-input)'; }} />
      {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}
function Select({ label, required, name, value, onChange, options, disabled, clearable = true }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
      <SearchableSelect
        value={value}
        onChange={(v) => onChange({ target: { name, value: v } })}
        options={options}
        placeholder="Select"
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

export default function EditSalaryTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
    isActive: true,
  });
  const [slabs, setSlabs] = useState(initSlabState());
  const [alertConfig, setAlertConfig] = useState(null);

  function addSlab(field) { setSlabs((prev) => ({ ...prev, [field]: [...prev[field], { minDays: "", maxDays: "", type: "Flat", value: "" }] })); }
  function removeSlab(field, idx) { setSlabs((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) })); }
  function updateSlab(field, idx, key, value) { setSlabs((prev) => ({ ...prev, [field]: prev[field].map((s, i) => i === idx ? { ...s, [key]: value } : s) })); }

  useEffect(() => { fetch("/api/clients/list").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : [])); }, []);

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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/salary-templates/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const d = await res.json();
        const cId = d.client?._id || d.client || "";
        setForm({
          name: d.name || "", client: cId, role: d.role || "", state: d.state || "", city: d.city || "", location: d.location || "",
          gender: d.gender || "Any",
          basicSalary: d.basicSalary?.toString() || "", hra: d.hra?.toString() || "", da: d.da?.toString() || "",
          statutoryBonus: d.statutoryBonus?.toString() || "",
          otherAllowance: d.otherAllowance?.toString() || "",
          otAmount: d.otAmount?.toString() || "", professionalTax: d.professionalTax?.toString() || "200",
          tdsPercent: d.tdsPercent?.toString() || "0", lwf: d.lwf?.toString() || "",
          pfEnabled: d.pfEnabled ?? true, pfPercent: (d.pfPercent ?? 12).toString(),
          employerPfEnabled: d.employerPfEnabled ?? true, employerPfPercent: (d.employerPfPercent ?? 13).toString(),
          esiEnabled: d.esiEnabled ?? false, esiPercent: (d.esiPercent ?? 0.75).toString(),
          employerEsiEnabled: d.employerEsiEnabled ?? false, employerEsiPercent: (d.employerEsiPercent ?? 3.25).toString(),
          isActive: d.isActive ?? true,
        });
        setSlabs(slabsFromDoc(d));
      } catch (e) { setError(e.message); } finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(p => {
      const next = { ...p, [name]: type === "checkbox" ? checked : value };
      if (name === "client") { next.state = ""; next.city = ""; next.location = ""; }
      else if (name === "state") { next.city = ""; next.location = ""; }
      else if (name === "city") { next.location = ""; }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function submitUpdate() {
    setError(""); setErrors({}); setSaving(true);
    try {
      setAlertConfig(showLoading("Updating template..."));
      const body = { ...form, ...slabsToBody(slabs) };
      const res = await fetch(`/api/salary-templates/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) {
        if (d.errors) setErrors(d.errors); else setError(d.error || "Failed");
        setAlertConfig(showError(d.error || "Failed to update template", () => setAlertConfig(null)));
        return;
      }
      setAlertConfig(showSuccessUpdate("Template updated successfully!", () => { setAlertConfig(null); router.push("/salary-templates"); }));
    } catch (e) {
      setError(e.message);
      setAlertConfig(showError(e.message || "Failed to update template", () => setAlertConfig(null)));
    } finally { setSaving(false); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAlertConfig(
      showUpdateConfirm(
        "Do you want to update this salary template?",
        async () => submitUpdate(),
        () => setAlertConfig(null)
      )
    );
  }

  if (loading) return <div className="flex items-center justify-center h-64"><svg className="animate-spin h-5 w-5" style={{ color: 'var(--primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>;

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
          <span style={{ color: '#9ca0c7' }}>Edit</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Edit Salary Template</h1>
      </div>

      {error && <div className="p-3 rounded-lg text-sm mb-5" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="keka-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Template Setup</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: 'var(--primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-on-card)' }}>Active</span>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Template Name" name="name" value={form.name} onChange={handleChange} required error={errors.name} placeholder="e.g. Zomato Pick & Packer Male" />
            <Select label="Client" name="client" value={form.client} onChange={handleChange} required options={clients.map(c => ({ value: c._id, label: c.clientName }))} />
            <Input label="Role" name="role" value={form.role} onChange={handleChange} required error={errors.role} placeholder="e.g. Pick & Packer" />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} clearable={false} options={["Male", "Female", "Any"]} />
            <Select label="State" name="state" value={form.state} onChange={handleChange} disabled={!form.client} options={availableStates} />
            <Select label="City" name="city" value={form.city} onChange={handleChange} disabled={!form.state} options={availableCities} />
            <Select label="Location / Branch" name="location" value={form.location} onChange={handleChange} disabled={!form.city} options={availableLocations} />
          </div>
        </div>

        <div className="keka-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Salary Structure (Monthly ₹)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EARNING_FIELDS.map(([name, label, required]) => (
              <Input key={name} label={label} name={name} type="number" value={form[name]} onChange={handleChange} required={required} error={errors[name]} placeholder="0" />
            ))}
          </div>
        </div>

        <div className="keka-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-primary)' }}>Attendance-Based Pay Slabs</h2>
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

        <div className="keka-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Deductions</h2>
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
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Summary</h2>
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

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">{saving ? "Updating..." : "Update Template"}</button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-semibold transition" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-input)', boxShadow: 'var(--card-shadow)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

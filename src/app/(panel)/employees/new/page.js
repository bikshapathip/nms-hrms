"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";
import BasisTag from "@/components/BasisTag";
import PercentToggle from "@/components/PercentToggle";
import SlabField from "@/components/SlabField";
import { computeSalarySummary } from "@/lib/salaryCalc";
import { SLAB_FIELDS, initSlabState, slabsFromDoc, slabsToBody } from "@/lib/slabFields";
import SweetAlert, { showCreateConfirm, showSuccessCreate, showError, showLoading } from "@/components/common/SweetAlert";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";
const inputStyle = { border: '1px solid var(--border-input)', color: 'var(--text-primary)' };

function Input({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input {...props} required={required} className={inputClass} style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; }}
      />
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

const TEMPLATE_FIELDS = [
  ...EARNING_FIELDS.map(([name]) => name),
  "professionalTax", "tdsPercent", "lwf",
  "pfEnabled", "pfPercent", "employerPfEnabled", "employerPfPercent",
  "esiEnabled", "esiPercent", "employerEsiEnabled", "employerEsiPercent",
];

export default function NewEmployeePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [salaryTemplates, setSalaryTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", gender: "Male",
    dateOfBirth: "", contactNumber: "", email: "", designation: "",
    client: "", state: "", city: "", clientLocation: "", dateOfJoining: "",
    address: "", addressCity: "", addressState: "", addressZipCode: "", maritalStatus: "Single",
    referenceUser: "", remarks: "",
    panNumber: "", aadharNumber: "", esicNumber: "", uanNumber: "",
    bankName: "", bankAccount: "", ifscCode: "",
    salaryTemplate: "",
    basicSalary: "", hra: "", da: "", statutoryBonus: "", otherAllowance: "",
    otAmount: "",
    pfEnabled: true, pfPercent: "12", employerPfEnabled: true, employerPfPercent: "13",
    esiEnabled: false, esiPercent: "0.75", employerEsiEnabled: false, employerEsiPercent: "3.25",
    professionalTax: "200", tdsPercent: "0", lwf: "",
    workingStatus: "Active",
  });
  const [slabs, setSlabs] = useState(initSlabState());
  const [alertConfig, setAlertConfig] = useState(null);

  function addSlab(field) { setSlabs((prev) => ({ ...prev, [field]: [...prev[field], { minDays: "", maxDays: "", type: "Flat", value: "" }] })); }
  function removeSlab(field, idx) { setSlabs((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) })); }
  function updateSlab(field, idx, key, value) { setSlabs((prev) => ({ ...prev, [field]: prev[field].map((s, i) => i === idx ? { ...s, [key]: value } : s) })); }

  useEffect(() => {
    fetch("/api/clients/list").then(r => r.json()).then(data => setClients(Array.isArray(data) ? data : []));
    fetch("/api/users/list").then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (session?.user?.userType === "Recruiter" && session.user.id) {
      setForm((prev) => (prev.referenceUser ? prev : { ...prev, referenceUser: session.user.id }));
    }
  }, [session]);

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

  // Once client + branch (state/city/location) are picked, fetch matching salary templates
  useEffect(() => {
    if (!form.client || !form.clientLocation) {
      setSalaryTemplates([]);
      return;
    }
    setLoadingTemplates(true);
    const params = new URLSearchParams({ client: form.client, limit: "0" });
    if (form.state) params.set("state", form.state);
    if (form.city) params.set("city", form.city);
    if (form.clientLocation) params.set("location", form.clientLocation);
    fetch(`/api/salary-templates?${params}`)
      .then(r => r.json())
      .then(data => {
        const templates = data.templates || [];
        const matched = templates.filter(t => t.gender === "Any" || t.gender === form.gender);
        setSalaryTemplates(matched);
      })
      .catch(() => setSalaryTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, [form.client, form.state, form.city, form.clientLocation, form.gender]);

  // Clear the selected template if it no longer matches the available list
  useEffect(() => {
    if (form.salaryTemplate && !salaryTemplates.some(t => t._id === form.salaryTemplate)) {
      setForm((prev) => ({ ...prev, salaryTemplate: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaryTemplates]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "client") { next.state = ""; next.city = ""; next.clientLocation = ""; next.salaryTemplate = ""; }
      else if (name === "state") { next.city = ""; next.clientLocation = ""; next.salaryTemplate = ""; }
      else if (name === "city") { next.clientLocation = ""; next.salaryTemplate = ""; }
      else if (name === "clientLocation") { next.salaryTemplate = ""; }
      return next;
    });
  }

  function handleTemplateChange(e) {
    const id = e.target.value;
    if (!id) { setForm((prev) => ({ ...prev, salaryTemplate: "" })); return; }
    const t = salaryTemplates.find((tpl) => tpl._id === id);
    if (!t) return;
    setForm((prev) => {
      const next = { ...prev, salaryTemplate: id };
      for (const field of TEMPLATE_FIELDS) {
        next[field] = typeof t[field] === "boolean" ? t[field] : (t[field] ?? 0).toString();
      }
      return next;
    });
    setSlabs(slabsFromDoc(t));
  }

  async function submitCreate() {
    setError("");
    setSaving(true);
    try {
      setAlertConfig(showLoading("Creating employee..."));
      const body = {
        ...form,
        client: form.client || null,
        referenceUser: form.referenceUser || null,
        salaryTemplate: form.salaryTemplate || null,
        basicSalary: Number(form.basicSalary) || 0, hra: Number(form.hra) || 0,
        da: Number(form.da) || 0, statutoryBonus: Number(form.statutoryBonus) || 0,
        otherAllowance: Number(form.otherAllowance) || 0, otAmount: Number(form.otAmount) || 0,
        professionalTax: Number(form.professionalTax) || 0, tdsPercent: Number(form.tdsPercent) || 0,
        lwf: Number(form.lwf) || 0,
        pfPercent: Number(form.pfPercent) || 0, employerPfPercent: Number(form.employerPfPercent) || 0,
        esiPercent: Number(form.esiPercent) || 0, employerEsiPercent: Number(form.employerEsiPercent) || 0,
        ...slabsToBody(slabs),
      };
      const res = await fetch("/api/employees", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to create employee"); }
      setAlertConfig(showSuccessCreate("Employee created successfully!", () => { setAlertConfig(null); router.push("/employees"); }));
    } catch (err) {
      setError(err.message);
      setAlertConfig(showError(err.message || "Failed to create employee", () => setAlertConfig(null)));
    } finally { setSaving(false); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAlertConfig(
      showCreateConfirm(
        "Do you want to add this new employee?",
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
          <Link href="/employees" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Employees</Link>
          <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: '#9ca0c7' }}>Add New</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Add New Employee</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-5" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Information */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} required placeholder="EMP001" />
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="e.g. John" />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="e.g. Doe" />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} required clearable={false}
              options={["Male", "Female", "Other"]} />
            <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            <Input label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="10 digit" maxLength={10} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="employee@email.com" />
            <Select label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} clearable={false}
              options={["Single", "Married", "Divorced", "Widowed"]} />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} placeholder="House no., street" />
            <Input label="City" name="addressCity" value={form.addressCity} onChange={handleChange} placeholder="e.g. Hyderabad" />
            <Input label="State" name="addressState" value={form.addressState} onChange={handleChange} placeholder="e.g. Telangana" />
            <Input label="Zip Code" name="addressZipCode" value={form.addressZipCode} onChange={handleChange} placeholder="6 digit" maxLength={6} />
          </div>
        </div>

        {/* Client, Branch & Salary Template */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f0f0ff' }}>
              <svg className="w-4 h-4" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Client, Branch &amp; Salary Template</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Client" name="client" value={form.client} onChange={handleChange}
              options={clients.map(c => ({ value: c._id, label: c.clientName }))} />
            <Select label="State" name="state" value={form.state} onChange={handleChange} disabled={!form.client}
              options={availableStates} />
            <Select label="City" name="city" value={form.city} onChange={handleChange} disabled={!form.state}
              options={availableCities} />
            <Select label="Location" name="clientLocation" value={form.clientLocation} onChange={handleChange} disabled={!form.city}
              options={availableLocations} />
            <div className="sm:col-span-2 lg:col-span-4">
              <Select
                label="Salary Template"
                name="salaryTemplate"
                value={form.salaryTemplate}
                onChange={handleTemplateChange}
                disabled={!form.clientLocation || loadingTemplates}
                placeholder={loadingTemplates ? "Loading templates..." : (form.clientLocation ? "Select a matching template" : "Select client & branch first")}
                options={salaryTemplates.map(t => ({ value: t._id, label: `${t.name} (${t.role} · ${t.gender})` }))}
              />
              {form.clientLocation && !loadingTemplates && salaryTemplates.length === 0 && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>No salary template found for this branch — enter the salary structure manually below.</p>
              )}
              {form.salaryTemplate && (
                <p className="text-xs mt-1.5" style={{ color: '#059669' }}>Salary structure below has been auto-filled from the selected template. You can still adjust it.</p>
              )}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fff7ed' }}>
              <svg className="w-4 h-4" style={{ color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Employment Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} required placeholder="e.g. Pick & Packer" />
            <Input label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} required />
            <Select label="Reference Name (Recruiter)" name="referenceUser" value={form.referenceUser} onChange={handleChange}
              disabled={session?.user?.userType === "Recruiter"}
              options={users.map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName} (${u.userType})` }))} />
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>Remarks</label>
              <input name="remarks" value={form.remarks} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="Any additional notes"
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; }}
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#ecfdf5' }}>
              <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Documents & ID</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="PAN Number" name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" />
            <Input label="Aadhar Number" name="aadharNumber" value={form.aadharNumber} onChange={handleChange} placeholder="1234 5678 9012" maxLength={12} />
            <Input label="ESIC Number" name="esicNumber" value={form.esicNumber} onChange={handleChange} placeholder="e.g. 3412345678" />
            <Input label="UAN Number" name="uanNumber" value={form.uanNumber} onChange={handleChange} placeholder="12 digit UAN" />
          </div>
        </div>

        {/* Bank Details */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
              <svg className="w-4 h-4" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Bank Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. State Bank of India" />
            <Input label="Account Number" name="bankAccount" value={form.bankAccount} onChange={handleChange} placeholder="Bank account number" />
            <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="SBIN0001234" />
          </div>
        </div>

        {/* Salary Structure */}
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fdf2f8' }}>
              <svg className="w-4 h-4" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Salary Structure (Monthly ₹)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EARNING_FIELDS.map(([name, label, required]) => (
              <Input key={name} label={label} name={name} type="number" value={form[name]} onChange={handleChange} required={required} placeholder="0" />
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
            <Input label="Professional Tax (₹)" name="professionalTax" type="number" value={form.professionalTax} onChange={handleChange} placeholder="0" />
            <Input label="TDS (%)" name="tdsPercent" type="number" step="0.1" value={form.tdsPercent} onChange={handleChange} placeholder="0" />
            <Input label="LWF (₹)" name="lwf" type="number" value={form.lwf} onChange={handleChange} placeholder="0" />
            <div />
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
            {saving ? (<><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</>) : "Save Employee"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium transition" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";
const inputStyle = { border: '1px solid var(--border-color)', color: 'var(--text-primary)' };

function Input({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input {...props} required={required} className={inputClass} style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function Select({ label, required, name, value, onChange, options, disabled, placeholder, clearable = true }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <SearchableSelect
        value={value}
        onChange={(v) => onChange({ target: { name, value: v } })}
        options={options}
        placeholder={placeholder || `— Select ${label} —`}
        disabled={disabled}
        clearable={clearable}
      />
    </div>
  );
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", gender: "Male",
    dateOfBirth: "", contactNumber: "", email: "", designation: "", department: "",
    client: "", state: "", city: "", clientLocation: "", dateOfJoining: "",
    address: "", maritalStatus: "Single",
    nthEmployee: "", referenceName: "", remarks: "",
    panNumber: "", aadharNumber: "", esicNumber: "", uanNumber: "",
    bankName: "", bankAccount: "", ifscCode: "",
    basicSalary: "", hra: "", da: "", specialAllowance: "", otherAllowance: "",
    pfEnabled: true, esiEnabled: false, professionalTax: "200", tdsPercent: "0",
    workingStatus: "Active",
  });

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
      if (name === "client") { next.state = ""; next.city = ""; next.clientLocation = ""; }
      else if (name === "state") { next.city = ""; next.clientLocation = ""; }
      else if (name === "city") { next.clientLocation = ""; }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        ...form,
        client: form.client || null,
        basicSalary: Number(form.basicSalary) || 0, hra: Number(form.hra) || 0,
        da: Number(form.da) || 0, specialAllowance: Number(form.specialAllowance) || 0,
        otherAllowance: Number(form.otherAllowance) || 0,
        professionalTax: Number(form.professionalTax) || 0, tdsPercent: Number(form.tdsPercent) || 0,
      };
      const res = await fetch("/api/employees", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to create employee"); }
      router.push("/employees");
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/employees" style={{ color: 'var(--primary)' }} className="font-medium hover:underline">Employees</Link>
        <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span style={{ color: 'var(--text-secondary)' }}>Add New</span>
      </div>

      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Add New Employee</h1>

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
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} required clearable={false}
              options={["Male", "Female", "Other"]} />
            <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            <Input label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="10 digit" maxLength={10} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="employee@email.com" />
            <Select label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} clearable={false}
              options={["Single", "Married", "Divorced", "Widowed"]} />
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address</label>
              <input name="address" value={form.address} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="Full address"
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
              />
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
            <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} required />
            <Input label="Department" name="department" value={form.department} onChange={handleChange} />
            <Input label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} required />
            <Select label="Working Status" name="workingStatus" value={form.workingStatus} onChange={handleChange} clearable={false}
              options={["Active", "Inactive", "Terminated", "Resigned", "On Leave"]} />
            <Select label="Client" name="client" value={form.client} onChange={handleChange}
              options={clients.map(c => ({ value: c._id, label: c.clientName }))} />
            <Select label="State" name="state" value={form.state} onChange={handleChange} disabled={!form.client}
              options={availableStates} />
            <Select label="City" name="city" value={form.city} onChange={handleChange} disabled={!form.state}
              options={availableCities} />
            <Select label="Location" name="clientLocation" value={form.clientLocation} onChange={handleChange} disabled={!form.city}
              options={availableLocations} />
            <Input label="NTH" name="nthEmployee" value={form.nthEmployee} onChange={handleChange} placeholder="e.g. 5th employee" />
            <Input label="Reference Name (Recruiter)" name="referenceName" value={form.referenceName} onChange={handleChange} />
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Remarks</label>
              <input name="remarks" value={form.remarks} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="Any additional notes"
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
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
            <Input label="ESIC Number" name="esicNumber" value={form.esicNumber} onChange={handleChange} />
            <Input label="UAN Number" name="uanNumber" value={form.uanNumber} onChange={handleChange} />
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
            <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} />
            <Input label="Account Number" name="bankAccount" value={form.bankAccount} onChange={handleChange} />
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
            <Input label="Basic Salary" name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} required />
            <Input label="HRA" name="hra" type="number" value={form.hra} onChange={handleChange} />
            <Input label="DA (Dearness Allowance)" name="da" type="number" value={form.da} onChange={handleChange} />
            <Input label="Special Allowance" name="specialAllowance" type="number" value={form.specialAllowance} onChange={handleChange} />
            <Input label="Other Allowance" name="otherAllowance" type="number" value={form.otherAllowance} onChange={handleChange} />
          </div>
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
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer" style={{ border: '1px solid var(--border-color)' }}>
              <input name="pfEnabled" type="checkbox" checked={form.pfEnabled} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: 'var(--primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-on-card)' }}>PF (12% of Basic)</span>
            </label>
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer" style={{ border: '1px solid var(--border-color)' }}>
              <input name="esiEnabled" type="checkbox" checked={form.esiEnabled} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: 'var(--primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-on-card)' }}>ESI (0.75%)</span>
            </label>
            <Input label="Professional Tax (₹)" name="professionalTax" type="number" value={form.professionalTax} onChange={handleChange} />
            <Input label="TDS (%)" name="tdsPercent" type="number" step="0.1" value={form.tdsPercent} onChange={handleChange} />
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

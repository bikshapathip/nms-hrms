"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";
const inputStyle = { border: '1px solid var(--border-color)', color: 'var(--text-primary)' };

function Input({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
      <input {...props} required={required} className={inputClass} style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }} />
    </div>
  );
}
function Select({ label, required, name, value, onChange, options, disabled, clearable = true }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
      <SearchableSelect
        value={value}
        onChange={(v) => onChange({ target: { name, value: v } })}
        options={options}
        placeholder="— Select —"
        disabled={disabled}
        clearable={clearable}
      />
    </div>
  );
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", gender: "Male", dateOfBirth: "", contactNumber: "", email: "",
    designation: "", department: "", client: "", clientLocation: "", dateOfJoining: "",
    city: "", state: "", address: "", maritalStatus: "Single", nthEmployee: "", referenceName: "", remarks: "",
    panNumber: "", aadharNumber: "", esicNumber: "", uanNumber: "",
    bankName: "", bankAccount: "", ifscCode: "",
    basicSalary: "", hra: "", da: "", specialAllowance: "", otherAllowance: "",
    pfEnabled: true, esiEnabled: false, professionalTax: "200", tdsPercent: "0",
    workingStatus: "Active", isActive: true,
  });

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
        const res = await fetch(`/api/employees/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const d = await res.json();
        const cId = d.client?._id || d.client || "";
        setForm({ employeeId: d.employeeId||"", firstName: d.firstName||"", lastName: d.lastName||"", gender: d.gender||"Male",
          dateOfBirth: d.dateOfBirth?d.dateOfBirth.split("T")[0]:"", contactNumber: d.contactNumber||"", email: d.email||"",
          designation: d.designation||"", department: d.department||"", client: cId, clientLocation: d.clientLocation||"",
          dateOfJoining: d.dateOfJoining?d.dateOfJoining.split("T")[0]:"", city: d.city||"", state: d.state||"", address: d.address||"",
          maritalStatus: d.maritalStatus||"Single", nthEmployee: d.nthEmployee||"", referenceName: d.referenceName||"", remarks: d.remarks||"",
          panNumber: d.panNumber||"", aadharNumber: d.aadharNumber||"", esicNumber: d.esicNumber||"", uanNumber: d.uanNumber||"",
          bankName: d.bankName||"", bankAccount: d.bankAccount||"", ifscCode: d.ifscCode||"",
          basicSalary: d.basicSalary?.toString()||"", hra: d.hra?.toString()||"", da: d.da?.toString()||"",
          specialAllowance: d.specialAllowance?.toString()||"", otherAllowance: d.otherAllowance?.toString()||"",
          pfEnabled: d.pfEnabled??true, esiEnabled: d.esiEnabled??false,
          professionalTax: d.professionalTax?.toString()||"200", tdsPercent: d.tdsPercent?.toString()||"0",
          workingStatus: d.workingStatus||"Active", isActive: d.isActive??true,
        });
      } catch (e) { setError(e.message); } finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(p => {
      const next = { ...p, [name]: type === "checkbox" ? checked : value };
      if (name === "client") { next.state = ""; next.city = ""; next.clientLocation = ""; }
      else if (name === "state") { next.city = ""; next.clientLocation = ""; }
      else if (name === "city") { next.clientLocation = ""; }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const body = { ...form, client: form.client||null, basicSalary:Number(form.basicSalary)||0, hra:Number(form.hra)||0, da:Number(form.da)||0, specialAllowance:Number(form.specialAllowance)||0, otherAllowance:Number(form.otherAllowance)||0, professionalTax:Number(form.professionalTax)||0, tdsPercent:Number(form.tdsPercent)||0 };
      const res = await fetch(`/api/employees/${params.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (!res.ok) { const d=await res.json(); throw new Error(d.error||"Failed"); }
      router.push("/employees");
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><svg className="animate-spin h-5 w-5" style={{color:'var(--primary)'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-6"><Link href="/employees" style={{color:'var(--primary)'}} className="font-medium hover:underline">Employees</Link><svg className="w-4 h-4" style={{color:'var(--text-muted)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg><span style={{color:'var(--text-secondary)'}}>Edit</span></div>
      <h1 className="text-xl font-bold mb-6" style={{color:'var(--text-primary)'}}>Edit Employee</h1>
      {error && <div className="p-3 rounded-lg text-sm mb-5" style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} required />
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} clearable={false} options={["Male", "Female", "Other"]} />
            <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            <Input label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} maxLength={10} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <Select label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} clearable={false} options={["Single", "Married", "Divorced", "Widowed"]} />
            <div className="lg:col-span-4"><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:'var(--text-secondary)'}}>Address</label><input name="address" value={form.address} onChange={handleChange} className={inputClass} style={inputStyle}/></div>
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Employment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} required />
            <Input label="Department" name="department" value={form.department} onChange={handleChange} />
            <Input label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} required />
            <Select label="Working Status" name="workingStatus" value={form.workingStatus} onChange={handleChange} clearable={false} options={["Active", "Inactive", "Terminated", "Resigned", "On Leave"]} />
            <Select label="Client" name="client" value={form.client} onChange={handleChange} options={clients.map(c => ({ value: c._id, label: c.clientName }))} />
            <Select label="State" name="state" value={form.state} onChange={handleChange} disabled={!form.client} options={availableStates} />
            <Select label="City" name="city" value={form.city} onChange={handleChange} disabled={!form.state} options={availableCities} />
            <Select label="Location" name="clientLocation" value={form.clientLocation} onChange={handleChange} disabled={!form.city} options={availableLocations} />
            <Input label="NTH" name="nthEmployee" value={form.nthEmployee} onChange={handleChange} />
            <Input label="Reference Name" name="referenceName" value={form.referenceName} onChange={handleChange} />
            <div className="lg:col-span-4"><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:'var(--text-secondary)'}}>Remarks</label><input name="remarks" value={form.remarks} onChange={handleChange} className={inputClass} style={inputStyle}/></div>
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer" style={{border:'1px solid var(--border-color)'}}><input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded" style={{accentColor:'var(--primary)'}}/><span className="text-sm" style={{color:'var(--text-on-card)'}}>Active</span></label>
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="PAN" name="panNumber" value={form.panNumber} onChange={handleChange} />
            <Input label="Aadhar" name="aadharNumber" value={form.aadharNumber} onChange={handleChange} maxLength={12} />
            <Input label="ESIC" name="esicNumber" value={form.esicNumber} onChange={handleChange} />
            <Input label="UAN" name="uanNumber" value={form.uanNumber} onChange={handleChange} />
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Bank Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} />
            <Input label="Account No." name="bankAccount" value={form.bankAccount} onChange={handleChange} />
            <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleChange} />
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Salary (Monthly ₹)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Basic" name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} required />
            <Input label="HRA" name="hra" type="number" value={form.hra} onChange={handleChange} />
            <Input label="DA" name="da" type="number" value={form.da} onChange={handleChange} />
            <Input label="Special Allowance" name="specialAllowance" type="number" value={form.specialAllowance} onChange={handleChange} />
            <Input label="Other Allowance" name="otherAllowance" type="number" value={form.otherAllowance} onChange={handleChange} />
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Deductions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer" style={{border:'1px solid var(--border-color)'}}><input name="pfEnabled" type="checkbox" checked={form.pfEnabled} onChange={handleChange} className="w-4 h-4 rounded" style={{accentColor:'var(--primary)'}}/><span className="text-sm" style={{color:'var(--text-on-card)'}}>PF (12%)</span></label>
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer" style={{border:'1px solid var(--border-color)'}}><input name="esiEnabled" type="checkbox" checked={form.esiEnabled} onChange={handleChange} className="w-4 h-4 rounded" style={{accentColor:'var(--primary)'}}/><span className="text-sm" style={{color:'var(--text-on-card)'}}>ESI (0.75%)</span></label>
            <Input label="Prof. Tax (₹)" name="professionalTax" type="number" value={form.professionalTax} onChange={handleChange} />
            <Input label="TDS (%)" name="tdsPercent" type="number" step="0.1" value={form.tdsPercent} onChange={handleChange} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">{saving?"Updating...":"Update Employee"}</button>
          <button type="button" onClick={()=>router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium" style={{color:'var(--text-secondary)',border:'1px solid var(--border-color)'}}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

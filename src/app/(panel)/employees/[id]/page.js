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

function Input({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
      <input {...props} required={required} className={inputClass} style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; }} />
    </div>
  );
}
function Select({ label, required, name, value, onChange, options, disabled, placeholder, clearable = true }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
      <SearchableSelect
        value={value}
        onChange={(v) => onChange({ target: { name, value: v } })}
        options={options}
        placeholder={placeholder || "Select"}
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

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [salaryTemplates, setSalaryTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", gender: "Male", dateOfBirth: "", contactNumber: "", email: "",
    designation: "", client: "", clientLocation: "", dateOfJoining: "",
    city: "", state: "", address: "", addressCity: "", addressState: "", addressZipCode: "", maritalStatus: "Single", referenceUser: "", remarks: "",
    panNumber: "", aadharNumber: "", esicNumber: "", uanNumber: "",
    bankName: "", bankAccount: "", ifscCode: "",
    salaryTemplate: "",
    basicSalary: "", hra: "", da: "", statutoryBonus: "", otherAllowance: "",
    otAmount: "",
    pfEnabled: true, pfPercent: "12", employerPfEnabled: true, employerPfPercent: "13",
    esiEnabled: false, esiPercent: "0.75", employerEsiEnabled: false, employerEsiPercent: "3.25",
    professionalTax: "200", tdsPercent: "0", lwf: "",
    workingStatus: "Active", isActive: true,
  });
  const [slabs, setSlabs] = useState(initSlabState());
  const [alertConfig, setAlertConfig] = useState(null);

  function addSlab(field) { setSlabs((prev) => ({ ...prev, [field]: [...prev[field], { minDays: "", maxDays: "", type: "Flat", value: "" }] })); }
  function removeSlab(field, idx) { setSlabs((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) })); }
  function updateSlab(field, idx, key, value) { setSlabs((prev) => ({ ...prev, [field]: prev[field].map((s, i) => i === idx ? { ...s, [key]: value } : s) })); }

  useEffect(() => { fetch("/api/clients/list").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : [])); }, []);
  useEffect(() => { fetch("/api/users/list").then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])); }, []);

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
    const params2 = new URLSearchParams({ client: form.client, limit: "0" });
    if (form.state) params2.set("state", form.state);
    if (form.city) params2.set("city", form.city);
    if (form.clientLocation) params2.set("location", form.clientLocation);
    fetch(`/api/salary-templates?${params2}`)
      .then(r => r.json())
      .then(data => {
        const templates = data.templates || [];
        const matched = templates.filter(t => t.gender === "Any" || t.gender === form.gender);
        setSalaryTemplates(matched);
      })
      .catch(() => setSalaryTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, [form.client, form.state, form.city, form.clientLocation, form.gender]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/employees/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const d = await res.json();
        const cId = d.client?._id || d.client || "";
        const refId = d.referenceUser?._id || d.referenceUser || "";
        const templateId = d.salaryTemplate?._id || d.salaryTemplate || "";
        setForm({ employeeId: d.employeeId||"", firstName: d.firstName||"", lastName: d.lastName||"", gender: d.gender||"Male",
          dateOfBirth: d.dateOfBirth?d.dateOfBirth.split("T")[0]:"", contactNumber: d.contactNumber||"", email: d.email||"",
          designation: d.designation||"", client: cId, clientLocation: d.clientLocation||"",
          dateOfJoining: d.dateOfJoining?d.dateOfJoining.split("T")[0]:"", city: d.city||"", state: d.state||"", address: d.address||"",
          addressCity: d.addressCity||"", addressState: d.addressState||"", addressZipCode: d.addressZipCode||"",
          maritalStatus: d.maritalStatus||"Single", referenceUser: refId, remarks: d.remarks||"",
          panNumber: d.panNumber||"", aadharNumber: d.aadharNumber||"", esicNumber: d.esicNumber||"", uanNumber: d.uanNumber||"",
          bankName: d.bankName||"", bankAccount: d.bankAccount||"", ifscCode: d.ifscCode||"",
          salaryTemplate: templateId,
          basicSalary: d.basicSalary?.toString()||"", hra: d.hra?.toString()||"", da: d.da?.toString()||"",
          statutoryBonus: d.statutoryBonus?.toString()||"",
          otherAllowance: d.otherAllowance?.toString()||"",
          otAmount: d.otAmount?.toString()||"",
          pfEnabled: d.pfEnabled??true, pfPercent: (d.pfPercent ?? 12).toString(),
          employerPfEnabled: d.employerPfEnabled??true, employerPfPercent: (d.employerPfPercent ?? 13).toString(),
          esiEnabled: d.esiEnabled??false, esiPercent: (d.esiPercent ?? 0.75).toString(),
          employerEsiEnabled: d.employerEsiEnabled??false, employerEsiPercent: (d.employerEsiPercent ?? 3.25).toString(),
          professionalTax: d.professionalTax?.toString()||"200", tdsPercent: d.tdsPercent?.toString()||"0",
          lwf: d.lwf?.toString()||"",
          workingStatus: d.workingStatus||"Active", isActive: d.isActive??true,
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
      if (name === "client") { next.state = ""; next.city = ""; next.clientLocation = ""; }
      else if (name === "state") { next.city = ""; next.clientLocation = ""; }
      else if (name === "city") { next.clientLocation = ""; }
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

  async function submitUpdate() {
    setError(""); setSaving(true);
    try {
      setAlertConfig(showLoading("Updating employee..."));
      const body = { ...form, client: form.client||null, referenceUser: form.referenceUser||null, salaryTemplate: form.salaryTemplate||null,
        basicSalary:Number(form.basicSalary)||0, hra:Number(form.hra)||0, da:Number(form.da)||0,
        statutoryBonus:Number(form.statutoryBonus)||0,
        otherAllowance:Number(form.otherAllowance)||0,
        otAmount:Number(form.otAmount)||0,
        professionalTax:Number(form.professionalTax)||0, tdsPercent:Number(form.tdsPercent)||0, lwf:Number(form.lwf)||0,
        pfPercent:Number(form.pfPercent)||0, employerPfPercent:Number(form.employerPfPercent)||0,
        esiPercent:Number(form.esiPercent)||0, employerEsiPercent:Number(form.employerEsiPercent)||0,
        ...slabsToBody(slabs) };
      const res = await fetch(`/api/employees/${params.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (!res.ok) { const d=await res.json(); throw new Error(d.error||"Failed"); }
      setAlertConfig(showSuccessUpdate("Employee updated successfully!", () => { setAlertConfig(null); router.push("/employees"); }));
    } catch (e) {
      setError(e.message);
      setAlertConfig(showError(e.message || "Failed to update employee", () => setAlertConfig(null)));
    } finally { setSaving(false); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAlertConfig(
      showUpdateConfirm(
        "Do you want to update this employee's details?",
        async () => submitUpdate(),
        () => setAlertConfig(null)
      )
    );
  }

  if (loading) return <div className="flex items-center justify-center h-64"><svg className="animate-spin h-5 w-5" style={{color:'var(--primary)'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>;

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
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div>
          <div className="flex items-center gap-2 text-sm mb-1"><Link href="/employees" style={{color:'#9ca0c7'}} className="font-medium hover:underline">Employees</Link><svg className="w-4 h-4" style={{color:'#9ca0c7'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg><span style={{color:'#9ca0c7'}}>Edit</span></div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Edit Employee</h1>
        </div>
        <Link href={`/employees/${params.id}/payroll`} className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition bg-white/10 hover:bg-white/20 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
          View Payroll
        </Link>
      </div>
      {error && <div className="p-3 rounded-lg text-sm mb-5" style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} required />
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="e.g. John" />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="e.g. Doe" />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} clearable={false} options={["Male", "Female", "Other"]} />
            <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            <Input label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="10 digit" maxLength={10} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="employee@email.com" />
            <Select label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} clearable={false} options={["Single", "Married", "Divorced", "Widowed"]} />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} placeholder="House no., street" />
            <Input label="City" name="addressCity" value={form.addressCity} onChange={handleChange} placeholder="e.g. Hyderabad" />
            <Input label="State" name="addressState" value={form.addressState} onChange={handleChange} placeholder="e.g. Telangana" />
            <Input label="Zip Code" name="addressZipCode" value={form.addressZipCode} onChange={handleChange} placeholder="6 digit" maxLength={6} />
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Client, Branch &amp; Salary Template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Client" name="client" value={form.client} onChange={handleChange} options={clients.map(c => ({ value: c._id, label: c.clientName }))} />
            <Select label="State" name="state" value={form.state} onChange={handleChange} disabled={!form.client} options={availableStates} />
            <Select label="City" name="city" value={form.city} onChange={handleChange} disabled={!form.state} options={availableCities} />
            <Select label="Location" name="clientLocation" value={form.clientLocation} onChange={handleChange} disabled={!form.city} options={availableLocations} />
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
              {form.salaryTemplate && (
                <p className="text-xs mt-1.5" style={{ color: '#059669' }}>Selecting a template overwrites the salary structure below.</p>
              )}
            </div>
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Employment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} required placeholder="e.g. Pick & Packer" />
            <Input label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} required />
            <Select label="Working Status" name="workingStatus" value={form.workingStatus} onChange={handleChange} clearable={false} options={["Active", "Inactive", "Terminated", "Resigned", "On Leave"]} />
            <Select label="Reference Name (Recruiter)" name="referenceUser" value={form.referenceUser} onChange={handleChange}
              options={users.map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName} (${u.userType})` }))} />
            <div className="lg:col-span-4"><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:'var(--text-secondary)'}}>Remarks</label><input name="remarks" value={form.remarks} onChange={handleChange} className={inputClass} style={inputStyle}/></div>
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer" style={{border:'1px solid var(--border-color)'}}><input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded" style={{accentColor:'var(--primary)'}}/><span className="text-sm" style={{color:'var(--text-on-card)'}}>Active</span></label>
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="PAN" name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" />
            <Input label="Aadhar" name="aadharNumber" value={form.aadharNumber} onChange={handleChange} placeholder="1234 5678 9012" maxLength={12} />
            <Input label="ESIC" name="esicNumber" value={form.esicNumber} onChange={handleChange} placeholder="e.g. 3412345678" />
            <Input label="UAN" name="uanNumber" value={form.uanNumber} onChange={handleChange} placeholder="12 digit UAN" />
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Bank Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. State Bank of India" />
            <Input label="Account No." name="bankAccount" value={form.bankAccount} onChange={handleChange} placeholder="Bank account number" />
            <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="SBIN0001234" />
          </div>
        </div>

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Salary (Monthly ₹)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EARNING_FIELDS.map(([name, label, required]) => (
              <Input key={name} label={label} name={name} type="number" value={form[name]} onChange={handleChange} required={required} placeholder="0" />
            ))}
          </div>
        </div>

        <div className="keka-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={{color:'var(--text-primary)'}}>Attendance-Based Pay Slabs</h2>
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

        <div className="keka-card p-6"><h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-primary)'}}>Deductions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Prof. Tax (₹)" name="professionalTax" type="number" value={form.professionalTax} onChange={handleChange} placeholder="0" />
            <Input label="TDS (%)" name="tdsPercent" type="number" step="0.1" value={form.tdsPercent} onChange={handleChange} placeholder="0" />
            <Input label="LWF (₹)" name="lwf" type="number" value={form.lwf} onChange={handleChange} placeholder="0" />
            <div />
            <PercentToggle label="Employee PF" name="pfEnabled" checked={form.pfEnabled} percentName="pfPercent" percentValue={form.pfPercent} onChange={handleChange} />
            <PercentToggle label="Employer PF" name="employerPfEnabled" checked={form.employerPfEnabled} percentName="employerPfPercent" percentValue={form.employerPfPercent} onChange={handleChange} />
            <PercentToggle label="Employee ESI" name="esiEnabled" checked={form.esiEnabled} percentName="esiPercent" percentValue={form.esiPercent} onChange={handleChange} />
            <PercentToggle label="Employer ESI" name="employerEsiEnabled" checked={form.employerEsiEnabled} percentName="employerEsiPercent" percentValue={form.employerEsiPercent} onChange={handleChange} />
          </div>
        </div>

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
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">{saving?"Updating...":"Update Employee"}</button>
          <button type="button" onClick={()=>router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium" style={{color:'var(--text-secondary)',border:'1px solid var(--border-color)'}}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

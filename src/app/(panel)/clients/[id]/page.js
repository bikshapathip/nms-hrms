"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";

function Input({ label, required, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input {...props} required={required} className={inputClass}
        style={{ border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`, color: 'var(--text-primary)', background: 'var(--bg-input)' }}
        onFocus={(e) => { e.target.style.borderColor = error ? '#ef4444' : '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#ef4444' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ clientName: "", email: "", phone: "", gstNumber: "", cinNumber: "", address: "", isActive: true });
  const [locations, setLocations] = useState([""]);

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${params.id}`);
        if (!res.ok) throw new Error("Client not found");
        const data = await res.json();
        setForm({
          clientName: data.clientName || "", email: data.email || "",
          phone: data.phone || "", gstNumber: data.gstNumber || "",
          cinNumber: data.cinNumber || "", address: data.address || "",
          isActive: data.isActive ?? true,
        });
        setLocations(data.locations?.length > 0 ? data.locations : [""]);
      } catch (err) { setErrors({ general: err.message }); }
      finally { setLoading(false); }
    }
    fetchClient();
  }, [params.id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function addLocation() { setLocations([...locations, ""]); }
  function removeLocation(idx) { setLocations(locations.filter((_, i) => i !== idx)); }
  function updateLocation(idx, value) { setLocations(locations.map((l, i) => i === idx ? value : l)); }

  function validate() {
    const errs = {};
    if (!form.clientName.trim()) errs.clientName = "Client name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) errs.phone = "Must be 10 digits";
    if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.toUpperCase())) {
      errs.gstNumber = "Invalid GST format";
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true); setErrors({});
    try {
      const res = await fetch(`/api/clients/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, locations: locations.filter(l => l.trim()) }) });
      const data = await res.json();
      if (!res.ok) { if (data.errors) setErrors(data.errors); else setErrors({ general: data.error }); return; }
      router.push("/clients");
    } catch (err) { setErrors({ general: "Something went wrong" }); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" style={{ color: '#6366f1' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <span style={{ color: 'var(--text-secondary)' }}>Loading client...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/clients" style={{ color: '#6366f1' }} className="font-medium hover:underline">Clients</Link>
        <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span style={{ color: 'var(--text-secondary)' }}>Edit Client</span>
      </div>

      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Edit Client</h1>

      {errors.general && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-5" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="keka-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f0f0ff' }}>
              <svg className="w-4 h-4" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Client Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Client Name" name="clientName" value={form.clientName} onChange={handleChange} required error={errors.clientName} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required error={errors.email} />
            <Input label="Contact No." name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="10 digit number" maxLength={10} />
            <Input label="GST Number" name="gstNumber" value={form.gstNumber} onChange={handleChange} error={errors.gstNumber} placeholder="29ABCDE1234F1Z5" />
            <Input label="CIN Number" name="cinNumber" value={form.cinNumber} onChange={handleChange} placeholder="U12345MH2020PTC123456" />
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Full company address" className={inputClass}
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-input)' }} />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer" style={{ border: '1px solid var(--border-color)' }}>
                <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: '#6366f1' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-on-card)' }}>Active Client</span>
              </label>
            </div>
          </div>

          {/* Locations */}
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Locations / Branches</label>
              <button type="button" onClick={addLocation} className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition hover:bg-indigo-50" style={{ color: '#6366f1' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Location
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locations.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={loc}
                    onChange={(e) => updateLocation(idx, e.target.value)}
                    placeholder={`Location ${idx + 1}`}
                    className={inputClass}
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-input)' }}
                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
                  />
                  {locations.length > 1 && (
                    <button type="button" onClick={() => removeLocation(idx)} className="p-2 rounded-lg hover:bg-red-50 flex-shrink-0" title="Remove">
                      <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            {saving ? (<><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Updating...</>) : "Update Client"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium transition" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

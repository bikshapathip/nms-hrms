"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { INDIAN_STATES } from "@/lib/indianStates";
import SearchableSelect from "@/components/SearchableSelect";
import SweetAlert, { showUpdateConfirm, showSuccessUpdate, showError, showLoading } from "@/components/common/SweetAlert";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";

function Input({ label, required, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input {...props} required={required} className={inputClass}
        style={{ border: `1px solid ${error ? '#ef4444' : 'var(--border-input)'}`, color: 'var(--text-primary)' }}
        onFocus={(e) => { e.target.style.borderColor = error ? '#ef4444' : '#6366f1'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#ef4444' : 'var(--border-input)'; }}
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
  const [form, setForm] = useState({ clientName: "", email: "", phone: "", gstNumber: "", cinNumber: "", isActive: true });
  const emptyLocation = { state: "", city: "", location: "", address: "" };
  const [locations, setLocations] = useState([{ ...emptyLocation }]);
  const [alertConfig, setAlertConfig] = useState(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${params.id}`);
        if (!res.ok) throw new Error("Client not found");
        const data = await res.json();
        setForm({
          clientName: data.clientName || "", email: data.email || "",
          phone: data.phone || "", gstNumber: data.gstNumber || "",
          cinNumber: data.cinNumber || "",
          isActive: data.isActive ?? true,
        });
        const normalized = (data.locations || []).map((l) =>
          typeof l === "string" ? { state: "", city: "", location: l, address: "" } : { state: l.state || "", city: l.city || "", location: l.location || "", address: l.address || "" }
        );
        setLocations(normalized.length > 0 ? normalized : [{ ...emptyLocation }]);
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

  function addLocation() { setLocations([...locations, { ...emptyLocation }]); }
  function removeLocation(idx) { setLocations(locations.filter((_, i) => i !== idx)); }
  function updateLocation(idx, field, value) { setLocations(locations.map((l, i) => i === idx ? { ...l, [field]: value } : l)); }

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

  async function submitUpdate() {
    setSaving(true); setErrors({});
    try {
      setAlertConfig(showLoading("Updating client..."));
      const res = await fetch(`/api/clients/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, locations: locations.filter(l => l.location.trim()) }) });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors); else setErrors({ general: data.error });
        setAlertConfig(showError(data.error || "Failed to update client", () => setAlertConfig(null)));
        return;
      }
      setAlertConfig(showSuccessUpdate("Client updated successfully!", () => { setAlertConfig(null); router.push("/clients"); }));
    } catch (err) {
      setErrors({ general: "Something went wrong" });
      setAlertConfig(showError("Something went wrong", () => setAlertConfig(null)));
    }
    finally { setSaving(false); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setAlertConfig(
      showUpdateConfirm(
        "Do you want to update this client's details?",
        async () => submitUpdate(),
        () => setAlertConfig(null)
      )
    );
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
          <Link href="/clients" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Clients</Link>
          <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: '#9ca0c7' }}>Edit Client</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Edit Client</h1>
      </div>

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
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>Status</label>
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
            <div className="space-y-3">
              {locations.map((loc, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-2 items-start">
                  <SearchableSelect
                    value={loc.state}
                    onChange={(v) => updateLocation(idx, "state", v)}
                    options={INDIAN_STATES}
                    placeholder="State"
                  />
                  <input
                    value={loc.city}
                    onChange={(e) => updateLocation(idx, "city", e.target.value)}
                    placeholder="City"
                    className={inputClass}
                    style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                  <input
                    value={loc.location}
                    onChange={(e) => updateLocation(idx, "location", e.target.value)}
                    placeholder="Location (e.g. Madhapur Branch)"
                    className={inputClass}
                    style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                  <input
                    value={loc.address}
                    onChange={(e) => updateLocation(idx, "address", e.target.value)}
                    placeholder="Branch address"
                    className={inputClass}
                    style={{ border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
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
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-semibold transition" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-input)', boxShadow: 'var(--card-shadow)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";
import SweetAlert, { showCreateConfirm, showSuccessCreate, showError, showLoading } from "@/components/common/SweetAlert";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition";
const inputStyle = { border: '1px solid var(--border-input)', color: 'var(--text-primary)' };
const passwordRules = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!passwordRules.uppercase.test(password)) return "Password must contain at least one uppercase letter";
  if (!passwordRules.lowercase.test(password)) return "Password must contain at least one lowercase letter";
  if (!passwordRules.number.test(password)) return "Password must contain at least one number";
  if (!passwordRules.special.test(password)) return "Password must contain at least one special character";
  return "";
}

function PasswordVisibilityToggle({ visible, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-y-0 right-0 flex items-center px-3"
      style={{ color: 'var(--text-secondary)' }}
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      title={visible ? `Hide ${label}` : `Show ${label}`}
    >
      {!visible ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.24 19.5 12 19.5c.993 0 1.954-.138 2.865-.395M6.228 6.228A9.956 9.956 0 0112 4.5c4.76 0 8.774 3.162 10.066 7.5a10.478 10.478 0 01-4.135 5.411M6.228 6.228L3 3m3.228 3.228l3.65 3.65m0 0a3 3 0 004.243 4.243m-4.243-4.243l4.243 4.243M21 21l-6.772-6.772" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}

function MatchStatusIcon({ matched }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L14.32 3.78L17.23 3.53L18.37 6.22L21.09 7.31L20.84 10.22L22.62 12L20.84 13.78L21.09 16.69L18.37 17.78L17.23 20.47L14.32 20.22L12 22L9.68 20.22L6.77 20.47L5.63 17.78L2.91 16.69L3.16 13.78L1.38 12L3.16 10.22L2.91 7.31L5.63 6.22L6.77 3.53L9.68 3.78L12 2Z" fill={matched ? 'var(--success)' : 'var(--danger)'} />
      <path d={matched ? "M8 12.4l2.5 2.5L16 9.4" : "M9 9l6 6m0-6l-6 6"} stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Input({ label, required, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input
        {...props}
        required={required}
        className={inputClass}
        style={{ ...inputStyle, borderColor: error ? 'var(--danger)' : 'var(--border-input)' }}
        onFocus={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-input)'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    userType: "Recruiter", firstName: "", lastName: "", username: "", email: "",
    phone: "", password: "", confirmPassword: "",
  });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordBlurred, setConfirmPasswordBlurred] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setPasswordTouched(true);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    else if (form.username.length < 3) errs.username = "Min 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = "Only letters, numbers, underscores";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) errs.phone = "Must be 10 digits";
    const passwordError = validatePassword(form.password);
    if (passwordError) errs.password = passwordError;
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  }

  const passwordChecks = {
    minLength: form.password.length >= 8,
    uppercase: passwordRules.uppercase.test(form.password),
    lowercase: passwordRules.lowercase.test(form.password),
    number: passwordRules.number.test(form.password),
    special: passwordRules.special.test(form.password),
  };
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordPolicySatisfied = Object.values(passwordChecks).every(Boolean);
  const missingPasswordRequirements = [
    !passwordChecks.minLength ? "8+ chars" : null,
    !passwordChecks.uppercase ? "uppercase (A-Z)" : null,
    !passwordChecks.lowercase ? "lowercase (a-z)" : null,
    !passwordChecks.number ? "number (0-9)" : null,
    !passwordChecks.special ? "symbol" : null,
  ].filter(Boolean);
  const passwordStrength = passwordScore <= 2
    ? { label: "Weak", color: "#ef4444" }
    : passwordScore === 3
      ? { label: "So-so", color: "#f59e0b" }
      : passwordScore === 4
        ? { label: "Good", color: "#3b82f6" }
        : { label: "Strong", color: "#10b981" };
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const confirmPasswordTooLong = form.confirmPassword.length > form.password.length;
  const showConfirmPasswordMismatch =
    (form.confirmPassword.length > 0 && confirmPasswordTooLong) ||
    (confirmPasswordBlurred && !passwordsMatch);

  async function submitCreate() {
    setSaving(true);
    setErrors({});

    try {
      setAlertConfig(showLoading("Creating user..."));
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ general: data.error || "Failed to create user" });
        setAlertConfig(showError(data.error || "Failed to create user", () => setAlertConfig(null)));
        return;
      }
      setAlertConfig(showSuccessCreate("User created successfully!", () => { setAlertConfig(null); router.push("/users"); }));
    } catch (err) {
      setErrors({ general: "Something went wrong" });
      setAlertConfig(showError("Something went wrong", () => setAlertConfig(null)));
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setAlertConfig(
      showCreateConfirm(
        "Do you want to create this new user?",
        async () => submitCreate(),
        () => setAlertConfig(null)
      )
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
          <Link href="/users" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Users</Link>
          <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: '#9ca0c7' }}>Add New</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Add New User</h1>
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>User Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>User Type <span style={{ color: 'var(--danger)' }}>*</span></label>
              <SearchableSelect
                clearable={false}
                value={form.userType}
                onChange={(v) => handleChange({ target: { name: "userType", value: v } })}
                options={["Admin", "Recruiter"]}
              />
            </div>
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required error={errors.firstName} placeholder="e.g. John" />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required error={errors.lastName} placeholder="e.g. Doe" />
            <Input label="Username" name="username" value={form.username} onChange={handleChange} required error={errors.username} placeholder="e.g. john_doe" />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required error={errors.email} placeholder="user@example.com" />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="10 digit number" maxLength={10} />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-on-card)' }}>
                Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-10`}
                  style={{ ...inputStyle, borderColor: errors.password ? 'var(--danger)' : 'var(--border-input)' }}
                  onFocus={(e) => { e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border-input)'; }}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  required
                />
                <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword((visible) => !visible)} label="password" />
              </div>
              {(passwordTouched || form.password.length > 0) && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span key={step} className="h-1 flex-1 rounded-full" style={{ background: step <= passwordScore ? passwordStrength.color : 'var(--border-color)' }} />
                    ))}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                    <span style={{ color: passwordPolicySatisfied ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {passwordPolicySatisfied ? "Password meets all requirements" : `Missing: ${missingPasswordRequirements.join(", ")}`}
                    </span>
                    <span className="shrink-0" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.password}</p>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-on-card)' }}>
                  Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                {passwordsMatch ? (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                    <MatchStatusIcon matched={true} />
                    Matched
                  </span>
                ) : showConfirmPasswordMismatch ? (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--danger)' }}>
                    <MatchStatusIcon matched={false} />
                    Not Matched
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    handleChange(e);
                    setConfirmPasswordBlurred(false);
                  }}
                  onBlur={() => setConfirmPasswordBlurred(true)}
                  className={`${inputClass} pr-10`}
                  style={{ ...inputStyle, borderColor: errors.confirmPassword ? 'var(--danger)' : 'var(--border-input)' }}
                  onFocus={(e) => { e.target.style.borderColor = errors.confirmPassword ? 'var(--danger)' : 'var(--primary)'; }}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
                <PasswordVisibilityToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword((visible) => !visible)} label="confirm password" />
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            {saving ? (<><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</>) : "Create User"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-input)', boxShadow: 'var(--card-shadow)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const EARNING_KEYS = ["basicSalary", "hra", "da", "statutoryBonus", "otherAllowance"];

// Leave Encashment, Attendance/Performance Bonus, Special/Night/Travelling Allowance are not
// fixed monthly figures — each depends on that month's attendance (days present) matched
// against the employee's salary template slabs, so they're resolved at payslip generation
// time, not previewed here. See api/payslips/generate/route.js.
// OT Amount is an hourly rate (₹/hour), not a monthly figure — it's resolved at payslip
// generation time as rate × that month's overtime hours, so it's excluded from this preview too.
export function computeSlabAmount(slabs, presentDays, basicSalary) {
  if (!Array.isArray(slabs)) return 0;
  const slab = slabs.find((s) => presentDays >= s.minDays && presentDays <= s.maxDays);
  if (!slab) return 0;
  return slab.type === "Percentage"
    ? Math.round((Number(basicSalary) || 0) * (Number(slab.value) || 0) / 100)
    : Math.round(Number(slab.value) || 0);
}

// Percentage-based deduction math mirrors payslip generation time (see api/payslips/generate/route.js).
// Unlike an actual monthly payslip, a template preview always shows the ESI line when the
// toggle is on — the real ₹21,000 gross ceiling is applied later, per employee, at payslip time.
export function computeSalarySummary(form) {
  const num = (v) => Number(v) || 0;
  const grossEarnings = EARNING_KEYS.reduce((sum, key) => sum + num(form[key]), 0);

  const pfAmount = form.pfEnabled ? Math.round(num(form.basicSalary) * (num(form.pfPercent) / 100)) : 0;
  const esiAmount = form.esiEnabled ? Math.round(grossEarnings * (num(form.esiPercent) / 100)) : 0;
  const professionalTax = num(form.professionalTax);
  const tdsAmount = Math.round((grossEarnings * num(form.tdsPercent)) / 100);
  const lwf = num(form.lwf);

  const totalDeductions = pfAmount + esiAmount + professionalTax + tdsAmount + lwf;
  const netSalary = grossEarnings - totalDeductions;

  return { grossEarnings, pfAmount, esiAmount, professionalTax, tdsAmount, lwf, totalDeductions, netSalary };
}

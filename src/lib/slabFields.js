export const SLAB_FIELDS = [
  ["leaveEncashment", "Leave Encashment"],
  ["attendanceBonus", "Attendance Bonus"],
  ["performanceBonus", "Performance Bonus"],
  ["specialAllowance", "Special Allowance"],
  ["nightAllowance", "Night Allowance"],
  ["travellingAllowance", "Travelling Allowance"],
];

export const emptySlab = { minDays: "", maxDays: "", type: "Flat", value: "" };

export function initSlabState() {
  const state = {};
  for (const [key] of SLAB_FIELDS) state[key] = [{ ...emptySlab }];
  return state;
}

// Reads {leaveEncashmentSlabs: [...], attendanceBonusSlabs: [...], ...} off a fetched
// Employee/SalaryTemplate document into the { leaveEncashment: [...], ... } state shape.
export function slabsFromDoc(doc) {
  const state = {};
  for (const [key] of SLAB_FIELDS) {
    const arr = doc?.[`${key}Slabs`];
    state[key] = Array.isArray(arr) && arr.length > 0
      ? arr.map((s) => ({
          minDays: s.minDays?.toString() || "",
          maxDays: s.maxDays?.toString() || "",
          type: s.type || "Flat",
          value: s.value?.toString() || "",
        }))
      : [{ ...emptySlab }];
  }
  return state;
}

// Converts the { leaveEncashment: [...], ... } state shape back into
// {leaveEncashmentSlabs: [...], attendanceBonusSlabs: [...], ...} for the API body,
// dropping fully-blank rows.
export function slabsToBody(slabState) {
  const body = {};
  for (const [key] of SLAB_FIELDS) {
    body[`${key}Slabs`] = (slabState[key] || []).filter((s) => s.minDays !== "" || s.maxDays !== "" || s.value !== "");
  }
  return body;
}

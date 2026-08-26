export const ROLES = {
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
};

export const ROLE_PERMISSIONS = {
  ADMIN: ["dashboard", "clients", "salaryTemplates", "employees", "attendance", "payslips", "users"],
  RECRUITER: ["dashboard", "employees", "attendance"],
};

export function hasAccess(userType, section) {
  const role = (userType || "RECRUITER").toUpperCase();
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.RECRUITER;
  return permissions.includes(section);
}

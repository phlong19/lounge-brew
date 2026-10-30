export type StaffRole = "admin" | "editor";
export function canManageEvents(staff: unknown): staff is {role:StaffRole;is_active:true} {
  if (!staff || typeof staff !== "object") return false;
  const record = staff as Record<string,unknown>;
  return record.is_active === true && (record.role === "admin" || record.role === "editor");
}

export type StaffRole="admin"|"editor";
export type ContentRole="admin"|"editor";
export function canAccessAdmin(staff:unknown):staff is {role:StaffRole;is_active:true}{
 if(!staff||typeof staff!=="object")return false;const record=staff as Record<string,unknown>;
 return record.is_active===true&&["admin","editor"].includes(record.role as string);
}
export function canManageEvents(staff:unknown):staff is {role:ContentRole;is_active:true}{return canAccessAdmin(staff)&&(staff.role==="admin"||staff.role==="editor");}

export type AdminSection="events"|"video"|"seating"|"reservations"|"staff";
export function adminSection(pathname:string,section:string|null):AdminSection{
 if(pathname==="/admin/staff")return "staff";
 if(pathname==="/admin/reservations")return "reservations";
 return section==="video"||section==="seating"?section:"events";
}

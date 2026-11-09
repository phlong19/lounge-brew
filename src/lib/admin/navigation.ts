export type AdminSection="events"|"video"|"seating"|"reservations"|"staff"|"blogs";
export function adminSection(pathname:string,section:string|null):AdminSection{
 if(pathname==="/admin/staff")return "staff";
 if(pathname==="/admin/blogs")return "blogs";
 if(pathname==="/admin/reservations")return "reservations";
 return section==="video"||section==="seating"?section:"events";
}

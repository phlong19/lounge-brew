export type AdminSection="events"|"video"|"seating"|"reservations"|"staff"|"blogs";
export function adminSection(pathname:string):AdminSection{
 const segment=pathname.split("/")[2];
 return segment==="video"||segment==="seating"||segment==="reservations"||segment==="staff"||segment==="blogs"?segment:"events";
}

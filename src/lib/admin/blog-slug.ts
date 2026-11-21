/** Stable ASCII URLs from Vietnamese titles; never modify an existing saved URL automatically. */
export function blogSlugFromTitle(title: string): string {
 return title.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[đĐ]/g,"d").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,200).replace(/-+$/g,"");
}

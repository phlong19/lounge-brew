/** A spread's right page is a valid category target; stepping leaves the entire spread. */
export function menuStep(
  page: number,
  total: number,
  spread: boolean,
  direction: -1 | 1,
): number {
  const last = Math.max(0, total - 1);
  if (!spread) return Math.max(0, Math.min(last, page + direction));
  const firstVisible =
    page === 0 || page === last ? page : page % 2 === 0 ? page - 1 : page;
  const next =
    direction === -1 ? firstVisible - 2 : page === 0 ? 1 : firstVisible + 2;
  return Math.max(0, Math.min(last, next));
}

/** The caller checks the focused viewer, including ancestors of portalled widgets. */
export function menuKeyDirection(
  key: string,
  tag: string,
  role: string | null,
  editable: boolean,
  modified: boolean,
): -1 | 0 | 1 {
  if (modified || editable || ["INPUT", "SELECT", "TEXTAREA"].includes(tag))
    return 0;
  if (
    role &&
    ["dialog", "combobox", "listbox", "slider", "textbox"].includes(role)
  )
    return 0;
  return key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0;
}

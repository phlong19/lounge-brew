export function readMenuPage(value: string | null, total: number): number {
  if (!value || !/^\d+$/.test(value) || total <= 0) return 0;
  return Math.max(0, Math.min(total - 1, Number(value) - 1));
}

export function visibleMenuPages(
  page: number,
  total: number,
  spread: boolean,
): number[] {
  if (total <= 0) return [];
  const safePage = Math.max(0, Math.min(total - 1, page));
  if (!spread || safePage === 0 || safePage === total - 1) return [safePage];
  const left = safePage % 2 === 0 ? safePage - 1 : safePage;
  return [left, left + 1].filter((index) => index < total);
}

export function updateMenuUrl(value: string, page: number): string {
  const url = new URL(value, "https://trixie.invalid");
  if (page > 0) url.searchParams.set("page", String(page + 1));
  else url.searchParams.delete("page");
  return `${url.pathname}${url.search}${url.hash}`;
}

export const ticketStyles = {
  section: "overflow-hidden bg-[#0C1512] text-[#FFFAE7]",
  link: "group relative isolate block bg-[repeating-linear-gradient(135deg,transparent_0px,transparent_7px,rgba(255,255,255,0.1)_7px,rgba(255,255,255,0.1)_8px)] rounded-t-xl rounded-b-md border border-black/20 shadow-[0_5px_0_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 motion-reduce:transform-none",
  header: "relative px-4 pt-5 pb-3 text-center",
  stripe: "pointer-events-none absolute inset-x-4 top-0 h-1.5 rounded-b-sm",
  mark: "absolute top-5 size-3 opacity-60",
  series: "text-sm font-semibold uppercase tracking-[0.18em]",
  artist: "mt-1 flex min-h-16 items-center justify-center text-4xl font-normal leading-[1.15] tracking-normal text-balance capitalize md:text-4xl",
  dateRow: "mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t-2 border-current/50 pt-2",
  label: "text-xs font-semibold uppercase tracking-[0.12em]",
  value: "mt-0.5 text-xl font-bold leading-tight tracking-wide tabular-nums",
  separator: "h-9 border-l border-current/40",
  perforation: "pointer-events-none relative mx-3 border-t-2 border-dashed border-current/45",
  notch: "absolute top-0 z-10 size-6 -translate-y-1/2 rounded-full bg-[#0C1512]",
  poster: "relative mx-4 mt-3 aspect-[4/5] overflow-hidden",
  image: "transition-[filter] duration-300 group-hover:brightness-110 motion-reduce:transition-none",
  venue: "py-2 text-center text-sm font-semibold uppercase tracking-wider",
  stub: "relative px-4 py-3",
  action: "text-base font-bold uppercase tracking-[0.08em]",
  arrow: "flex size-9 items-center justify-center rounded-full border border-current/50 transition-colors group-hover:bg-[#15201C] group-hover:text-[#FFFAE7]",
} as const;

// Distinct ink-and-stock pairings for the current nine upcoming performances.
export const ticketColours = [
  "bg-[#8FA58A] text-[#101712]",
  "bg-[#BD977F] text-[#101712]",
  "bg-[#A79ABC] text-[#101712]",
  "bg-[#C5AC79] text-[#101712]",
  "bg-[#8FAAB9] text-[#101712]",
  "bg-[#BD939F] text-[#101712]",
  "bg-[#83B1A5] text-[#101712]",
  "bg-[#BF8E78] text-[#101712]",
  "bg-[#B0B281] text-[#101712]",
  "bg-[#ACAFBD] text-[#101712]",
  "bg-[#9FB68A] text-[#101712]",
  "bg-[#C1A2B3] text-[#101712]",
] as const;

// Curated from the authentic posters. Public event IDs keep colour identity stable.
export const posterTicketColours: Record<string, { stock: string; stripe: string }> = {
  "1853279": { stock: "bg-[#C8A48F] text-[#261C18]", stripe: "bg-[#9A5844]" },
  "27391056": { stock: "bg-[#B195BC] text-[#281B32]", stripe: "bg-[#693978]" },
  "58320194": { stock: "bg-[#B4A078] text-[#251F13]", stripe: "bg-[#6B5130]" },
  "31560924": { stock: "bg-[#C5A965] text-[#30230C]", stripe: "bg-[#8D651D]" },
  "76352980": { stock: "bg-[#C18F83] text-[#331A17]", stripe: "bg-[#8D2724]" },
  "24567190": { stock: "bg-[#A4AD7E] text-[#202613]", stripe: "bg-[#5C6B32]" },
  "96851273": { stock: "bg-[#B0A09A] text-[#2C2022]", stripe: "bg-[#682B35]" },
  "17598430": { stock: "bg-[#B490A5] text-[#2E1928]", stripe: "bg-[#773E62]" },
  "72856139": { stock: "bg-[#CCBD93] text-[#302817]", stripe: "bg-[#9A8054]" },
};

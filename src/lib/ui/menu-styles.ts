export const menuStyles = {
  panel:
    "mx-auto w-full max-w-[1360px] overflow-hidden rounded-lg border border-black/20 bg-[#302B25] bg-[url('/trixie/debut_dark_tile-bg.jpg')] bg-repeat shadow-xl",
  region:
    "grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-1 px-2 py-8 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#C6B573] sm:gap-3 sm:px-4 lg:grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] lg:py-10",
  arrow:
    "z-10 size-9 min-h-9 border border-white/60 bg-white/85 text-[#15201C] shadow-sm hover:bg-white hover:text-[#15201C] focus-visible:outline-white lg:size-11",
  stage: "relative mx-auto grid w-full place-items-center",
  spread: "max-w-[900px] aspect-[220/153]",
  portrait: "max-w-[440px] aspect-[110/153]",
  frame:
    "relative h-full w-full transition-transform duration-[650ms] ease-in-out motion-reduce:transition-none",
  spreadFrame: "aspect-[220/153]",
  portraitFrame: "aspect-[110/153]",
  front: "-translate-x-1/4",
  back: "translate-x-1/4",
  open: "translate-x-0",
  fallback: "absolute inset-0 h-full w-full drop-shadow-xl",
  engine: "absolute inset-0 h-full w-full drop-shadow-xl",
} as const;

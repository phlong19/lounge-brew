export const eventStyles = {
 detailHeading: "break-words text-4xl leading-[1.25] font-normal tracking-normal md:text-5xl lg:text-6xl",
 relatedBanner: "rounded-md bg-linear-to-r from-[#123E05] via-[#225B0B] to-[#2E8017] px-2 py-1.5 text-white",
 relatedHeading: "pl-1 text-left text-lg font-semibold tracking-normal text-white md:text-lg",
 sidebar: "rounded-xl border border-[#2E7017]/15 bg-white/40 p-4 lg:sticky lg:top-28",
 card: "group grid h-[124px] grid-cols-[76px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-[#2E7017]/10 bg-white/70 p-3 transition-colors hover:border-[#2E7017]/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7017] motion-reduce:transition-none",
 thumbnail: "relative h-full min-h-0 overflow-hidden rounded-md bg-[#F2F4EF]",
 title: "line-clamp-3 font-semibold leading-5 text-[#15201C] group-hover:text-[#2E7017]",
 metadata: "flex-wrap gap-x-3 gap-y-1 text-stone-600",
 viewer: "grid h-[calc(100dvh-2rem)] max-w-[1440px] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden p-4 md:p-6",
} as const;

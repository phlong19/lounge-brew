export const heroStyles = {
  frame: "relative isolate w-full overflow-hidden bg-[#15201C] py-0 md:py-0 text-[#FFFAE7]",
  image: "absolute inset-0 -z-20 transition-opacity duration-1000 ease-out motion-reduce:transition-none",
  scrim: "pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-black/80 via-black/50 to-black/20",
  content: "flex min-h-[660px] flex-col justify-center pt-12 pb-44 sm:min-h-[700px] sm:pb-36 lg:min-h-[min(800px,calc(100svh-132px))] lg:py-28",
  controls: "absolute inset-x-0 bottom-7 sm:bottom-9",
  segment: "min-w-0 flex-1 flex-col items-start gap-3 rounded-none border-0 px-0 py-3 text-[#FFFAE7] hover:bg-transparent hover:opacity-100",
  progress: "absolute inset-0 origin-left bg-[#FFFAE7] transition-transform duration-350 ease-linear motion-reduce:transition-none",
  textLink: "inline-flex min-h-12 items-center gap-3 px-3 font-medium underline-offset-8 hover:underline",
} as const;

export const progressStyles = [
  "scale-x-0", "scale-x-[0.05]", "scale-x-[0.1]", "scale-x-[0.15]", "scale-x-[0.2]",
  "scale-x-[0.25]", "scale-x-[0.3]", "scale-x-[0.35]", "scale-x-[0.4]", "scale-x-[0.45]",
  "scale-x-50", "scale-x-[0.55]", "scale-x-[0.6]", "scale-x-[0.65]", "scale-x-[0.7]",
  "scale-x-75", "scale-x-[0.8]", "scale-x-[0.85]", "scale-x-[0.9]", "scale-x-[0.95]", "scale-x-100",
] as const;

export const homeStyles = {
  photoLink: "group relative block overflow-hidden bg-[#15201C] text-[#FFFAE7]",
  photo: "transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none",
  photoScrim: "pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent",
  photoCaption: "absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 md:p-8",
} as const;

export const photoSliderStyles = {
  mainButton: "group block h-auto w-full min-w-0 overflow-hidden rounded-none border-0 p-0",
  frame: "relative aspect-[4/3] w-full overflow-hidden bg-[#15201C] md:aspect-[16/9]",
  slide: "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
  expand: "absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors group-hover:bg-black/80",
  thumbnail: "h-auto w-full min-w-0 overflow-hidden rounded-none border-0 p-0 transition-opacity motion-reduce:transition-none",
} as const;

export const footerStyles = {
  frame: "bg-[#F1EEE7] text-[#15201C] pt-12 pb-4 md:pt-12 md:pb-4",
  contactLink: "inline-flex min-h-11 w-fit items-center gap-3 text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4",
  navLink: "inline-flex min-h-11 items-center underline-offset-4 hover:underline",
} as const;

export const eventCardStyles = {
  base: "group block overflow-hidden rounded-none border-2 border-transparent transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none",
  dark: "hover:border-[#FFFAE7] hover:bg-white/10 focus-visible:border-[#FFFAE7] focus-visible:bg-white/10",
  light: "hover:border-[#006B57] hover:bg-[#006B57]/5 focus-visible:border-[#006B57] focus-visible:bg-[#006B57]/5",
  title: "underline-offset-4 group-hover:underline group-focus-visible:underline",
  image: "transition-[filter] duration-200 group-hover:brightness-75 group-focus-visible:brightness-75 motion-reduce:transition-none",
  arrow: "transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none",
} as const;

export const socialIconStyles = {
  facebook: "text-[#1877F2]",
  youtube: "text-[#FF0000]",
  instagram: "text-[#E4405F]",
  pinterest: "text-[#BD081C]",
} as const;

export const headerStyles = {
  announcementLink: "inline-flex min-h-9 items-center gap-2 rounded-none border-b-2 border-transparent text-sm transition-colors hover:border-[#006B57] hover:text-[#006B57]",
  navLink: "inline-flex min-h-11 items-center gap-2 rounded-none border-b-2 border-transparent py-2 text-sm font-medium text-[#15201C] transition-colors hover:border-[#006B57] hover:text-[#006B57] focus-visible:border-[#006B57] focus-visible:text-[#006B57] aria-[current=page]:border-[#006B57] aria-[current=page]:text-[#006B57] motion-reduce:transition-none",
  trigger: "rounded-none border-0 border-b-2 bg-transparent px-0 font-medium hover:bg-transparent focus-visible:bg-transparent aria-[expanded=true]:border-[#006B57] aria-[expanded=true]:text-[#006B57]",
  locale: "rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 font-normal hover:border-[#006B57] hover:bg-transparent hover:text-[#006B57] aria-pressed:border-[#006B57] aria-pressed:font-semibold aria-pressed:text-[#006B57]",
} as const;


export const dayStyles = {
  chapter: "scroll-mt-20 py-12 lg:scroll-mt-24 md:py-16",
  fields: ["bg-white text-[#15201C]", "bg-[#F1EEE7] text-[#15201C]", "bg-[#152F28] text-[#FFFAE7]"],
  photo: "relative overflow-hidden",
  action: "inline-flex min-h-11 w-fit items-center gap-3 font-medium underline-offset-8 hover:underline",
} as const;

export const foodStyles = {
  section: "bg-white text-[#15201C]",
  filter: "gap-3 rounded-none border-0 bg-[#F1EEE7] px-5 py-3 text-[#15201C] hover:bg-[#E2E9E3] aria-pressed:bg-[#006B57] aria-pressed:text-white",
  grid: "items-start gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4",
  slots: ["", "lg:pt-6", "", "lg:pt-6"],
  item: "group grid grid-cols-[112px_minmax(0,1fr)] items-start gap-4 rounded-none sm:block",
  photo: "relative overflow-hidden bg-[#F1EEE7]",
} as const;


export const reservationStyles = {
  dialog: "max-w-2xl gap-0 overflow-hidden p-0",
  header: "shrink-0 px-6 pt-6 pb-5 md:px-8 md:pt-8",
  body: "min-h-0 overflow-y-auto px-6 pb-6 md:px-8 md:pb-8",
} as const;

export const videoStyles = {
  section: "bg-white py-6 md:py-8",
  frame: "mx-auto w-full scroll-mt-24 md:scroll-mt-32 lg:w-[calc((100%_-_4rem)*0.55)]",
  player: "aspect-video h-auto w-full bg-[#15201C]",
} as const;


export const archiveStyles = {
  trigger: "group relative block aspect-[4/3] h-auto w-full overflow-hidden rounded-none border-2 border-transparent bg-transparent p-0 hover:border-[#006B57] hover:bg-transparent focus-visible:border-[#006B57] focus-visible:outline-none",
  image: "transition-[filter] duration-200 group-hover:brightness-80 group-focus-visible:brightness-80 motion-reduce:transition-none",
  expand: "absolute right-3 bottom-3 size-9 bg-[#15201C]/75 p-2 text-white",
  dialog: "max-w-5xl gap-4 p-4 md:p-6",
  fullPhoto: "relative aspect-[4/3] max-h-[70dvh] w-full bg-[#15201C]",
} as const;

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

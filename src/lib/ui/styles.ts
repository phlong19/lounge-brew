export const surfaceStyles = {
  paper: "bg-[#FFFAE7] text-[#15201C]",
  brand: "bg-[#006B57] text-[#FFFAE7]",
  evening: "bg-[#15201C] text-[#FFFAE7]",
  white: "bg-white text-[#15201C]",
  transparent: "bg-transparent text-inherit",
} as const;

export const typographyStyles = {
  inline: "text-[length:inherit] leading-[inherit]",
  display:
    "text-4xl font-semibold leading-[1.15] tracking-tight text-balance md:text-6xl",
  title:
    "text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl",
  heading:
    "text-2xl font-semibold leading-snug tracking-tight text-balance md:text-4xl",
  subheading: "text-xl font-semibold leading-snug text-balance md:text-2xl",
  lead: "text-lg leading-relaxed text-pretty md:text-xl",
  body: "text-base leading-relaxed text-pretty",
  small: "text-sm leading-relaxed",
  caption: "text-sm font-medium leading-normal",
} as const;

export const textToneStyles = {
  inherit: "text-inherit",
  ink: "text-[#15201C]",
  muted: "text-stone-600",
  inverse: "text-[#FFFAE7]",
  inverseMuted: "text-stone-300",
  brand: "text-[#006B57]",
  danger: "text-red-800",
} as const;

export const gapStyles = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-10",
  "2xl": "gap-16",
} as const;

export const focusStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export const buttonStyles = {
  primary: "border-transparent bg-[#006B57] text-[#FFFAE7] hover:bg-[#005343]",
  secondary: "border-transparent bg-[#FFFAE7] text-[#006B57] hover:bg-white",
  outline: "border-current bg-transparent text-inherit hover:bg-current/5",
  ghost: "border-transparent bg-transparent text-inherit hover:bg-current/10",
  inverse: "border-transparent bg-[#FFFAE7] text-[#15201C] hover:bg-white",
  destructive: "border-transparent bg-red-800 text-white hover:bg-red-900",
} as const;

export const buttonSizeStyles = {
  default: "min-h-11 gap-2 px-5 py-2.5 text-sm",
  sm: "min-h-11 gap-2 px-3 py-2 text-sm",
  lg: "min-h-12 gap-3 px-6 py-3 text-base",
  icon: "size-11 shrink-0 p-2.5",
} as const;

export const controlStyles =
  "w-full rounded-md border border-[#15201C]/25 bg-white px-3 py-2.5 text-base text-[#15201C] shadow-none placeholder:text-stone-500 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-800";

export const detailStyles = {
  eyebrow: "text-xs font-semibold uppercase tracking-[0.18em]",
  rule: "border-[#15201C]/15",
  inverseRule: "border-[#FFFAE7]/20",
  goldRule: "border-[#A18B47]",
  panel: "rounded-lg border border-[#15201C]/15",
  image: "overflow-hidden rounded-lg",
  page: "min-h-dvh overflow-x-clip",
} as const;

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  Maximize2,
  Menu,
  Minus,
  Music2,
  Phone,
  Plus,
  RotateCcw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  type LucideProps,
} from "lucide-react";

import { cn } from "@/lib/utils";

const icons = {
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  calendar: CalendarDays,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  clock: Clock3,
  externalLink: ExternalLink,
  globe: Globe2,
  mapPin: MapPin,
  maximize: Maximize2,
  menu: Menu,
  minus: Minus,
  music: Music2,
  phone: Phone,
  plus: Plus,
  reset: RotateCcw,
  search: Search,
  x: X,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
} as const;
export type IconName = keyof typeof icons;
export type IconProps = Omit<LucideProps, "name" | "style"> & {
  name: IconName;
  label?: string;
};

export function Icon({ name, label, className, ...props }: IconProps) {
  const Symbol = icons[name];
  return (
    <Symbol
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      className={cn("size-5 shrink-0", className)}
      {...props}
    />
  );
}

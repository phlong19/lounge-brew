// Transition shapes live in Tailwind class maps, alongside the shared visual styles.
export const overlayMotion = "opacity-100 transition-opacity duration-200 ease-out starting:opacity-0 data-[state=closed]:opacity-0 data-[state=closed]:pointer-events-none motion-reduce:transition-none";
export const dialogMotion = "opacity-100 scale-100 transition-[opacity,scale] duration-200 ease-out starting:opacity-0 starting:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=closed]:pointer-events-none motion-reduce:transition-none";
export const sheetMotion = {
  right: "translate-x-0 transition-transform duration-200 ease-out starting:translate-x-full data-[state=closed]:translate-x-full data-[state=closed]:pointer-events-none motion-reduce:transition-none",
  left: "translate-x-0 transition-transform duration-200 ease-out starting:-translate-x-full data-[state=closed]:-translate-x-full data-[state=closed]:pointer-events-none motion-reduce:transition-none",
  top: "translate-y-0 transition-transform duration-200 ease-out starting:-translate-y-full data-[state=closed]:-translate-y-full data-[state=closed]:pointer-events-none motion-reduce:transition-none",
  bottom: "translate-y-0 transition-transform duration-200 ease-out starting:translate-y-full data-[state=closed]:translate-y-full data-[state=closed]:pointer-events-none motion-reduce:transition-none",
} as const;
export const popupMotion = "transition-[opacity,translate] duration-150 ease-out starting:opacity-0 starting:-translate-y-1 motion-reduce:transition-none";

import type { ComponentPropsWithRef } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// Shadcn pagination composition, adapted to the owned Button and Vietnamese labels.
export function Pagination({ className, ...props }: ComponentPropsWithRef<"nav">) {
  return <nav aria-label="Phân trang" className={cn("flex justify-center", className)} {...props} />;
}
export function PaginationContent({ className, ...props }: ComponentPropsWithRef<"ul">) {
  return <ul className={cn("m-0 flex list-none flex-wrap items-center gap-1 p-0", className)} {...props} />;
}
export function PaginationItem(props: ComponentPropsWithRef<"li">) { return <li {...props} />; }
type LinkProps = ComponentPropsWithRef<"button"> & { isActive?: boolean };
export function PaginationLink({ isActive, className, ...props }: LinkProps) {
  return <Button type="button" aria-current={isActive ? "page" : undefined} variant={isActive ? "outline" : "ghost"} size="icon" className={cn("size-10", className)} {...props} />;
}
export function PaginationPrevious({ children = "Trước", ...props }: LinkProps) {
  return <PaginationLink aria-label="Trang trước" className="w-auto gap-1 px-3" {...props}><Icon name="chevronLeft" className="size-4" />{children}</PaginationLink>;
}
export function PaginationNext({ children = "Sau", ...props }: LinkProps) {
  return <PaginationLink aria-label="Trang sau" className="w-auto gap-1 px-3" {...props}>{children}<Icon name="chevronRight" className="size-4" /></PaginationLink>;
}
export function PaginationEllipsis() { return <span aria-hidden="true" className="flex size-10 items-center justify-center">…</span>; }

import type { ComponentPropsWithRef } from "react";
import {Typography} from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentPropsWithRef<"table">) {
  return <div className="relative w-full overflow-x-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>;
}
export function TableHeader({ className, ...props }: ComponentPropsWithRef<"thead">) {
  return <thead className={cn("border-b border-[#DCE2D6] bg-[#F2F4EF] [&_tr:hover]:bg-transparent", className)} {...props} />;
}
export function TableBody({ className, ...props }: ComponentPropsWithRef<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}
export function TableRow({ className, ...props }: ComponentPropsWithRef<"tr">) {
  return <tr className={cn("border-b border-[#EDF0E9] transition-colors hover:bg-[#F2F4EF]/50 motion-reduce:transition-none", className)} {...props} />;
}
export function TableHead({ className, ...props }: ComponentPropsWithRef<"th">) {
  return <th scope="col" className={cn("h-12 px-4 text-left align-middle font-semibold text-[#364431]", className)} {...props} />;
}
export function TableCell({ className, ...props }: ComponentPropsWithRef<"td">) {
  return <td className={cn("px-4 py-4 align-middle", className)} {...props} />;
}

export function TableEmpty({columns,children}:{columns:number;children:React.ReactNode}){
 return <TableRow className="hover:bg-transparent"><TableCell colSpan={columns} className="h-40 text-center"><Typography variant="small" tone="muted">{children}</Typography></TableCell></TableRow>;
}

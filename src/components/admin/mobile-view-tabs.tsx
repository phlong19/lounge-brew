"use client";

import {Button} from "@/components/ui/button";
import {Inline} from "@/components/ui/layout";

type View = "table" | "form";
export function MobileViewTabs({value,onChange,tableLabel,formLabel}:{value:View;onChange:(value:View)=>void;tableLabel:string;formLabel:string}) {
 return <Inline aria-label="Chọn nội dung" className="flex-nowrap gap-2 sm:hidden">
  <Button className="min-w-0 flex-1" variant={value === "table" ? "primary" : "outline"} aria-pressed={value === "table"} onClick={()=>onChange("table")}>{tableLabel}</Button>
  <Button className="min-w-0 flex-1" variant={value === "form" ? "primary" : "outline"} aria-pressed={value === "form"} onClick={()=>onChange("form")}>{formLabel}</Button>
 </Inline>;
}

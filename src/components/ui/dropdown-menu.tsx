"use client";
import * as Primitive from "@radix-ui/react-dropdown-menu";
import type {ComponentProps} from "react";
import {cn} from "@/lib/utils";
import {popupMotion} from "@/lib/ui/motion-styles";
export const DropdownMenu=Primitive.Root;
export const DropdownMenuTrigger=Primitive.Trigger;
export function DropdownMenuContent({className,sideOffset=6,...props}:ComponentProps<typeof Primitive.Content>){return <Primitive.Portal><Primitive.Content sideOffset={sideOffset} collisionPadding={12} className={cn("z-50 min-w-56 max-w-[calc(100vw-2rem)] rounded-md border border-stone-200 bg-white p-1 text-[#15201C] shadow-lg outline-none",popupMotion,className)} {...props} /></Primitive.Portal>;}
export function DropdownMenuItem({className,destructive=false,...props}:ComponentProps<typeof Primitive.Item>&{destructive?:boolean}){return <Primitive.Item className={cn("flex min-h-11 cursor-default items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none data-[highlighted]:bg-stone-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-40",destructive&&"text-red-700 data-[highlighted]:bg-red-50",className)} {...props} />;}
export function DropdownMenuSeparator(props:ComponentProps<typeof Primitive.Separator>){return <Primitive.Separator className="my-1 h-px bg-stone-200" {...props} />;}

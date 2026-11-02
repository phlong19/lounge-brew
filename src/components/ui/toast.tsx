"use client";
import * as Primitive from "@radix-ui/react-toast";
import {createContext,useCallback,useContext,useMemo,useState,type ReactNode} from "react";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Typography} from "@/components/ui/typography";
import {cn} from "@/lib/utils";
export type ToastVariant="success"|"info"|"warn"|"error";
type Item={id:string;message:string;variant:ToastVariant};
type Notify=(message:string)=>void;
type ToastApi=Notify&Record<ToastVariant,Notify>;
const variants={
 success:{icon:"success",surface:"border-green-600 bg-green-50 text-green-700",close:"text-green-700 hover:bg-green-100 hover:text-green-800"},
 info:{icon:"info",surface:"border-blue-600 bg-blue-50 text-blue-700",close:"text-blue-700 hover:bg-blue-100 hover:text-blue-800"},
 warn:{icon:"warning",surface:"border-amber-600 bg-amber-50 text-amber-800",close:"text-amber-800 hover:bg-amber-100 hover:text-amber-900"},
 error:{icon:"error",surface:"border-red-600 bg-red-50 text-red-700",close:"text-red-700 hover:bg-red-100 hover:text-red-800"},
} as const;
const ToastContext=createContext<ToastApi|null>(null);
export function ToastProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<Item[]>([]);
 const notify=useCallback((message:string,variant:ToastVariant)=>setItems(current=>[...current.slice(-2),{id:crypto.randomUUID(),message,variant}]),[]);
 const toast=useMemo<ToastApi>(()=>Object.assign((message:string)=>notify(message,"success"),{
  success:(message:string)=>notify(message,"success"),info:(message:string)=>notify(message,"info"),warn:(message:string)=>notify(message,"warn"),error:(message:string)=>notify(message,"error"),
 }),[notify]);
 return <ToastContext.Provider value={toast}><Primitive.Provider duration={5000} label="Thông báo">
 {children}
 {items.map(item=><Primitive.Root key={item.id} type={item.variant==="error"||item.variant==="warn"?"foreground":"background"} data-toast={item.variant} className={cn("group pointer-events-auto grid min-h-13 grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-3 shadow-sm transition-[opacity,translate] duration-200 starting:translate-x-4 starting:opacity-0 data-[swipe=end]:translate-x-full motion-reduce:transition-none",variants[item.variant].surface)} onOpenChange={open=>{if(!open)setItems(current=>current.filter(value=>value.id!==item.id));}}><Icon name={variants[item.variant].icon} className="size-4 shrink-0" /><Primitive.Title asChild><Typography variant="small" className="break-words font-medium">{item.message}</Typography></Primitive.Title><Primitive.Close asChild><Button variant="ghost" size="iconSm" className={cn("size-6 min-h-6",variants[item.variant].close)} aria-label="Đóng thông báo"><Icon name="x" className="size-4" /></Button></Primitive.Close></Primitive.Root>)}
 <Primitive.Viewport label="Thông báo (F8)" className="pointer-events-none fixed right-4 bottom-4 z-[100] m-0 flex w-[calc(100vw-2rem)] max-w-sm list-none flex-col gap-3 outline-none" />
 </Primitive.Provider></ToastContext.Provider>;
}
export function useToast(){const toast=useContext(ToastContext);if(!toast)throw new Error("ToastProvider is required");return toast;}

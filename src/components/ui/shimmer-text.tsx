"use client";
import { useEffect, useState } from "react";
import { Typography, type TypographyProps } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Loader-only timer, stopped on unmount/reduced motion. No custom CSS/keyframes. */
export function ShimmerText({className,...props}:TypographyProps) {
 const [right,setRight]=useState(false);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let timer:ReturnType<typeof setInterval>|undefined;
  const sync=()=>{clearInterval(timer);if(!media.matches)timer=setInterval(()=>{if(!document.hidden)setRight(value=>!value);},1100);};
  sync();media.addEventListener('change',sync);
  return()=>{clearInterval(timer);media.removeEventListener('change',sync);};
 },[]);
 return <Typography {...props} className={cn('bg-linear-to-r from-white/50 via-white to-white/50 bg-[length:200%_100%] bg-clip-text text-transparent transition-[background-position] duration-1000 ease-in-out motion-reduce:bg-none motion-reduce:text-white motion-reduce:transition-none',right?'bg-position-[100%_0%]':'bg-position-[0%_0%]',className)} />;
}

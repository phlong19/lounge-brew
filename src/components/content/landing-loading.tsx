"use client";
import {usePathname} from "next/navigation";
import {createContext,useCallback,useContext,useEffect,useLayoutEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {Inline,Main,Surface} from "@/components/ui/layout";
import {Icon} from "@/components/ui/icon";
import {Media} from "@/components/ui/media";
import {Typography} from "@/components/ui/typography";
import {pageStateStyles as s} from "@/lib/ui/page-state-styles";
import {cn} from "@/lib/utils";

const LoadingContext=createContext<{begin:(english:boolean)=>void;end:()=>void;present:boolean}|null>(null);
function LoadingCurtain({english=false,exiting=false,fixed=false,onExited}:{english?:boolean;exiting?:boolean;fixed?:boolean;onExited?:()=>void}){
 return <Surface className={fixed?s.overlay:s.loading} data-loading-curtain data-exiting={exiting} aria-hidden={exiting||undefined} role={exiting?undefined:"status"} aria-busy={!exiting} aria-live="polite">
 <Surface className={cn(s.half,s.upper,exiting?"-translate-y-full":"translate-y-0")}><Media src="/trixie/logo.png" alt="Trixie Café & Lounge" width={192} height={78} className={s.logo} fit="contain" priority /></Surface>
 <Surface className={cn(s.half,s.lower,exiting?"translate-y-full":"translate-y-0")} onTransitionEnd={event=>{if(event.target===event.currentTarget&&exiting)onExited?.();}}><Inline className={s.loadingLabel}><Icon name="spinner" className={s.spinner} /><Typography className={s.shimmer}>{english?"Loading…":"Đang tải…"}</Typography></Inline></Surface>
 </Surface>;
}

/** Keep the loading curtain alive after Suspense removes its fallback. */
export function LoadingTransitionProvider({children,initialEnglish=false}:{children:ReactNode;initialEnglish?:boolean}){
 const pathname=usePathname();
 const [phase,setPhase]=useState<"hidden"|"loading"|"exiting">(pathname === "/" ? "loading" : "hidden"),[english,setEnglish]=useState(initialEnglish);
 const finishTimer=useRef<ReturnType<typeof setTimeout>|null>(null),exitTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const clear=useCallback(()=>{if(finishTimer.current)clearTimeout(finishTimer.current);if(exitTimer.current)clearTimeout(exitTimer.current);},[]);
 const begin=useCallback((en:boolean)=>{clear();setEnglish(en);setPhase("loading");},[clear]);
 const end=useCallback(()=>{clear();finishTimer.current=setTimeout(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setPhase("hidden");return;}setPhase("exiting");exitTimer.current=setTimeout(()=>setPhase("hidden"),800);},300);},[clear]);
 useEffect(()=>clear,[clear]);
 const present=phase!=="hidden",value=useMemo(()=>({begin,end,present}),[begin,end,present]);
 return <LoadingContext.Provider value={value}><Surface inert={present||undefined}>{children}</Surface>{present?<LoadingCurtain english={english} fixed exiting={phase==="exiting"}  />:null}</LoadingContext.Provider>;
}

export function LandingLoading({english=false,preview=false}:{english?:boolean;preview?:boolean}){
 const context=useContext(LoadingContext),begin=context?.begin,end=context?.end;
 useLayoutEffect(()=>{if(preview||!begin||!end)return;begin(english);return end;},[english,preview,begin,end]);
 if(preview)return <LoadingCurtain english={english} />;
 return context?.present?<Main className="min-h-svh" aria-hidden="true" />:<LoadingCurtain english={english} />;
}

/** Runs even when the homepage resolves too quickly to mount its Suspense fallback. */
export function LandingReady({english=false}:{english?:boolean}){
 const context=useContext(LoadingContext),begin=context?.begin,end=context?.end;
 useLayoutEffect(()=>{if(!begin||!end)return;begin(english);end();},[begin,end,english]);
 return null;
}

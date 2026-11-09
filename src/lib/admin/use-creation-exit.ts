"use client";
import {useEffect} from "react";
/** Browser-close warning plus interception of normal in-app navigation during creation. */
export function useCreationExit(active:boolean,onRequest:(href:string)=>void){
 useEffect(()=>{
  if(!active)return;
  const unload=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue="";};
  const navigate=(event:MouseEvent)=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const link=(event.target as Element)?.closest("a[href]") as HTMLAnchorElement|null;if(!link||link.target==="_blank"||link.hasAttribute("download"))return;const url=new URL(link.href);if(url.origin!==location.origin||url.href===location.href)return;event.preventDefault();event.stopPropagation();onRequest(url.pathname+url.search+url.hash);};
  window.addEventListener("beforeunload",unload);document.addEventListener("click",navigate,true);
  return()=>{window.removeEventListener("beforeunload",unload);document.removeEventListener("click",navigate,true);};
 },[active,onRequest]);
}

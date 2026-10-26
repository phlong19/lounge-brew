"use client";

import { useEffect, useRef, useState, type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

/** Readable on the server; reveal off-screen content once, without scroll trapping. */
export function Reveal({ ref, className, ...props }: ComponentPropsWithRef<"div">) {
  const element = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = element.current;
    if (!node || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    setVisible(false);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(node);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = () => { if (media.matches) { setVisible(true); observer.disconnect(); } };
    media.addEventListener("change", reduce);
    return () => { observer.disconnect(); media.removeEventListener("change", reduce); };
  }, []);
  return <div
    {...props}
    ref={node => { element.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
    className={cn("min-w-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none", visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0", className)}
  />;
}

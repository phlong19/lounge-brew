"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState, type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

const delays = ["delay-0", "delay-75", "delay-150", "delay-200"] as const;
type Props = ComponentPropsWithRef<"div"> & { delay?: 0 | 1 | 2 | 3; enabled?: boolean };

/** Framer observes once; Tailwind owns transitions without injected inline styles.
 * SSR/no-JS content stays readable. Initial viewport uses CSS starting styles;
 * only content below the viewport is armed for a later scroll entrance.
 */
export function Reveal({ ref, className, delay = 0, enabled = true, onFocusCapture, ...props }: Props) {
  const element = useRef<HTMLDivElement | null>(null);
  const inView = useInView(element, { once: true, amount: 0.08, margin: "0px 0px 32px 0px" });
  const [armed, setArmed] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const node = element.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!enabled || !node || !window.IntersectionObserver || media.matches) return;
    const frame = requestAnimationFrame(() => setArmed(node.getBoundingClientRect().top >= window.innerHeight));
    const reduce = () => { if (media.matches) setArmed(false); };
    media.addEventListener("change", reduce);
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change", reduce); };
  }, [enabled]);
  const visible = !enabled || !armed || inView || focused;
  return <div {...props} data-reveal={visible ? "visible" : "pending"}
    ref={node => { element.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
    onFocusCapture={event => { setFocused(true); onFocusCapture?.(event); }}
    className={cn("min-w-0", enabled && "transition-[opacity,translate] duration-700 ease-out starting:translate-y-5 starting:opacity-0 motion-reduce:translate-none motion-reduce:opacity-100 motion-reduce:transition-none", enabled && (visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"), enabled && visible ? delays[delay] : "delay-0", enabled && "focus-within:translate-y-0 focus-within:opacity-100 focus-within:delay-0", className)} />;
}

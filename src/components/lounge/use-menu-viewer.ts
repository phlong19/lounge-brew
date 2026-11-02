"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";

import {
  availableMenuPage,
  compactMenuStep,
  readMenuPage,
  updateMenuUrl,
  visibleMenuPages,
} from "@/lib/menu/menu-state";
import { menuKeyDirection, menuStep } from "./use-menu-navigation";

const phoneQuery = "(max-width: 639px)";
function subscribePhone(callback: () => void) {
  const query = window.matchMedia(phoneQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const phoneSnapshot = () => window.matchMedia(phoneQuery).matches;
const desktopQuery = "(min-width: 1024px)";
const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeDesktop(callback: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const desktopSnapshot = () => window.matchMedia(desktopQuery).matches;
const motionSnapshot = () => window.matchMedia(reducedQuery).matches;
const serverDesktop = () => false;
const serverMotion = () => true;

export function useMenuViewer(total: number) {
  const [storedPage, setPage] = useState(0);
  const phone = useSyncExternalStore(subscribePhone, phoneSnapshot, serverDesktop);
  const spread = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    serverDesktop,
  );
  const page = availableMenuPage(storedPage, total, !spread);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverMotion,
  );
  useEffect(() => {
    const readLocation = () => {
      const raw = readMenuPage(new URL(window.location.href).searchParams.get("page"), total);
      const next = availableMenuPage(raw, total, !spread);
      setPage(next);
      if (raw !== next) window.history.replaceState(null, "", updateMenuUrl(window.location.href, next));
    };
    readLocation();
    window.addEventListener("popstate", readLocation);
    return () => window.removeEventListener("popstate", readLocation);
  }, [total, spread]);

  const goTo = useCallback(
    (target: number) => {
      const next = availableMenuPage(target, total, !spread);
      setPage(next);
      const href = updateMenuUrl(window.location.href, next);
      if (
        `${window.location.pathname}${window.location.search}${window.location.hash}` !==
        href
      ) {
        window.history.pushState(null, "", href);
      }
    },
    [total, spread],
  );
  const step = (direction: -1 | 1) =>
    goTo(!spread ? compactMenuStep(page, total, direction) : menuStep(page, total, spread, direction));
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      !event.currentTarget.contains(target)
    )
      return;
    if (
      target.closest(
        '[role="dialog"], [role="combobox"], [role="listbox"], [role="slider"], [role="textbox"]',
      )
    )
      return;
    const direction = menuKeyDirection(
      event.key,
      target.tagName,
      target.getAttribute("role"),
      target.isContentEditable,
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey,
    );
    if (direction) {
      event.preventDefault();
      step(direction);
    }
  }
  const visible = visibleMenuPages(page, total, spread);
  return { page, phone, spread, reducedMotion, visible, goTo, step, onKeyDown };
}

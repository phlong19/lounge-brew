"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";

import {
  readMenuPage,
  updateMenuUrl,
  visibleMenuPages,
} from "@/lib/menu/menu-state";
import { menuKeyDirection, menuStep } from "./use-menu-navigation";

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
  const [page, setPage] = useState(0);
  const spread = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    serverDesktop,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverMotion,
  );
  useEffect(() => {
    const readLocation = () =>
      setPage(
        readMenuPage(
          new URL(window.location.href).searchParams.get("page"),
          total,
        ),
      );
    readLocation();
    window.addEventListener("popstate", readLocation);
    return () => window.removeEventListener("popstate", readLocation);
  }, [total]);

  const goTo = useCallback(
    (target: number) => {
      const next = Math.max(0, Math.min(total - 1, target));
      setPage(next);
      const href = updateMenuUrl(window.location.href, next);
      if (
        `${window.location.pathname}${window.location.search}${window.location.hash}` !==
        href
      ) {
        window.history.pushState(window.history.state, "", href);
      }
    },
    [total],
  );
  const step = (direction: -1 | 1) =>
    goTo(menuStep(page, total, spread, direction));
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
  return { page, spread, reducedMotion, visible, goTo, step, onKeyDown };
}

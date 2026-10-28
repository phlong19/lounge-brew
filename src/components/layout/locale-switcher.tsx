"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { Icon } from "@/components/ui/icon";
import { Stack, Status, Surface } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import { headerStyles } from "@/lib/ui/home-styles";
import { cn } from "@/lib/utils";
import { locales } from "@/i18n/config";

export function LocaleSwitcher({ side = "bottom" }: { side?: "top" | "bottom" }) {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  function select(next: (typeof locales)[number]) {
    if (pending) return;
    setOpen(false); trigger.current?.focus();
    if (next === locale) return;
    setError(false);
    startTransition(async () => {
      try {
        const response = await fetch("/api/locale", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: next }) });
        if (!response.ok) throw new Error("Locale change failed");
        router.refresh();
      } catch { setError(true); }
    });
  }
  return <Surface data-language-switcher ref={root} className="relative" aria-busy={pending}
    onPointerEnter={event => { if (event.pointerType === "mouse") setOpen(true); }}
    onPointerLeave={() => { if (!root.current?.querySelector(":focus-visible")) setOpen(false); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => {
      if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
      if (event.key === "ArrowDown" && event.target === trigger.current) { event.preventDefault(); setOpen(true); requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>("[data-language-options] button")?.focus()); }
    }}>
    <Button ref={trigger} variant="ghost" className={cn(headerStyles.navLink, headerStyles.trigger)} aria-label={`${t("language")}: ${locale === "vi" ? t("vietnamese") : t("english")}`} aria-expanded={open} aria-controls={id} disabled={pending} onClick={() => setOpen(value => !value)}>
      <Flag locale={locale === "vi" ? "vi" : "en"} /><Typography as="span" variant="small">{locale.toUpperCase()}</Typography><Icon name="chevronDown" className="size-3.5" />
    </Button>
    {open ? <Surface id={id} className={cn("absolute right-0 z-50 min-w-48", side === "top" ? "bottom-full pb-2" : "top-full pt-2")} data-language-options>
      <Surface tone="white" className="rounded-md p-2 shadow-lg"><Stack gap="xs" role="group" aria-label={t("language")}>{locales.map(value => <Button key={value} variant="ghost" className={cn(headerStyles.navLink, headerStyles.trigger, "w-full justify-start px-3")} aria-pressed={locale === value} disabled={pending} onClick={() => select(value)}><Flag locale={value} />{value === "vi" ? t("vietnamese") : t("english")}{locale === value ? <Icon name="check" className="ml-auto size-4" /> : null}</Button>)}</Stack></Surface>
    </Surface> : null}
    {error ? <Status className="absolute top-full right-0 z-50 w-56 bg-white p-3 text-red-800">{t("languageError")}</Status> : null}
  </Surface>;
}

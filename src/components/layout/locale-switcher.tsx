"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Inline, Status } from "@/components/ui/layout";
import { locales } from "@/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  function select(next: (typeof locales)[number]) {
    if (next === locale || pending) return;
    setError(false);
    startTransition(async () => {
      try {
        const response = await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: next }),
        });
        if (!response.ok) throw new Error("Locale change failed");
        router.refresh();
      } catch {
        setError(true);
      }
    });
  }
  return (
    <Inline
      gap="none"
      role="group"
      aria-label={t("language")}
      aria-busy={pending}
    >
      {locales.map((value) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          aria-pressed={locale === value}
          disabled={pending}
          onClick={() => select(value)}
          className={
            locale === value
              ? "font-bold underline decoration-2 underline-offset-4"
              : "font-normal"
          }
        >
          {value.toUpperCase()}
        </Button>
      ))}
      {error ? (
        <Status className="max-w-56 text-red-800">{t("languageError")}</Status>
      ) : null}
    </Inline>
  );
}

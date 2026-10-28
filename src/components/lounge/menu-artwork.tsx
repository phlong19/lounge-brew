"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Inline, Stack, Status, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";

const artworkStyles = {
  frame: "relative h-full w-full overflow-hidden bg-[#121F1B]",
  image: "h-full w-full object-contain",
  message:
    "absolute inset-0 items-center justify-center bg-[#15201C] p-4 text-center text-[#FFFAE7]",
} as const;

export function MenuArtwork({
  page,
  eager = false,
  original = false,
  className,
}: {
  page: MenuPage;
  eager?: boolean;
  original?: boolean;
  className?: string;
}) {
  const t = useTranslations("Menu");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  return (
    <Surface className={cn(artworkStyles.frame, className)}>
      <Media
        key={attempt}
        src={page.image}
        alt={page.label}
        width={page.width}
        height={page.height}
        sizes={
          original
            ? "1800px"
            : "(min-width: 1024px) 440px, (min-width: 640px) 560px, 92vw"
        }
        fit="contain"
        className={artworkStyles.image}
        loading={eager ? "eager" : "lazy"}
        unoptimized={original}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />
      {status === "loading" ? (
        <Status className="pointer-events-none absolute bottom-3 left-3 rounded-sm bg-[#15201C]/90 px-3 py-2 text-[#FFFAE7]">
          {t("loading")}
        </Status>
      ) : null}
      {status === "error" ? (
        <Stack className={artworkStyles.message} gap="sm">
          <Status>{t("imageError")}</Status>
          <Inline className="justify-center" gap="xs">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStatus("loading");
                setAttempt((value) => value + 1);
              }}
            >
              <Icon name="reset" />
              {t("retry")}
            </Button>
            <Button asChild variant="outline" size="sm">
              <AppLink href={page.image} target="_blank">
                {t("openImage")}
                <Icon name="externalLink" />
              </AppLink>
            </Button>
          </Inline>
        </Stack>
      ) : null}
    </Surface>
  );
}

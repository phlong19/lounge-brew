import { forwardRef } from "react";

import type { AppLocale } from "@/i18n/config";
import { formatCurrency } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";

type Props = {
  page: MenuPage;
  locale: AppLocale;
  totalBookPages: number;
  labels: {
    soldOut: string;
    fromVietnamese: string;
    volumeLabel: string;
    coverFooter: string;
    backCaption: string;
  };
};

export const MenuPageSheet = forwardRef<HTMLDivElement, Props>(
  function MenuPageSheet({ page, locale, totalBookPages, labels }, ref) {
    if (page.kind === "cover") {
      return (
        <div ref={ref} className="h-full w-full" data-density="hard">
          <div className="flex h-full flex-col justify-between rounded-[28px] border border-white/15 bg-[radial-gradient(circle_at_top,_rgba(194,139,93,0.32),_transparent_35%),linear-gradient(135deg,#2a201b_0%,#18110d_100%)] p-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-10">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.45em] text-white/70">
                {labels.volumeLabel}
              </p>
              <h2 className="font-display text-5xl leading-none sm:text-6xl">
                {page.title}
              </h2>
              <p className="max-w-sm text-sm leading-7 text-white/75 sm:text-base">
                {page.subtitle}
              </p>
            </div>
            <div className="space-y-2 text-sm text-white/65">
              <div className="h-px w-16 bg-white/20" />
              <p className="uppercase tracking-[0.35em]">
                {labels.coverFooter}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (page.kind === "back") {
      return (
        <div ref={ref} className="h-full w-full" data-density="hard">
          <div className="flex h-full flex-col justify-between rounded-[28px] border border-black/5 bg-page p-8 text-page-foreground shadow-[inset_0_0_0_1px_rgba(43,32,23,0.06)] sm:p-10">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.45em] text-page-foreground/50">
                Lounge Brew
              </p>
              <blockquote className="max-w-md font-display text-4xl leading-tight sm:text-5xl">
                “{page.quote}”
              </blockquote>
            </div>
            <p className="text-sm leading-7 text-page-foreground/65">
              {labels.backCaption}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="h-full w-full overflow-visible">
        <div className="relative flex h-full flex-col rounded-[28px] border border-black/5 bg-page p-6 text-page-foreground shadow-[inset_0_0_0_1px_rgba(43,32,23,0.06)] sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-page-foreground/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-page-foreground/45">
                {String(page.bookPageNumber).padStart(2, "0")} /{" "}
                {String(totalBookPages).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-3xl sm:text-4xl">
                {page.category.name}
              </h3>
            </div>
            <div className="h-px w-12 bg-page-foreground/15" />
          </div>

          <div className="grid gap-4">
            {page.items.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 rounded-3xl border border-page-foreground/8 bg-white/45 p-4 shadow-[0_12px_28px_rgba(43,32,23,0.05)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display text-2xl leading-none">
                        {item.name}
                      </h4>
                      {item.fallbackFromVietnamese && locale === "en" ? (
                        <span className="rounded-full bg-accent/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
                          {labels.fromVietnamese}
                        </span>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className="max-w-[32ch] text-sm leading-6 text-page-foreground/75">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl leading-none">
                      {formatCurrency(item.price, locale)}
                    </p>
                    {item.isSoldOut ? (
                      <span className="mt-2 inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-red-700">
                        {labels.soldOut}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

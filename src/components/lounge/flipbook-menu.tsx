"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, useRef, useState } from "react";

import type { AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";

import { MenuPageSheet } from "./menu-page";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
});

type PageFlipCorner = "top" | "bottom";
type PageFlipOrientation = "portrait" | "landscape";

type PageFlipApi = {
  flip: (pageNum: number, corner?: PageFlipCorner) => void;
  flipNext: (corner?: PageFlipCorner) => void;
  flipPrev: (corner?: PageFlipCorner) => void;
  getOrientation: () => PageFlipOrientation;
  turnToPage: (pageNum: number) => void;
};

type FlipBookRef = {
  pageFlip: () => PageFlipApi | undefined;
};

type MenuCategoryPage = Extract<MenuPage, { kind: "category" }>;
type MenuBookTabSide = "left" | "right";

function getTabSide(
  targetPageIndex: number,
  currentPage: number,
  orientation: PageFlipOrientation,
): MenuBookTabSide {
  if (orientation === "portrait") {
    return targetPageIndex < currentPage ? "left" : "right";
  }

  return targetPageIndex <= currentPage ? "left" : "right";
}

type Props = {
  pages: MenuPage[];
  locale: AppLocale;
  labels: {
    previousPage: string;
    nextPage: string;
    soldOut: string;
    fromVietnamese: string;
    volumeLabel: string;
    coverFooter: string;
    backCaption: string;
    frontCover: string;
    backCover: string;
  };
};

export function FlipbookMenu({ pages, locale, labels }: Props) {
  const bookRef = useRef<FlipBookRef | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [orientation, setOrientation] =
    useState<PageFlipOrientation>("landscape");
  const totalBookPages = pages.filter(
    (page) => page.bookPageNumber !== null,
  ).length;

  const canGoBack = currentPage > 0;
  const canGoNext = currentPage < pages.length - 1;
  const activePage = pages[currentPage] ?? pages[0];
  const activeCategoryId =
    activePage.kind === "category" ? activePage.category.id : null;
  const categoryTabs = pages
    .filter(
      (page): page is MenuCategoryPage =>
        page.kind === "category" && page.showTab,
    )
    .map((page) => ({
      id: page.category.id,
      label: page.category.tabLabel,
      color: page.category.tabColor,
      sortOrder: page.category.sortOrder,
      targetPageIndex: page.physicalIndex,
    }))
    .sort((firstTab, secondTab) => firstTab.sortOrder - secondTab.sortOrder);

  function getProgressLabel(page: MenuPage) {
    if (page.kind === "cover") {
      return labels.frontCover;
    }

    if (page.kind === "back") {
      return labels.backCover;
    }

    return `${page.bookPageNumber} / ${totalBookPages}`;
  }

  function jumpToPage(targetPageIndex: number) {
    if (targetPageIndex === currentPage) {
      return;
    }

    const pageFlip = bookRef.current?.pageFlip();

    if (!pageFlip) {
      return;
    }

    try {
      pageFlip.flip(targetPageIndex, "bottom");
    } catch {
      pageFlip.turnToPage(targetPageIndex);
      setCurrentPage(targetPageIndex);
    }
  }

  return (
    <section className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 py-4">
      <div className="w-full rounded-[38px] border border-white/10 bg-white/5 p-3 shadow-[0_34px_100px_rgba(0,0,0,0.45)] backdrop-blur md:p-4">
        <div className="overflow-visible rounded-[30px] bg-black/10 p-1 md:p-2">
          <div className="menu-flipbook-stage">
            <div className="menu-book-tab-stack">
              {categoryTabs.map((tab, index) => {
                const tabSide = getTabSide(
                  tab.targetPageIndex,
                  currentPage,
                  orientation,
                );
                const isActive = tab.id === activeCategoryId;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => jumpToPage(tab.targetPageIndex)}
                    className={cn(
                      "menu-book-tab",
                      tabSide === "left"
                        ? "menu-book-tab--left"
                        : "menu-book-tab--right",
                      isActive && "menu-book-tab--active",
                    )}
                    style={
                      {
                        "--menu-tab-offset": `${3.5 + index * 3.75}rem`,
                        backgroundColor: tab.color,
                      } as CSSProperties
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <HTMLFlipBook
              ref={bookRef}
              startPage={0}
              width={560}
              height={760}
              size="stretch"
              minWidth={300}
              maxWidth={560}
              minHeight={420}
              maxHeight={760}
              showCover
              usePortrait
              drawShadow
              maxShadowOpacity={0.22}
              autoSize
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={24}
              showPageCorners={false}
              disableFlipByClick={false}
              flippingTime={900}
              startZIndex={12}
              className="menu-flipbook"
              style={{ margin: "0 auto" }}
              onFlip={(event: { data: number }) =>
                setCurrentPage(event.data ?? 0)
              }
              onChangeOrientation={(event: { data: PageFlipOrientation }) =>
                setOrientation(event.data)
              }
            >
              {pages.map((page) => (
                <MenuPageSheet
                  key={page.id}
                  page={page}
                  locale={locale}
                  totalBookPages={totalBookPages}
                  labels={{
                    soldOut: labels.soldOut,
                    fromVietnamese: labels.fromVietnamese,
                    volumeLabel: labels.volumeLabel,
                    coverFooter: labels.coverFooter,
                    backCaption: labels.backCaption,
                  }}
                />
              ))}
            </HTMLFlipBook>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm backdrop-blur">
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipPrev("bottom")}
          disabled={!canGoBack}
          className={cn(
            "rounded-full px-4 py-2 transition",
            canGoBack
              ? "bg-white/10 text-white hover:bg-white/15"
              : "cursor-not-allowed bg-white/5 text-white/35",
          )}
        >
          ← {labels.previousPage}
        </button>
        <span className="min-w-20 text-center font-medium text-white/75">
          {getProgressLabel(activePage)}
        </span>
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipNext("bottom")}
          disabled={!canGoNext}
          className={cn(
            "rounded-full px-4 py-2 transition",
            canGoNext
              ? "bg-accent text-white hover:brightness-110"
              : "cursor-not-allowed bg-white/5 text-white/35",
          )}
        >
          {labels.nextPage} →
        </button>
      </div>
    </section>
  );
}

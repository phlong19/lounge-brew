"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { forwardRef, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";

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

type Props = {
  pages: MenuPage[];
  labels: {
    previousPage: string;
    nextPage: string;
    frontCover: string;
    backCover: string;
  };
};

type MenuImagePageProps = {
  page: MenuPage;
};

const MenuImagePage = forwardRef<HTMLDivElement, MenuImagePageProps>(
  function MenuImagePage({ page }, ref) {
    const isCover = page.kind === "cover" || page.kind === "back";

    return (
      <div
        ref={ref}
        className="h-full w-full"
        data-density={isCover ? "hard" : undefined}
      >
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-[28px] border",
            isCover
              ? "border-[#f5f0e3]/12 bg-[#0c1a17] shadow-[inset_0_1px_0_rgba(245,240,227,0.06)]"
              : "border-[#1a3a30]/10 bg-page shadow-[inset_0_0_0_1px_rgba(26,58,48,0.06)]",
          )}
        >
          <Image
            src={page.image}
            alt={`Menu ${page.id}`}
            fill
            sizes="(max-width: 768px) 90vw, 560px"
            className="object-cover object-center"
            priority={page.physicalIndex <= 1}
          />
        </div>
      </div>
    );
  },
);

export function FlipbookMenu({ pages, labels }: Props) {
  const bookRef = useRef<FlipBookRef | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const canGoBack = currentPage > 0;
  const canGoNext = currentPage < pages.length - 1;

  const totalContentPages = pages.filter((p) => p.kind === "content").length;
  const activePage = pages[currentPage] ?? pages[0];

  function getProgressLabel(page: MenuPage) {
    if (page.kind === "cover") {
      return labels.frontCover;
    }

    if (page.kind === "back") {
      return labels.backCover;
    }

    // Find 1-based content page number
    const contentPages = pages.filter((p) => p.kind === "content");
    const contentIndex = contentPages.indexOf(page);

    return `${contentIndex + 1} / ${totalContentPages}`;
  }

  return (
    <section className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 py-4">
      <div className="w-full">
        <div className="overflow-visible rounded-[30px] bg-[#0f7b5f]/8 p-1 md:p-2">
          <div className="menu-flipbook-stage">
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
            >
              {pages.map((page) => (
                <MenuImagePage key={page.id} page={page} />
              ))}
            </HTMLFlipBook>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 px-3 py-2 text-sm backdrop-blur">
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipPrev("bottom")}
          disabled={!canGoBack}
          className={cn(
            "rounded-full px-4 py-2 transition",
            canGoBack
              ? "bg-[#0f7b5f]/20 text-[#f5f0e3] hover:bg-[#0f7b5f]/30"
              : "cursor-not-allowed bg-[#0f7b5f]/5 text-[#f5f0e3]/35",
          )}
        >
          ← {labels.previousPage}
        </button>
        <span className="min-w-20 text-center font-medium text-[#f5f0e3]/75">
          {getProgressLabel(activePage)}
        </span>
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipNext("bottom")}
          disabled={!canGoNext}
          className={cn(
            "rounded-full px-4 py-2 transition",
            canGoNext
              ? "bg-accent text-[#f5f0e3] hover:brightness-110"
              : "cursor-not-allowed bg-[#0f7b5f]/5 text-[#f5f0e3]/35",
          )}
        >
          {labels.nextPage} →
        </button>
      </div>
    </section>
  );
}

"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import HTMLFlipBook from "react-pageflip";

import { Surface } from "@/components/ui/layout";
import { visibleMenuPages } from "@/lib/menu/menu-state";
import type { MenuPage } from "@/types/domain";
import { MenuArtwork } from "./menu-artwork";

// react-pageflip declares style as required, although its renderer accepts omission.
// Keep that third-party implementation detail in this adapter; owned UI uses classes.
type EngineProps = Omit<ComponentProps<typeof HTMLFlipBook>, "style" | "ref">;
type EngineApi = {
  flip: (page: number) => void;
  turnToPage: (page: number) => void;
  getCurrentPageIndex: () => number;
  destroy: () => void;
};
type EngineRef = { pageFlip: () => EngineApi | undefined };
const BookEngine = HTMLFlipBook as unknown as ForwardRefExoticComponent<
  EngineProps & RefAttributes<EngineRef>
>;

const BookContext = createContext({ page: 0, visible: [0] });
const BookPage = forwardRef<HTMLDivElement, { page: MenuPage }>(
  function BookPage({ page }, ref) {
    const state = useContext(BookContext);
    return (
      <Surface
        ref={ref}
        className="h-full w-full"
        data-density={page.kind === "content" ? "soft" : "hard"}
        aria-hidden={!state.visible.includes(page.physicalIndex)}
      >
        <MenuArtwork
          page={page}
          eager={Math.abs(page.physicalIndex - state.page) <= 1}
        />
      </Surface>
    );
  },
);

export type MenuBookProps = {
  pages: MenuPage[];
  page: number;
  spread: boolean;
  onPageChange: (page: number) => void;
  onReady: () => void;
};

/** Measure owned layout without writing styles; engine sizing stays in its API. */
export function MenuBook(props: MenuBookProps) {
  const stage = useRef<HTMLElement>(null);
  const [minimumWidth, setMinimumWidth] = useState<number | null>(null);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width <= 0) return;
      // Portrait is chosen below twice minWidth. A minimum just above half the
      // available width keeps one page without imposing a 300px phone minimum.
      setMinimumWidth(
        props.spread ? 200 : Math.floor(entry.contentRect.width / 2) + 1,
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [props.spread]);
  return (
    <Surface ref={stage} className="w-full">
      {minimumWidth === null ? null : (
        <MenuBookEngine
          key={`${props.spread}:${minimumWidth}`}
          {...props}
          minimumWidth={minimumWidth}
        />
      )}
    </Surface>
  );
}

/** The only boundary that permits the page-turn engine's generated transforms. */
function MenuBookEngine({
  pages,
  page,
  spread,
  onPageChange,
  onReady,
  minimumWidth,
}: MenuBookProps & { minimumWidth: number }) {
  const engine = useRef<EngineRef>(null);
  const instance = useRef<EngineApi | null>(null);
  const requested = useRef(page);
  const callback = useRef(onPageChange);
  const readyCallback = useRef(onReady);
  const [ready, setReady] = useState(false);
  requested.current = page;
  callback.current = onPageChange;
  readyCallback.current = onReady;
  const visible = visibleMenuPages(page, pages.length, spread);

  useEffect(
    () => () => {
      instance.current?.destroy();
    },
    [],
  );

  useEffect(() => {
    if (!ready) return;
    const api = engine.current?.pageFlip();
    if (
      api &&
      !visibleMenuPages(
        api.getCurrentPageIndex(),
        pages.length,
        spread,
      ).includes(page)
    )
      api.flip(page);
  }, [page, pages.length, ready, spread]);

  // Stable child elements prevent react-pageflip from rebuilding its HTML pages on
  // every navigation. Context updates page accessibility/loading independently.
  const children = useMemo(
    () => pages.map((item) => <BookPage key={item.id} page={item} />),
    [pages],
  );
  return (
    <BookContext.Provider value={{ page, visible }}>
      <BookEngine
        ref={engine}
        startPage={page}
        width={440}
        height={612}
        size="stretch"
        minWidth={minimumWidth}
        maxWidth={560}
        minHeight={390}
        maxHeight={780}
        showCover
        usePortrait={!spread}
        drawShadow
        maxShadowOpacity={0.25}
        autoSize
        mobileScrollSupport
        clickEventForward
        useMouseEvents
        swipeDistance={35}
        showPageCorners={false}
        disableFlipByClick
        flippingTime={650}
        startZIndex={1}
        className="mx-auto"
        onInit={() => {
          instance.current = engine.current?.pageFlip() ?? null;
          setReady(true);
          readyCallback.current();
        }}
        onFlip={(event: { data: number }) => {
          // A right-hand category stays selected when the engine reports its left page.
          if (
            !visibleMenuPages(event.data, pages.length, spread).includes(
              requested.current,
            )
          )
            callback.current(event.data);
        }}
      >
        {children}
      </BookEngine>
    </BookContext.Provider>
  );
}

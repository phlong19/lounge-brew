import type {AppLocale} from '@/i18n/config';

export type Locale = AppLocale;

export type CategoryRow = {
  id: string;
  name_vi: string;
  name_en: string | null;
  tab_label_vi: string;
  tab_label_en: string | null;
  tab_color: string | null;
  sort_order: number;
};

export type MenuItemRow = {
  id: string;
  category_id: string;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  price: number;
  is_sold_out: boolean;
  sort_order: number;
};

export type EventRow = {
  id: string;
  title_vi: string;
  title_en: string | null;
  performer_name: string;
  event_date: string;
  description_vi: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  is_active: boolean;
};

export type ArticleRow = {
  id: string;
  title_vi: string;
  title_en: string | null;
  slug: string;
  content_vi: string;
  content_en: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
};

export type HomePageData = {
  categories: CategoryRow[];
  menuItems: MenuItemRow[];
  events: EventRow[];
  articles: ArticleRow[];
};

export type LocalizedCategory = {
  id: string;
  name: string;
  tabLabel: string;
  tabColor: string;
  sortOrder: number;
  fallbackFromVietnamese: boolean;
};

export type LocalizedMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  isSoldOut: boolean;
  sortOrder: number;
  fallbackFromVietnamese: boolean;
};

export type LocalizedEvent = {
  id: string;
  title: string;
  performerName: string;
  eventDate: string;
  description: string | null;
  coverImageUrl: string | null;
  fallbackFromVietnamese: boolean;
};

export type LocalizedArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  fallbackFromVietnamese: boolean;
};

export type MenuSection = {
  category: LocalizedCategory;
  items: LocalizedMenuItem[];
};

export type MenuPage =
  | {
      id: string;
      physicalIndex: number;
      bookPageNumber: null;
      kind: 'cover';
      title: string;
      subtitle: string;
    }
  | {
      id: string;
      physicalIndex: number;
      bookPageNumber: number;
      kind: 'category';
      category: LocalizedCategory;
      items: LocalizedMenuItem[];
      showTab: boolean;
      sectionPageIndex: number;
      sectionPageCount: number;
    }
  | {
      id: string;
      physicalIndex: number;
      bookPageNumber: null;
      kind: 'back';
      quote: string;
    };

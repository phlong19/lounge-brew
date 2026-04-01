import {
  mockArticles,
  mockCategories,
  mockEvents,
  mockMenuItems
} from '@/data/mock-data';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {ArticleRow, HomePageData} from '@/types/domain';

export type LoungeDataResult = HomePageData & {
  usingMockData: boolean;
};

function buildMockData(): LoungeDataResult {
  return {
    categories: mockCategories,
    menuItems: mockMenuItems,
    events: mockEvents,
    articles: mockArticles,
    usingMockData: true
  };
}

export async function getLoungeData(): Promise<LoungeDataResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return buildMockData();
  }

  try {
    const now = new Date().toISOString();

    const [categoriesResult, menuItemsResult, eventsResult, articlesResult] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', {ascending: true}),
      supabase.from('menu_items').select('*').order('sort_order', {ascending: true}),
      supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', now)
        .order('event_date', {ascending: true}),
      supabase
        .from('articles')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', {ascending: false})
    ]);

    if (
      categoriesResult.error ||
      menuItemsResult.error ||
      eventsResult.error ||
      articlesResult.error
    ) {
      return buildMockData();
    }

    return {
      categories: categoriesResult.data,
      menuItems: menuItemsResult.data,
      events: eventsResult.data,
      articles: articlesResult.data,
      usingMockData: false
    };
  } catch {
    return buildMockData();
  }
}

export async function getArticleBySlug(slug: string): Promise<{
  article: ArticleRow | null;
  usingMockData: boolean;
}> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      article: mockArticles.find((article) => article.slug === slug) ?? null,
      usingMockData: true
    };
  }

  try {
    const result = await supabase.from('articles').select('*').eq('slug', slug).maybeSingle();

    if (result.error || !result.data) {
      return {
        article: mockArticles.find((article) => article.slug === slug) ?? null,
        usingMockData: true
      };
    }

    return {
      article: result.data,
      usingMockData: false
    };
  } catch {
    return {
      article: mockArticles.find((article) => article.slug === slug) ?? null,
      usingMockData: true
    };
  }
}

import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

import type {AppLocale} from '@/i18n/config';
import {localizeArticle} from '@/lib/menu/map-menu';
import {getArticleBySlug} from '@/lib/server/lounge-data';

type Props = {
  params: Promise<{slug: string}>;
};

function formatPublishedAt(value: string | null, locale: AppLocale) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'long'
  }).format(new Date(value));
}

export default async function JournalArticlePage({params}: Props) {
  const locale = (await getLocale()) as AppLocale;
  const {slug} = await params;
  const [journalT, articleResult] = await Promise.all([
    getTranslations('Journal'),
    getArticleBySlug(slug)
  ]);

  if (!articleResult.article) {
    notFound();
  }

  const article = localizeArticle(locale, articleResult.article);
  const publishedAt = formatPublishedAt(article.publishedAt, locale);

  return (
    <main className="min-h-dvh px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur"
        >
          ← {journalT('backToMenu')}
        </Link>

        <article className="rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.45em] text-white/45">{journalT('sectionLabel')}</p>
          <h1 className="mt-4 font-display text-5xl leading-none text-white/95">{article.title}</h1>
          {publishedAt ? (
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-white/45">{publishedAt}</p>
          ) : null}
          {article.fallbackFromVietnamese && locale === 'en' ? (
            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
              {journalT('fallbackNotice')}
            </div>
          ) : null}

          <div
            className="mt-8 space-y-4 text-base leading-8 text-white/80 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_p]:leading-8 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{__html: article.content}}
          />
        </article>
      </div>
    </main>
  );
}


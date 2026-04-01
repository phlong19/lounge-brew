import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';

import {SiteHeader} from '@/components/layout/site-header';
import type {AppLocale} from '@/i18n/config';
import {localizeArticles} from '@/lib/menu/map-menu';
import {getLoungeData} from '@/lib/server/lounge-data';

function toExcerpt(html: string) {
  const plainText = html.replace(/<[^>]+>/g, '').trim();
  return plainText.length > 150 ? `${plainText.slice(0, 150).trim()}…` : plainText;
}

export default async function JournalIndexPage() {
  const locale = (await getLocale()) as AppLocale;
  const [journalT, menuT, loungeData] = await Promise.all([
    getTranslations('JournalIndexPage'),
    getTranslations('HomePage'),
    getLoungeData()
  ]);

  const articles = localizeArticles(locale, loungeData.articles);

  return (
    <main className="min-h-dvh px-4 pb-10 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <SiteHeader active="journal" />

        <section className="rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-white/45">{journalT('eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl leading-none text-white/95">{journalT('title')}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">{journalT('description')}</p>
        </section>

        {articles.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70 backdrop-blur">
            {menuT('emptyArticles')}
          </div>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/journal/${article.slug}`}
                className="rounded-[32px] border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/7"
              >
                <p className="text-xs uppercase tracking-[0.38em] text-white/40">{journalT('cardEyebrow')}</p>
                <h2 className="mt-4 font-display text-4xl leading-none text-white/95">{article.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/70">{toExcerpt(article.content)}</p>
                {article.fallbackFromVietnamese && locale === 'en' ? (
                  <span className="mt-4 inline-flex rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
                    {menuT('fromVietnamese')}
                  </span>
                ) : null}
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}


import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';

import {SiteHeader} from '@/components/layout/site-header';
import {FlipbookMenu} from '@/components/lounge/flipbook-menu';
import type {AppLocale} from '@/i18n/config';
import {buildMenuSections} from '@/lib/menu/map-menu';
import {buildMenuPages} from '@/lib/menu/paginate-menu';
import {getLoungeData} from '@/lib/server/lounge-data';

export default async function MenuPage() {
  const locale = (await getLocale()) as AppLocale;
  const [menuT, navigationT, loungeData] = await Promise.all([
    getTranslations('HomePage'),
    getTranslations('Navigation'),
    getLoungeData()
  ]);

  const sections = buildMenuSections(locale, loungeData.categories, loungeData.menuItems);
  const menuPages = buildMenuPages(sections, {
    coverTitle: menuT('menuCoverTitle'),
    coverSubtitle: menuT('menuCoverSubtitle'),
    backQuote: menuT('backCoverQuote')
  });

  return (
    <main className="min-h-dvh px-4 pb-10 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <SiteHeader active="menu" />

        {loungeData.usingMockData ? (
          <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
            {menuT('mockDataNotice')}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)] xl:items-start">
          <aside className="space-y-6 xl:sticky xl:top-4">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.45em] text-white/45">{menuT('exploreMenu')}</p>
              <h1 className="mt-4 font-display text-5xl leading-none text-white/95">{menuT('title')}</h1>
              <p className="mt-4 text-sm leading-7 text-white/70">{menuT('subtitle')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-[0_14px_32px_rgba(194,139,93,0.3)]"
                >
                  {navigationT('events')}
                </Link>
                <Link
                  href="/journal"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/80"
                >
                  {navigationT('journal')}
                </Link>
              </div>
            </div>
          </aside>

          <FlipbookMenu
            pages={menuPages}
            locale={locale}
            labels={{
              previousPage: menuT('previousPage'),
              nextPage: menuT('nextPage'),
              soldOut: menuT('soldOut'),
              fromVietnamese: menuT('fromVietnamese'),
              volumeLabel: menuT('menuVolumeLabel'),
              coverFooter: menuT('menuCoverFooter'),
              backCaption: menuT('backCoverCaption'),
              frontCover: menuT('frontCover'),
              backCover: menuT('backCover')
            }}
          />
        </section>
      </div>
    </main>
  );
}


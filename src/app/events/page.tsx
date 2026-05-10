import {getLocale, getTranslations} from 'next-intl/server';

import {SiteHeader} from '@/components/layout/site-header';
import {EventPolaroids} from '@/components/lounge/event-polaroids';
import type {AppLocale} from '@/i18n/config';
import {localizeEvents} from '@/lib/menu/map-menu';
import {getLoungeData} from '@/lib/server/lounge-data';

export default async function EventsPage() {
  const locale = (await getLocale()) as AppLocale;
  const [eventsT, menuT, loungeData] = await Promise.all([
    getTranslations('EventsPage'),
    getTranslations('HomePage'),
    getLoungeData()
  ]);
  const events = localizeEvents(locale, loungeData.events);

  return (
    <main className="min-h-dvh px-4 pb-10 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <SiteHeader active="events" />

        <section className="rounded-[36px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-6 backdrop-blur sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-[#a8c4b8]/45">{eventsT('eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl leading-none text-[#f5f0e3]/95">{eventsT('title')}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a8c4b8]/72">{eventsT('description')}</p>
        </section>

        <EventPolaroids
          events={events}
          locale={locale}
          title={menuT('upcomingEvents')}
          eyebrow={menuT('eventsEyebrow')}
          emptyLabel={menuT('emptyEvents')}
          fallbackBadge={menuT('fromVietnamese')}
        />
      </div>
    </main>
  );
}


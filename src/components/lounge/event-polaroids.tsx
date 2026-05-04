'use client';

import {motion} from 'framer-motion';

import type {AppLocale} from '@/i18n/config';
import {cn, formatEventDate} from '@/lib/utils';
import type {LocalizedEvent} from '@/types/domain';

const rotations = ['rotate-[-3deg]', 'rotate-[2deg]', 'rotate-[-1deg]', 'rotate-[3deg]'];

type Props = {
  events: LocalizedEvent[];
  locale: AppLocale;
  title: string;
  eyebrow: string;
  emptyLabel: string;
  fallbackBadge: string;
};

export function EventPolaroids({events, locale, title, eyebrow, emptyLabel, fallbackBadge}: Props) {
  return (
    <section id="events" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.45em] text-white/50">{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl">{title}</h2>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70 backdrop-blur">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex snap-x gap-6 overflow-x-auto pb-8 md:grid md:snap-none md:grid-cols-2 lg:grid-cols-4 lg:overflow-visible items-start">
          {events.slice(0, 4).map((event, index) => {
            const coverStyle = event.coverImageUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.2)), url(${event.coverImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }
              : undefined;

            return (
              <motion.article
                key={event.id}
                initial={{opacity: 0, y: 20, rotate: 0}}
                whileInView={{opacity: 1, y: 0, rotate: 0}}
                viewport={{once: true, amount: 0.25}}
                transition={{duration: 0.45, delay: index * 0.08}}
                className={cn(
                  'min-w-[270px] snap-center rounded-[24px] bg-page p-4 text-page-foreground shadow-[0_26px_60px_rgba(0,0,0,0.25)] lg:min-w-0',
                  rotations[index % rotations.length]
                )}
              >
                <div
                  className="flex aspect-[4/3] items-end rounded-[18px] bg-[radial-gradient(circle_at_top,_rgba(194,139,93,0.45),_transparent_45%),linear-gradient(135deg,#30251e_0%,#17110d_100%)] p-4 text-white"
                  style={coverStyle}
                >
                  <p className="font-display text-3xl leading-none">{event.performerName}</p>
                </div>

                <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-page-foreground/50">
                  {formatEventDate(event.eventDate, locale)}
                </p>
                <h3 className="mt-2 font-display text-3xl leading-none">{event.title}</h3>
                <p className="mt-2 text-sm uppercase tracking-[0.26em] text-page-foreground/55">
                  {event.performerName}
                </p>
                {event.description ? (
                  <p className="mt-3 text-sm leading-7 text-page-foreground/80">{event.description}</p>
                ) : null}
                {event.fallbackFromVietnamese && locale === 'en' ? (
                  <span className="mt-4 inline-flex rounded-full bg-accent/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent-soft">
                    {fallbackBadge}
                  </span>
                ) : null}
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {SiteHeader} from '@/components/layout/site-header';

export default async function LandingPage() {
  const [landingT, navigationT] = await Promise.all([
    getTranslations('LandingPage'),
    getTranslations('Navigation')
  ]);

  const cards = [
    {
      href: '/menu',
      title: navigationT('menu'),
      eyebrow: landingT('menuEyebrow'),
      description: landingT('menuDescription')
    },
    {
      href: '/events',
      title: navigationT('events'),
      eyebrow: landingT('eventsEyebrow'),
      description: landingT('eventsDescription')
    },
    {
      href: '/journal',
      title: navigationT('journal'),
      eyebrow: landingT('journalEyebrow'),
      description: landingT('journalDescription')
    },
    {
      href: '/admin',
      title: navigationT('admin'),
      eyebrow: landingT('adminEyebrow'),
      description: landingT('adminDescription')
    }
  ];

  return (
    <main className="min-h-dvh px-4 pb-10 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <SiteHeader active="home" />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-10">
            <p className="text-xs uppercase tracking-[0.45em] text-white/45">{landingT('eyebrow')}</p>
            <h1 className="mt-5 max-w-3xl font-display text-6xl leading-none text-white/95 sm:text-7xl">
              {landingT('title')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">{landingT('description')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-[0_14px_32px_rgba(194,139,93,0.3)]"
              >
                {landingT('primaryCta')}
              </Link>
              <Link
                href="/journal"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/80"
              >
                {landingT('secondaryCta')}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 transition hover:border-white/20 hover:bg-white/8"
              >
                <p className="text-xs uppercase tracking-[0.38em] text-white/45">{card.eyebrow}</p>
                <h2 className="mt-4 font-display text-4xl leading-none text-white/95">{card.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/68">{card.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}


import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';

import {SiteHeader} from '@/components/layout/site-header';
import {EventPolaroids} from '@/components/lounge/event-polaroids';
import type {AppLocale} from '@/i18n/config';
import type {LocalizedEvent} from '@/types/domain';

export default async function LandingPage() {
  const [landingT, locale] = await Promise.all([
    getTranslations('LandingPage'),
    getLocale()
  ]);

  const mockEvents: LocalizedEvent[] = [
    {
      id: '1',
      title: 'Acoustic Night',
      performerName: 'Vicky Nhung',
      eventDate: new Date(Date.now() + 86400000 * 3).toISOString(), // +3 days
      description: 'An intimate evening featuring acoustic covers of classic love songs.',
      coverImageUrl: 'https://images.unsplash.com/photo-1516280440502-628d66cb63a5?q=80&w=600&auto=format&fit=crop',
      fallbackFromVietnamese: false
    },
    {
      id: '2',
      title: 'Minishow',
      performerName: 'Bùi Anh Tuấn',
      eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      description: 'The return of the prince of ballads to Lounge Brew.',
      coverImageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=600&auto=format&fit=crop',
      fallbackFromVietnamese: true
    },
    {
      id: '3',
      title: 'Weekend Jazz',
      performerName: 'The Hà Nội Ensemble',
      eventDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      description: 'Smooth jazz to pair with your signature drinks.',
      coverImageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop',
      fallbackFromVietnamese: false
    }
  ];

  return (
    <main className="min-h-dvh">
      <div className="absolute left-0 right-0 top-0 z-50 px-4 pt-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <SiteHeader active="home" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(15,123,95,0.15),_transparent_65%),linear-gradient(180deg,#0e1f1a_0%,#070d0b_100%)]" />
        <div className="relative z-10 flex max-w-4xl flex-col items-center gap-6 mt-16">
          <p className="text-xs uppercase tracking-[0.45em] text-accent-soft">{landingT('heroSubtitle')}</p>
          <h1 className="font-display text-5xl leading-[1.1] text-[#f5f0e3] sm:text-7xl md:text-8xl">
            {landingT('heroTitle')}
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="#events"
              className="rounded-full bg-accent px-8 py-4 text-sm font-medium text-[#f5f0e3] shadow-[0_14px_32px_rgba(15,123,95,0.3)] transition hover:brightness-110"
            >
              {landingT('eventsTitle')}
            </Link>
          </div>
        </div>
      </section>

      {/* Vibe / Intro Section */}
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl text-[#f5f0e3] sm:text-5xl">{landingT('vibeTitle')}</h2>
        <p className="mt-8 text-lg leading-8 text-[#a8c4b8]/80 sm:text-xl">
          {landingT('vibeDescription')}
        </p>
      </section>

      {/* Live Events Section */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
        <EventPolaroids
          events={mockEvents}
          locale={locale as AppLocale}
          title={landingT('eventsTitle')}
          eyebrow={landingT('eventsEyebrow')}
          emptyLabel={landingT('eventsEmpty')}
          fallbackBadge="VI"
        />
      </section>

      {/* Menu CTA Section */}
      <section className="mx-auto my-20 max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-10 text-center backdrop-blur sm:p-20">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,123,95,0.12),_transparent_50%)]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-[0.45em] text-[#a8c4b8]/50">{landingT('menuCtaEyebrow')}</p>
            <h2 className="mt-6 font-display text-4xl leading-tight text-[#f5f0e3]/95 sm:text-6xl">{landingT('menuCtaTitle')}</h2>
            <p className="mt-6 text-lg leading-8 text-[#f5f0e3]/70">{landingT('menuCtaDescription')}</p>
            <Link
              href="/menu"
              className="mt-10 inline-block rounded-full bg-[#0f7b5f]/20 px-8 py-4 text-sm font-medium text-[#f5f0e3] transition hover:bg-[#0f7b5f]/35"
            >
              {landingT('menuCtaButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer / Venue Information Section */}
      <footer className="mt-32 border-t border-[#f5f0e3]/5 bg-[#070d0b]/60 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 text-center md:grid-cols-3 md:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-[#a8c4b8]/45">{landingT('footerEyebrow')}</p>
              <h3 className="mt-4 font-display text-4xl text-[#f5f0e3]/90">{landingT('footerTitle')}</h3>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-[0.25em] text-[#a8c4b8]/45">{landingT('footerHotlineLabel')}</h4>
              <p className="text-lg text-[#f5f0e3]/85">{landingT('footerHotlines')}</p>
              <div className="pt-4">
                <h4 className="text-xs uppercase tracking-[0.25em] text-[#a8c4b8]/45">{landingT('footerHoursLabel')}</h4>
                <p className="mt-2 text-lg text-[#f5f0e3]/85">{landingT('footerHours')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-[0.25em] text-[#a8c4b8]/45">Location</h4>
              <p className="text-lg text-[#f5f0e3]/85">{landingT('footerAddress')}</p>
            </div>
          </div>
          <div className="mt-20 border-t border-[#f5f0e3]/5 pt-8 text-center text-xs text-[#a8c4b8]/30">
            © {new Date().getFullYear()} Lounge Brew. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

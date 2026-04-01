import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {cn} from '@/lib/utils';

import {LocaleSwitcher} from './locale-switcher';

type Props = {
  active?: 'home' | 'menu' | 'events' | 'journal' | 'admin';
};

export async function SiteHeader({active}: Props) {
  const t = await getTranslations('Navigation');

  const items = [
    {href: '/', key: 'home', label: t('home')},
    {href: '/menu', key: 'menu', label: t('menu')},
    {href: '/events', key: 'events', label: t('events')},
    {href: '/journal', key: 'journal', label: t('journal')},
    {href: '/admin', key: 'admin', label: t('admin')}
  ] as const;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
      <Link href="/" className="space-y-1">
        <p className="text-xs uppercase tracking-[0.42em] text-white/45">{t('eyebrow')}</p>
        <p className="font-display text-3xl leading-none">{t('brand')}</p>
      </Link>

      <div className="flex flex-wrap items-center gap-2 text-sm text-white/75">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white',
              active === item.key && 'bg-white/10 text-white'
            )}
          >
            {item.label}
          </Link>
        ))}
        <LocaleSwitcher />
      </div>
    </header>
  );
}

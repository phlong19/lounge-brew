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
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 px-5 py-3 backdrop-blur-md">
      <Link href="/" className="space-y-1">
        <p className="text-xs uppercase tracking-[0.42em] text-[#a8c4b8]/70">{t('eyebrow')}</p>
        <p className="font-display text-3xl leading-none text-[#f5f0e3]">{t('brand')}</p>
      </Link>

      <div className="flex flex-wrap items-center gap-2 text-sm text-[#f5f0e3]/75">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'rounded-full px-3 py-2 transition hover:bg-[#0f7b5f]/15 hover:text-[#f5f0e3]',
              active === item.key && 'bg-[#0f7b5f]/25 text-[#f5f0e3]'
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

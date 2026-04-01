'use client';

import {useRouter} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {useTransition} from 'react';

import {locales} from '@/i18n/config';
import {cn} from '@/lib/utils';

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const t = useTranslations('Navigation');
  const [isPending, startTransition] = useTransition();

  async function handleLocaleChange(nextLocale: (typeof locales)[number]) {
    const response = await fetch('/api/locale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({locale: nextLocale})
    });

    if (!response.ok) {
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs backdrop-blur">
      <span className="px-2 text-white/60">{t('language')}</span>
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => void handleLocaleChange(locale)}
            disabled={isPending || isActive}
            className={cn(
              'rounded-full px-3 py-1.5 font-medium uppercase tracking-[0.25em] transition',
              isActive
                ? 'bg-accent text-white shadow-[0_8px_24px_rgba(194,139,93,0.35)]'
                : 'text-white/70 hover:text-white',
              isPending && 'opacity-60'
            )}
            aria-pressed={isActive}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}

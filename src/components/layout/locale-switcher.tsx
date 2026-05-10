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
    <div className="inline-flex items-center gap-1 rounded-full border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-1 text-xs backdrop-blur">
      <span className="px-2 text-[#a8c4b8]/60">{t('language')}</span>
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
                ? 'bg-accent text-[#f5f0e3] shadow-[0_8px_24px_rgba(15,123,95,0.35)]'
                : 'text-[#f5f0e3]/70 hover:text-[#f5f0e3]',
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

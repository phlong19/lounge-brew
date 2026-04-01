import {getTranslations} from 'next-intl/server';
import Link from 'next/link';

import {createSupabaseServerClient} from '@/lib/supabase/server';

type Props = {
  children: React.ReactNode;
};

export default async function AdminLayout({children}: Props) {
  const t = await getTranslations('Admin');
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: {user}
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <main className="min-h-dvh px-4 py-8 md:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-[36px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <p className="text-xs uppercase tracking-[0.45em] text-white/45">{t('controlRoom')}</p>
            <h1 className="mt-4 font-display text-5xl">{t('title')}</h1>
            <p className="mt-4 text-sm leading-7 text-white/70">{t('authRequired')}</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
            >
              {t('backToSite')}
            </Link>
          </div>
        </main>
      );
    }
  }

  return (
    <main className="min-h-dvh px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {!supabase ? (
          <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
            {t('previewMode')}
          </div>
        ) : null}
        {children}
      </div>
    </main>
  );
}


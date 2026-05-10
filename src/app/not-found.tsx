import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

export default async function AppNotFoundPage() {
  const t = await getTranslations('Common');

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 md:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-[36px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-8 text-center backdrop-blur">
        <p className="text-xs uppercase tracking-[0.45em] text-[#a8c4b8]/45">404</p>
        <h1 className="mt-4 font-display text-5xl text-[#f5f0e3]/95">{t('notFound')}</h1>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-[#f5f0e3]"
        >
          {t('backHome')}
        </Link>
      </div>
    </main>
  );
}

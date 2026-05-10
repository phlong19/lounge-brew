import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {SiteHeader} from '@/components/layout/site-header';
import {FlipbookMenu} from '@/components/lounge/flipbook-menu';
import {buildImageMenuPages} from '@/lib/menu/build-menu-pages';

export default async function MenuPage() {
  const [menuT, navigationT] = await Promise.all([
    getTranslations('HomePage'),
    getTranslations('Navigation'),
  ]);

  const menuPages = buildImageMenuPages();

  return (
    <main className="min-h-dvh px-4 pb-10 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <SiteHeader active="menu" />

        <section className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)] xl:items-start">
          <FlipbookMenu
            pages={menuPages}
            labels={{
              previousPage: menuT('previousPage'),
              nextPage: menuT('nextPage'),
              frontCover: menuT('frontCover'),
              backCover: menuT('backCover'),
            }}
          />
        </section>
      </div>
    </main>
  );
}

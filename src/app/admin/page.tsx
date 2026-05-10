import {getTranslations} from 'next-intl/server';

import {BilingualFieldPair} from '@/components/admin/bilingual-field';
import {SiteHeader} from '@/components/layout/site-header';

export default async function AdminPage() {
  const t = await getTranslations('Admin');

  return (
    <div className="space-y-6">
      <SiteHeader active="admin" />

      <header className="flex flex-col gap-4 rounded-[36px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-6 backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-[#a8c4b8]/45">{t('controlRoom')}</p>
          <h1 className="mt-4 font-display text-5xl text-[#f5f0e3]/95">{t('title')}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a8c4b8]/70">{t('description')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border border-[#f5f0e3]/10 px-5 py-3 text-sm font-medium text-[#f5f0e3]/80"
          >
            {t('saveDraft')}
          </button>
          <button
            type="button"
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-[#f5f0e3] shadow-[0_14px_32px_rgba(15,123,95,0.3)]"
          >
            {t('publish')}
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-6 backdrop-blur">
          <h2 className="font-display text-4xl">{t('categories')}</h2>
          <div className="mt-6 space-y-6">
            <BilingualFieldPair
              legend={t('categories')}
              vietnameseLabel={`${t('vietnamese')} · Tên danh mục`}
              englishLabel={`${t('english')} · Category name`}
              vietnameseValue="Cà phê"
              englishValue="Coffee"
              vietnamesePlaceholder="Nhập tên danh mục"
              englishPlaceholder="Leave blank to fallback"
            />
            <BilingualFieldPair
              legend={t('tabs')}
              vietnameseLabel={`${t('vietnamese')} · Nhãn tab`}
              englishLabel={`${t('english')} · Tab label`}
              vietnameseValue="Cà phê"
              englishValue="Coffee"
              vietnamesePlaceholder="Nhãn tab"
              englishPlaceholder="Tab label"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-[#a8c4b8]/70">
                <span>{t('tabColor')}</span>
                <input
                  defaultValue="#9a6b43"
                  className="w-full rounded-2xl border border-[#f5f0e3]/10 bg-[#0c1a17]/40 px-4 py-3 text-sm text-[#f5f0e3] outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm text-[#a8c4b8]/70">
                <span>{t('sortOrder')}</span>
                <input
                  defaultValue="1"
                  className="w-full rounded-2xl border border-[#f5f0e3]/10 bg-[#0c1a17]/40 px-4 py-3 text-sm text-[#f5f0e3] outline-none"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-6 backdrop-blur">
          <h2 className="font-display text-4xl">{t('menuItems')}</h2>
          <div className="mt-6 space-y-6">
            <BilingualFieldPair
              legend={t('menuItems')}
              vietnameseLabel={`${t('vietnamese')} · Tên món`}
              englishLabel={`${t('english')} · Item name`}
              vietnameseValue="Cold Brew Đêm"
              englishValue=""
              vietnamesePlaceholder="Tên món"
              englishPlaceholder="Blank keeps VI fallback"
            />
            <BilingualFieldPair
              legend={t('descriptions')}
              vietnameseLabel={`${t('vietnamese')} · Mô tả`}
              englishLabel={`${t('english')} · Description`}
              vietnameseValue="Ủ lạnh 18 giờ, hậu vị chocolate và mận khô."
              englishValue=""
              textarea
            />
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="grid gap-2 text-sm text-[#a8c4b8]/70">
                <span>{t('price')}</span>
                <input
                  defaultValue="85000"
                  className="w-full rounded-2xl border border-[#f5f0e3]/10 bg-[#0c1a17]/40 px-4 py-3 text-sm text-[#f5f0e3] outline-none"
                />
              </label>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-[#f5f0e3]/10 bg-[#0c1a17]/40 px-4 py-3 text-sm text-[#f5f0e3]/80">
                <input type="checkbox" className="size-4 accent-[var(--accent)]" />
                {t('soldOut')}
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-6 backdrop-blur">
          <h2 className="font-display text-4xl">{t('events')}</h2>
          <div className="mt-6 space-y-6">
            <BilingualFieldPair
              legend={t('events')}
              vietnameseLabel={`${t('vietnamese')} · Tiêu đề`}
              englishLabel={`${t('english')} · Title`}
              vietnameseValue="Đêm Jazz Mộc"
              englishValue="Acoustic Jazz Night"
            />
            <BilingualFieldPair
              legend={t('descriptions')}
              vietnameseLabel={`${t('vietnamese')} · Mô tả`}
              englishLabel={`${t('english')} · Description`}
              vietnameseValue="Một set jazz nhẹ nhàng cho không gian tối thứ Tư."
              englishValue="A soft midweek jazz set for a dimly lit room."
              textarea
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-[#a8c4b8]/70">
                <span>{t('performer')}</span>
                <input
                  defaultValue="An Tran Quartet"
                  className="w-full rounded-2xl border border-[#f5f0e3]/10 bg-[#0c1a17]/40 px-4 py-3 text-sm text-[#f5f0e3] outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm text-[#a8c4b8]/70">
                <span>{t('date')}</span>
                <input
                  defaultValue="2026-04-15 19:30"
                  className="w-full rounded-2xl border border-[#f5f0e3]/10 bg-[#0c1a17]/40 px-4 py-3 text-sm text-[#f5f0e3] outline-none"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-6 backdrop-blur">
          <h2 className="font-display text-4xl">{t('articles')}</h2>
          <div className="mt-6 space-y-6">
            <BilingualFieldPair
              legend={t('articles')}
              vietnameseLabel={`${t('vietnamese')} · Tiêu đề`}
              englishLabel={`${t('english')} · Title`}
              vietnameseValue="Thiết kế thực đơn như một cuốn sách sống"
              englishValue="Designing a menu like a living book"
            />
            <BilingualFieldPair
              legend={t('content')}
              vietnameseLabel={`${t('vietnamese')} · Nội dung`}
              englishLabel={`${t('english')} · Content`}
              vietnameseValue="<p>Chúng tôi muốn thực đơn không chỉ là danh sách món...</p>"
              englishValue="<p>We wanted the menu to feel less like a list...</p>"
              textarea
            />
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#f5f0e3]/10 bg-[#0f7b5f]/8 p-6 backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-4xl">{t('sorting')}</h2>
            <p className="mt-2 text-sm leading-7 text-[#a8c4b8]/70">{t('dragHint')}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {['Espresso Tonic', 'Sea Salt Latte', 'Cold Brew Đêm'].map((item, index) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-[24px] border border-[#f5f0e3]/10 bg-[#0c1a17]/40 px-4 py-4"
              draggable
            >
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.28em] text-[#a8c4b8]/40">#{index + 1}</p>
                <p className="font-medium text-[#f5f0e3]/85">{item}</p>
              </div>
              <span className="text-[#a8c4b8]/35">⋮⋮</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


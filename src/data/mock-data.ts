import type {ArticleRow, CategoryRow, EventRow, MenuItemRow} from '@/types/domain';

export const mockCategories: CategoryRow[] = [
  {
    id: 'coffee',
    name_vi: 'Cà phê',
    name_en: 'Coffee',
    tab_label_vi: 'Cà phê',
    tab_label_en: 'Coffee',
    tab_color: '#9a6b43',
    sort_order: 1
  },
  {
    id: 'tea',
    name_vi: 'Trà & Matcha',
    name_en: 'Tea & Matcha',
    tab_label_vi: 'Trà',
    tab_label_en: 'Tea',
    tab_color: '#5e7f5b',
    sort_order: 2
  },
  {
    id: 'signatures',
    name_vi: 'Signature',
    name_en: '',
    tab_label_vi: 'Signature',
    tab_label_en: '',
    tab_color: '#7f5e7c',
    sort_order: 3
  }
];

export const mockMenuItems: MenuItemRow[] = [
  {
    id: 'espresso-tonic',
    category_id: 'coffee',
    name_vi: 'Espresso Tonic',
    name_en: 'Espresso Tonic',
    description_vi: 'Espresso lạnh, tonic thủ công và cam vàng.',
    description_en: 'Chilled espresso, craft tonic and orange peel.',
    price: 78000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'sea-salt-latte',
    category_id: 'coffee',
    name_vi: 'Latte Muối Biển',
    name_en: 'Sea Salt Latte',
    description_vi: 'Vị kem mặn nhẹ trên nền espresso đậm.',
    description_en: 'A silky salty cream over a deep espresso base.',
    price: 82000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'cold-brew-night',
    category_id: 'coffee',
    name_vi: 'Cold Brew Đêm',
    name_en: null,
    description_vi: 'Ủ lạnh 18 giờ, hậu vị chocolate và mận khô.',
    description_en: null,
    price: 85000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'oolong-foam',
    category_id: 'tea',
    name_vi: 'Oolong Kem Sữa',
    name_en: 'Oolong Milk Foam',
    description_vi: 'Oolong rang thơm với lớp kem sữa nhẹ.',
    description_en: 'Roasted oolong topped with light milk foam.',
    price: 76000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'matcha-cloud',
    category_id: 'tea',
    name_vi: 'Matcha Cloud',
    name_en: 'Matcha Cloud',
    description_vi: 'Matcha nghi thức, kem lạnh và gạo rang.',
    description_en: 'Ceremonial matcha, cold cream and toasted rice.',
    price: 92000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'hibiscus-soda',
    category_id: 'tea',
    name_vi: 'Soda Hibiscus',
    name_en: 'Hibiscus Soda',
    description_vi: 'Chua nhẹ, thanh mát, hợp cho buổi chiều.',
    description_en: 'Bright, sparkling and perfect for afternoons.',
    price: 68000,
    is_sold_out: true,
    sort_order: 3
  },
  {
    id: 'midnight-cacao',
    category_id: 'signatures',
    name_vi: 'Midnight Cacao',
    name_en: 'Midnight Cacao',
    description_vi: 'Cacao đậm, espresso và quế khói.',
    description_en: 'Dark cacao, espresso and smoked cinnamon.',
    price: 98000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'saigon-afterglow',
    category_id: 'signatures',
    name_vi: 'Sài Gòn Afterglow',
    name_en: 'Saigon Afterglow',
    description_vi: 'Dứa nướng, cascara và lạnh sâu.',
    description_en: 'Charred pineapple, cascara and a crisp finish.',
    price: 99000,
    is_sold_out: false,
    sort_order: 2
  }
];

export const mockEvents: EventRow[] = [
  {
    id: 'event-1',
    title_vi: 'Đêm Jazz Mộc',
    title_en: 'Acoustic Jazz Night',
    performer_name: 'An Tran Quartet',
    event_date: '2026-04-15T19:30:00+07:00',
    description_vi: 'Một set jazz nhẹ nhàng cho không gian tối thứ Tư.',
    description_en: 'A soft midweek jazz set for a dimly lit room.',
    cover_image_url: null,
    is_active: true
  },
  {
    id: 'event-2',
    title_vi: 'Listening Session Vinyl',
    title_en: null,
    performer_name: 'DJ Nhi',
    event_date: '2026-04-21T20:00:00+07:00',
    description_vi: 'Chọn đĩa, nghe trọn album và nói chuyện về âm thanh.',
    description_en: null,
    cover_image_url: null,
    is_active: true
  }
];

export const mockArticles: ArticleRow[] = [
  {
    id: 'article-1',
    title_vi: 'Thiết kế thực đơn như một cuốn sách sống',
    title_en: 'Designing a menu like a living book',
    slug: 'designing-a-menu-like-a-living-book',
    content_vi: '<p>Chúng tôi muốn thực đơn không chỉ là danh sách món, mà là một trải nghiệm chạm, lật, và khám phá theo nhịp riêng của từng vị khách.</p><p>Mỗi chuyên mục bắt đầu như một chương mới, có nhịp, có khoảng thở và có cảm giác vật lý.</p>',
    content_en: '<p>We wanted the menu to feel less like a list and more like a tactile ritual of turning, pausing and discovering.</p><p>Each category begins like a new chapter with its own rhythm, air and physicality.</p>',
    thumbnail_url: null,
    published_at: '2026-03-20T10:00:00+07:00'
  },
  {
    id: 'article-2',
    title_vi: 'Âm thanh ảnh hưởng vị giác như thế nào',
    title_en: null,
    slug: 'how-sound-shapes-taste',
    content_vi: '<p>Âm thanh nền tác động đến cách ta cảm nhận vị ngọt, vị chua và cả tốc độ thưởng thức đồ uống.</p><p>Tại Lounge Brew, playlist và thực đơn được sắp đặt cùng nhau như một bản phối.</p>',
    content_en: null,
    thumbnail_url: null,
    published_at: '2026-03-10T10:00:00+07:00'
  }
];


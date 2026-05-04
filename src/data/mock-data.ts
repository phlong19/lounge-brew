import type {ArticleRow, CategoryRow, EventRow, MenuItemRow} from '@/types/domain';

export const mockCategories: CategoryRow[] = [
  {
    id: 'fresh-juice',
    name_vi: 'Nước ép',
    name_en: 'Fresh Juice',
    tab_label_vi: 'Nước ép',
    tab_label_en: 'Juice',
    tab_color: '#c77f46',
    sort_order: 1
  },
  {
    id: 'tea',
    name_vi: 'Trà',
    name_en: 'Tea',
    tab_label_vi: 'Trà',
    tab_label_en: 'Tea',
    tab_color: '#5e7f5b',
    sort_order: 2
  },
  {
    id: 'mix-juice',
    name_vi: 'Mix Juice',
    name_en: 'Mix Juice',
    tab_label_vi: 'Mix',
    tab_label_en: 'Mix',
    tab_color: '#b36d88',
    sort_order: 3
  },
  {
    id: 'cocktail',
    name_vi: 'Cocktail',
    name_en: 'Cocktail',
    tab_label_vi: 'Cocktail',
    tab_label_en: 'Cocktail',
    tab_color: '#6d6aa8',
    sort_order: 4
  },
  {
    id: 'mix-drink',
    name_vi: 'Mix Drink',
    name_en: 'Mix Drink',
    tab_label_vi: 'Mix Bar',
    tab_label_en: 'Mix Bar',
    tab_color: '#7f5e7c',
    sort_order: 5
  },
  {
    id: 'beer-soft-fruit',
    name_vi: 'Bia & Nước ngọt',
    name_en: 'Beer & Soft Drinks',
    tab_label_vi: 'Bia',
    tab_label_en: 'Beer',
    tab_color: '#7a8b4b',
    sort_order: 6
  },
  {
    id: 'snacks',
    name_vi: 'Đồ ăn nhẹ',
    name_en: 'Snacks',
    tab_label_vi: 'Snack',
    tab_label_en: 'Snack',
    tab_color: '#9a6b43',
    sort_order: 7
  },
  {
    id: 'spirits',
    name_vi: 'Rượu mạnh',
    name_en: 'Spirits',
    tab_label_vi: 'Spirit',
    tab_label_en: 'Spirit',
    tab_color: '#4f6478',
    sort_order: 8
  },
  {
    id: 'wine',
    name_vi: 'Rượu vang',
    name_en: 'Wine',
    tab_label_vi: 'Wine',
    tab_label_en: 'Wine',
    tab_color: '#8f4d5d',
    sort_order: 9
  },
  {
    id: 'appetizer-salad',
    name_vi: 'Khai vị & Salad',
    name_en: 'Appetizer & Salad',
    tab_label_vi: 'Khai vị',
    tab_label_en: 'Starter',
    tab_color: '#63845c',
    sort_order: 10
  },
  {
    id: 'beef-pork',
    name_vi: 'Bò & Heo',
    name_en: 'Beef & Pork',
    tab_label_vi: 'Bò heo',
    tab_label_en: 'Meat',
    tab_color: '#944f45',
    sort_order: 11
  },
  {
    id: 'chicken',
    name_vi: 'Gà',
    name_en: 'Chicken',
    tab_label_vi: 'Gà',
    tab_label_en: 'Chicken',
    tab_color: '#b0793f',
    sort_order: 12
  },
  {
    id: 'rice-pasta',
    name_vi: 'Cơm & Mỳ Ý',
    name_en: 'Rice & Pasta',
    tab_label_vi: 'Cơm',
    tab_label_en: 'Rice',
    tab_color: '#6c7f74',
    sort_order: 13
  }
];

export const mockMenuItems: MenuItemRow[] = [
  {
    id: 'nuoc-chanh',
    category_id: 'fresh-juice',
    name_vi: 'Nước chanh',
    name_en: 'Lemonade',
    description_vi: null,
    description_en: null,
    price: 158000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'nuoc-cam',
    category_id: 'fresh-juice',
    name_vi: 'Nước cam',
    name_en: 'Orange Juice',
    description_vi: null,
    description_en: null,
    price: 158000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'nuoc-dua',
    category_id: 'fresh-juice',
    name_vi: 'Nước dứa',
    name_en: 'Pineapple Juice',
    description_vi: null,
    description_en: null,
    price: 148000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'nuoc-tao',
    category_id: 'fresh-juice',
    name_vi: 'Nước táo',
    name_en: 'Apple Juice',
    description_vi: null,
    description_en: null,
    price: 170000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'tra-tao',
    category_id: 'tea',
    name_vi: 'Trà táo',
    name_en: 'Apple Tea',
    description_vi: null,
    description_en: null,
    price: 148000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'tra-vai-hoa-hong',
    category_id: 'tea',
    name_vi: 'Trà vải hoa hồng',
    name_en: 'Lychee Rose Tea',
    description_vi: null,
    description_en: null,
    price: 148000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'tra-thao-moc-nong',
    category_id: 'tea',
    name_vi: 'Trà thảo mộc nóng',
    name_en: 'Herbal Tea (Hot)',
    description_vi: null,
    description_en: null,
    price: 148000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'tra-cherry-buoi-hong',
    category_id: 'tea',
    name_vi: 'Trà cherry bưởi hồng',
    name_en: 'Pink Grapefruit Cherry Tea',
    description_vi: null,
    description_en: null,
    price: 148000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'tra-xoai-nhiet-doi',
    category_id: 'tea',
    name_vi: 'Trà xoài nhiệt đới',
    name_en: 'Tropical Mango Tea',
    description_vi: null,
    description_en: null,
    price: 148000,
    is_sold_out: false,
    sort_order: 5
  },
  {
    id: 'sunrise',
    category_id: 'mix-juice',
    name_vi: 'Sunrise',
    name_en: 'Sunrise',
    description_vi: 'Bưởi, cam, nước táo, lựu và sữa chua.',
    description_en: 'Grapefruit, orange, apple juice, pomegranate and yogurt.',
    price: 168000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'tropical-region',
    category_id: 'mix-juice',
    name_vi: 'Tropical Region',
    name_en: 'Tropical Region',
    description_vi: 'Cam, dứa, chanh leo và lựu.',
    description_en: 'Orange, pineapple, passion fruit and pomegranate.',
    price: 168000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'snow-white',
    category_id: 'mix-juice',
    name_vi: 'Snow White',
    name_en: 'Snow White',
    description_vi: 'Dứa, cốt dừa và sữa béo.',
    description_en: 'Pineapple, coconut milk and cream.',
    price: 168000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'eden',
    category_id: 'mix-juice',
    name_vi: 'Eden',
    name_en: 'Eden',
    description_vi: 'Táo xanh, syrup táo xanh và lá dứa.',
    description_en: 'Green apple, green apple syrup and pandan syrup.',
    price: 178000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'love-wine-tea',
    category_id: 'cocktail',
    name_vi: 'Love Wine Tea',
    name_en: 'Love Wine Tea',
    description_vi: 'Gin, trà nhài, trà thảo mộc, hoa hồng, rượu mùi dâu và chanh.',
    description_en: 'Gin, jasmine tea, herbal tea, rose syrup, strawberry liqueur and lime.',
    price: 178000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'blue-lady',
    category_id: 'cocktail',
    name_vi: 'Blue Lady',
    name_en: 'Blue Lady',
    description_vi: 'Blue curacao, gin, chanh và trứng.',
    description_en: 'Blue curacao, gin, lime and egg.',
    price: 198000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'coconut-sunset',
    category_id: 'cocktail',
    name_vi: 'Coconut Sunset',
    name_en: 'Coconut Sunset',
    description_vi: 'Bacardi trắng, dứa, cam, cốt dừa và lựu.',
    description_en: 'White Bacardi, pineapple, orange, coconut milk and pomegranate.',
    price: 198000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'perfect-pornstar-martini',
    category_id: 'cocktail',
    name_vi: 'Perfect Pornstar Martini',
    name_en: 'Perfect Pornstar Martini',
    description_vi: 'Chanh leo, vodka, chanh, dứa và vanilla.',
    description_en: 'Passion fruit, vodka, lime, pineapple and vanilla.',
    price: 198000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'tequila-sunrise',
    category_id: 'cocktail',
    name_vi: 'Tequila Sunrise',
    name_en: 'Tequila Sunrise',
    description_vi: 'Tequila, cam và lựu.',
    description_en: 'Tequila, orange and pomegranate.',
    price: 198000,
    is_sold_out: false,
    sort_order: 5
  },
  {
    id: 'sex-on-the-beach',
    category_id: 'cocktail',
    name_vi: 'Sex On The Beach',
    name_en: 'Sex On The Beach',
    description_vi: 'Vodka, peach liqueur, cranberry, lựu và dứa.',
    description_en: 'Vodka, peach liqueur, cranberry, pomegranate and pineapple.',
    price: 198000,
    is_sold_out: false,
    sort_order: 6
  },
  {
    id: 'blue-lagoon',
    category_id: 'cocktail',
    name_vi: 'Blue Lagoon',
    name_en: 'Blue Lagoon',
    description_vi: 'Blue curacao, vodka, triple sec, chanh và soda.',
    description_en: 'Blue curacao, vodka, triple sec, lime and soda.',
    price: 198000,
    is_sold_out: false,
    sort_order: 7
  },
  {
    id: 'jagermeister-red-bull',
    category_id: 'mix-drink',
    name_vi: 'Jagermeister Red Bull',
    name_en: 'Jagermeister Red Bull',
    description_vi: null,
    description_en: null,
    price: 158000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'gin-gordons-tonic',
    category_id: 'mix-drink',
    name_vi: "Gin Gordon's Tonic",
    name_en: "Gin Gordon's Tonic",
    description_vi: null,
    description_en: null,
    price: 158000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'tequila-soft',
    category_id: 'mix-drink',
    name_vi: 'Tequila 7Up',
    name_en: 'Tequila 7Up',
    description_vi: 'Tequila với 7Up, Coca hoặc Pepsi.',
    description_en: 'Tequila with 7Up, Coca or Pepsi.',
    price: 158000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'whisky-red-label',
    category_id: 'mix-drink',
    name_vi: 'Whisky Red Label',
    name_en: 'Whisky Red Label',
    description_vi: 'Red Label với soda, Coca hoặc tonic.',
    description_en: 'Red Label with soda, Coca or tonic.',
    price: 158000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'tiger-crystal',
    category_id: 'beer-soft-fruit',
    name_vi: 'Tiger Crystal',
    name_en: 'Tiger Crystal',
    description_vi: null,
    description_en: null,
    price: 125000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'heineken-silver',
    category_id: 'beer-soft-fruit',
    name_vi: 'Heineken Silver',
    name_en: 'Heineken Silver',
    description_vi: null,
    description_en: null,
    price: 125000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'corona-extra',
    category_id: 'beer-soft-fruit',
    name_vi: 'Corona Extra',
    name_en: 'Corona Extra',
    description_vi: null,
    description_en: null,
    price: 145000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'pepsi',
    category_id: 'beer-soft-fruit',
    name_vi: 'Pepsi',
    name_en: 'Pepsi',
    description_vi: null,
    description_en: null,
    price: 95000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'hoa-qua-tuoi-tong-hop',
    category_id: 'beer-soft-fruit',
    name_vi: 'Hoa quả tươi tổng hợp',
    name_en: 'Mixed Fresh Fruits',
    description_vi: null,
    description_en: null,
    price: 298000,
    is_sold_out: false,
    sort_order: 5
  },
  {
    id: 'lac-chien-toi-ot',
    category_id: 'snacks',
    name_vi: 'Lạc chiên tỏi ớt',
    name_en: 'Peanut',
    description_vi: null,
    description_en: null,
    price: 55000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'hat-dieu',
    category_id: 'snacks',
    name_vi: 'Hạt điều',
    name_en: 'Cashew Nut',
    description_vi: null,
    description_en: null,
    price: 108000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'bo-kho',
    category_id: 'snacks',
    name_vi: 'Bò khô',
    name_en: 'Dried Beef',
    description_vi: null,
    description_en: null,
    price: 108000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'phomai-que-nga-hun-khoi',
    category_id: 'snacks',
    name_vi: 'Phomai que Nga hun khói',
    name_en: 'Russian smoked cheese sticks',
    description_vi: null,
    description_en: null,
    price: 198000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'gin-gordons-bottle',
    category_id: 'spirits',
    name_vi: "Gin Gordon's",
    name_en: "Gin Gordon's",
    description_vi: null,
    description_en: null,
    price: 1200000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'jack-daniels-bottle',
    category_id: 'spirits',
    name_vi: 'Jack Daniels',
    name_en: 'Jack Daniels',
    description_vi: null,
    description_en: null,
    price: 1650000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'chivas-18',
    category_id: 'spirits',
    name_vi: 'Chivas 18 YO',
    name_en: 'Chivas 18 YO',
    description_vi: null,
    description_en: null,
    price: 3250000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'macallan-12',
    category_id: 'spirits',
    name_vi: 'Macallan 12 YO',
    name_en: 'Macallan 12 YO',
    description_vi: null,
    description_en: null,
    price: 4800000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'il-pumo-malvasia',
    category_id: 'wine',
    name_vi: 'Il Pumo Malvasia Sauvignon Blanc',
    name_en: 'Il Pumo Malvasia Sauvignon Blanc',
    description_vi: 'Italian wine.',
    description_en: 'Italian wine.',
    price: 998000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'il-pumo-negroamaro',
    category_id: 'wine',
    name_vi: 'Il Pumo Negroamaro',
    name_en: 'Il Pumo Negroamaro',
    description_vi: 'Italian wine.',
    description_en: 'Italian wine.',
    price: 998000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'barramundi-shiraz',
    category_id: 'wine',
    name_vi: 'Barramundi Shiraz',
    name_en: 'Barramundi Shiraz',
    description_vi: 'Australian wine.',
    description_en: 'Australian wine.',
    price: 998000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'santa-carolina-cabernet',
    category_id: 'wine',
    name_vi: 'Santa Carolina Reserva Cabernet Sauvignon',
    name_en: 'Santa Carolina Reserva Cabernet Sauvignon',
    description_vi: 'Chilean wine.',
    description_en: 'Chilean wine.',
    price: 1058000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'ca-chua-bi',
    category_id: 'appetizer-salad',
    name_vi: 'Cà chua bi',
    name_en: 'Cherry Tomato',
    description_vi: null,
    description_en: null,
    price: 98000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'banh-mi-nuong-trixie',
    category_id: 'appetizer-salad',
    name_vi: 'Bánh mì nướng Trixie',
    name_en: 'Garlic Bread Trixie Style',
    description_vi: null,
    description_en: null,
    price: 125000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'nam-chien-sot-curry-do',
    category_id: 'appetizer-salad',
    name_vi: 'Nấm chiên sốt curry đỏ',
    name_en: 'Seafood mushrooms tempura with red curry sauce',
    description_vi: null,
    description_en: null,
    price: 185000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'salad-ca-ngu',
    category_id: 'appetizer-salad',
    name_vi: 'Salad cá ngừ',
    name_en: 'Tuna Salad',
    description_vi: null,
    description_en: null,
    price: 218000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'bo-uc-tuoi-cai-bang',
    category_id: 'beef-pork',
    name_vi: 'Bò Úc tươi cái bang',
    name_en: 'Deep fried AUS beef cubes',
    description_vi: 'Ăn cùng muối biển và ớt xanh.',
    description_en: 'Served with sea salt and green chili.',
    price: 438000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'bo-uc-nuong-tieu-den',
    category_id: 'beef-pork',
    name_vi: 'Bò Úc nướng sốt tiêu đen',
    name_en: 'Grilled AUS beef with black pepper sauce',
    description_vi: null,
    description_en: null,
    price: 478000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'bo-sakura-vang-do',
    category_id: 'beef-pork',
    name_vi: 'Bò Sakura nướng sốt vang đỏ',
    name_en: 'Grilled Sakura beef with red wine sauce',
    description_vi: null,
    description_en: null,
    price: 648000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'ma-dao-heo-cai-bang',
    category_id: 'beef-pork',
    name_vi: 'Má đào heo cái bang',
    name_en: 'Deep fried premium pork rosy-cheeks cubes',
    description_vi: 'Ăn cùng muối biển và ớt xanh.',
    description_en: 'Served with sea salt and green chili.',
    price: 325000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'chan-ga-rut-xuong-toi-cay',
    category_id: 'chicken',
    name_vi: 'Chân gà rút xương nướng tỏi cay',
    name_en: 'Grilled boneless chicken feet with spicy garlic',
    description_vi: null,
    description_en: null,
    price: 295000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'canh-ga-rang-muoi',
    category_id: 'chicken',
    name_vi: 'Cánh gà khúc giữa rang muối',
    name_en: 'Fried mid-joint chicken wings with spicy shrimp salt',
    description_vi: null,
    description_en: null,
    price: 325000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'canh-ga-nuong-bbq',
    category_id: 'chicken',
    name_vi: 'Cánh gà khúc giữa nướng sốt BBQ',
    name_en: 'Grilled mid-joint chicken wings with BBQ sauce',
    description_vi: null,
    description_en: null,
    price: 325000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'sun-ga-rang-muoi',
    category_id: 'chicken',
    name_vi: 'Sụn gà rang muối',
    name_en: 'Fried crispy chicken cartilage with shrimp salt',
    description_vi: null,
    description_en: null,
    price: 335000,
    is_sold_out: false,
    sort_order: 4
  },
  {
    id: 'com-chien-trung-gion',
    category_id: 'rice-pasta',
    name_vi: 'Cơm chiên trứng giòn',
    name_en: 'Crispy fried rice with chicken eggs',
    description_vi: null,
    description_en: null,
    price: 188000,
    is_sold_out: false,
    sort_order: 1
  },
  {
    id: 'com-nieu-ca-hoi',
    category_id: 'rice-pasta',
    name_vi: 'Cơm niêu nướng cá hồi',
    name_en: 'Grilled mixed rice with salmon in clay pot',
    description_vi: null,
    description_en: null,
    price: 238000,
    is_sold_out: false,
    sort_order: 2
  },
  {
    id: 'com-chien-hai-san-ngoc-bich',
    category_id: 'rice-pasta',
    name_vi: 'Cơm chiên hải sản ngọc bích',
    name_en: 'Spinach fried rice with seafood and eggs',
    description_vi: null,
    description_en: null,
    price: 328000,
    is_sold_out: false,
    sort_order: 3
  },
  {
    id: 'my-y-sot-kem-nam',
    category_id: 'rice-pasta',
    name_vi: 'Mỳ Ý sốt kem nấm',
    name_en: 'Spaghetti with cream and mushroom sauce',
    description_vi: null,
    description_en: null,
    price: 198000,
    is_sold_out: false,
    sort_order: 4
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

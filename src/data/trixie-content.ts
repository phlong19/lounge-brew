import type { ArticleRow, EventRow } from "@/types/domain";

/** Venue details and original show pages reviewed on 26 October 2026.
 * Provenance: trixie-assets.json and verified-shows.json. Dates are fixed source facts.
 */
export const venue = {
  name: "Trixie Café & Lounge",
  address: "165 Thái Hà, Đống Đa, Hà Nội",
  addressEn: "165 Thai Ha, Dong Da, Hanoi",
  phone: "0977 165 165",
  phoneHref: "tel:0977165165",
  secondaryPhone: "0888 165 165",
  secondaryPhoneHref: "tel:0888165165",
  mapUrl: "https://www.google.com/maps?cid=1629843242895371718",
  hours: "07:00 — 23:00",
  facebookUrl: "https://www.facebook.com/TrixieCafe",
  loungeFacebookUrl: "https://www.facebook.com/trixie.cafe.lounge/",
  // No Instagram account is linked by the original venue website.
  instagramUrl: "",
  sourceUrl: "https://trixie.com.vn/",
  reviewedAt: "2026-10-26",
} as const;

export const verifiedEvents: EventRow[] = [
  {
    id: "19870256",
    title_vi: "Minishow Quang Dũng",
    title_en: "Quang Dũng live at Trixie",
    performer_name: "Quang Dũng",
    event_date: "2026-10-23T20:15:00+07:00",
    end_date: "2026-10-23T22:30:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/19870256.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-sau-23-10-2026-minishow-quang-dung-E19870256.html",
  },
  {
    id: "42386501",
    title_vi: "Minishow Đàm Vĩnh Hưng",
    title_en: "Đàm Vĩnh Hưng live at Trixie",
    performer_name: "Đàm Vĩnh Hưng",
    event_date: "2026-10-24T20:15:00+07:00",
    end_date: "2026-10-24T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/42386501.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-bay-24-10-2026-minishow-dam-vinh-hung-E42386501.html",
  },
  {
    id: "47320159",
    title_vi: "Minishow Phương Linh",
    title_en: "Phương Linh live at Trixie",
    performer_name: "Phương Linh",
    event_date: "2026-10-30T20:15:00+07:00",
    end_date: "2026-10-30T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/47320159.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-sau-30-10-2026-minishow-phuong-linh-E47320159.html",
  },
  {
    id: "60498725",
    title_vi: "Minishow Myra Trần",
    title_en: "Myra Trần live at Trixie",
    performer_name: "Myra Trần",
    event_date: "2026-10-31T20:15:00+07:00",
    end_date: "2026-10-31T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/60498725.png",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-bay-31-10-2026-minishow-myra-tran-E60498725.html",
  },
  {
    id: "1853279",
    title_vi: "Minishow Hoàng Hải",
    title_en: "Hoàng Hải live at Trixie",
    performer_name: "Hoàng Hải",
    event_date: "2026-11-07T20:15:00+07:00",
    end_date: "2026-11-07T22:30:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/1853279.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-bay-07-11-2026-minishow-hoang-hai-E1853279.html",
  },
  {
    id: "58320194",
    title_vi: "Minishow Nguyên Hà",
    title_en: "Nguyên Hà live at Trixie",
    performer_name: "Nguyên Hà",
    event_date: "2026-11-20T20:15:00+07:00",
    end_date: "2026-11-20T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/58320194.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/-20-11-2026-minishow-nguyen-ha-E58320194.html",
  },
  {
    id: "31560924",
    title_vi: "Minishow Dương Edward",
    title_en: "Dương Edward live at Trixie",
    performer_name: "Dương Edward",
    event_date: "2026-11-21T20:15:00+07:00",
    end_date: "2026-11-21T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/31560924.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-bay-21-11-2026-minishow-duong-edward-E31560924.html",
  },
  {
    id: "76352980",
    title_vi: "Minishow Quang Đăng Trần",
    title_en: "Quang Đăng Trần live at Trixie",
    performer_name: "Quang Đăng Trần",
    event_date: "2026-11-27T20:15:00+07:00",
    end_date: "2026-11-27T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/76352980.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-sau-27-11-2026-minishow-quang-dang-tran-E76352980.html",
  },
  {
    id: "24567190",
    title_vi: "Minishow Đỗ Hoàng Hiệp",
    title_en: "Đỗ Hoàng Hiệp live at Trixie",
    performer_name: "Đỗ Hoàng Hiệp",
    event_date: "2026-11-28T20:15:00+07:00",
    end_date: "2026-11-28T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/24567190.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-bay-28-11-2026-minishow-do-hoang-hiep-E24567190.html",
  },
  {
    id: "96851273",
    title_vi: "Minishow Quang Vinh",
    title_en: "Quang Vinh live at Trixie",
    performer_name: "Quang Vinh",
    event_date: "2026-12-11T20:15:00+07:00",
    end_date: "2026-12-11T22:00:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/96851273.jpg",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-sau-11-12-2026-minishow-quang-vinh-E96851273.html",
  },
  {
    id: "72856139",
    title_vi: "Minishow Nguyễn Kiều Oanh",
    title_en: "Nguyễn Kiều Oanh live at Trixie",
    performer_name: "Nguyễn Kiều Oanh",
    event_date: "2026-12-19T20:15:00+07:00",
    end_date: "2026-12-19T22:30:00+07:00",
    description_vi: null,
    description_en: null,
    cover_image_url: "/trixie/shows/72856139.png",
    is_active: true,
    source_url:
      "https://trixie.com.vn/thu-bay-19-12-2026-minishow-nguyen-kieu-oanh-E72856139.html",
  },
];

/** Original bilingual visitor guides, reviewed against the venue site on 26 October 2026. */
export const verifiedArticles: ArticleRow[] = [
  {
    id: "trixie-visit-guide",
    slug: "mot-ngay-o-trixie",
    title_vi: "Ghé Trixie: từ cà phê đến nhạc sống",
    title_en: "Visiting Trixie: coffee and live music",
    content_vi:
      "<p>Trixie Café &amp; Lounge nằm tại 165 Thái Hà, Đống Đa, Hà Nội. Không gian kết hợp quán cà phê với phòng trà và các đêm minishow.</p><h2>Lên kế hoạch ghé thăm</h2><p>Giờ mở cửa được công bố là 07:00–23:00. Bạn có thể xem thực đơn gốc trên trang Menu, rồi kiểm tra lịch biểu diễn để chọn buổi phù hợp.</p><h2>Liên hệ trước khi đến</h2><p>Với đêm minishow hoặc nhu cầu tổ chức sự kiện, hãy gọi 0977 165 165 hoặc 0888 165 165 để trao đổi trực tiếp với Trixie về thông tin và đặt bàn.</p>",
    content_en:
      "<p>Trixie Café &amp; Lounge is at 165 Thai Ha, Dong Da, Hanoi. The venue combines a café with a lounge and live minishows.</p><h2>Plan your visit</h2><p>The published opening hours are 07:00–23:00. Browse the original menu artwork on the Menu page and check the performance schedule to choose your evening.</p><h2>Contact the venue</h2><p>For a minishow or a private event enquiry, call 0977 165 165 or 0888 165 165 to discuss the details and reservations directly with Trixie.</p>",
    thumbnail_url: "/trixie/venue-1.jpg",
    published_at: "2026-10-26T00:00:00+07:00",
  },
  {
    id: "trixie-live-music-guide",
    slug: "hen-mot-dem-nhac-tai-trixie",
    title_vi: "Hẹn một đêm nhạc tại Trixie",
    title_en: "Planning a live music evening at Trixie",
    content_vi:
      "<p>Chương trình minishow là một phần của Trixie Café &amp; Lounge tại 165 Thái Hà. Mỗi chương trình có nghệ sĩ, ngày và giờ biểu diễn riêng được công bố trên trang của Trixie.</p><h2>Xem đúng chương trình</h2><p>Kiểm tra tên nghệ sĩ, ngày và khung giờ trên lịch diễn và poster của chương trình bạn muốn xem. Thời gian trên website này được hiển thị theo giờ Hà Nội.</p><h2>Trao đổi trực tiếp khi đặt bàn</h2><p>Gọi 0977 165 165 hoặc 0888 165 165 và nêu tên chương trình cùng ngày diễn. Nhân viên Trixie sẽ cung cấp thông tin đặt bàn; hãy xác nhận các chi tiết trực tiếp với địa điểm trước khi đến.</p>",
    content_en:
      "<p>Live minishows are part of Trixie Café &amp; Lounge at 165 Thai Ha. Each performance has its own artist, date and time published by Trixie.</p><h2>Check your chosen performance</h2><p>Review the artist, date and time range in the schedule and on the original show poster. Times on this website are displayed in Hanoi local time.</p><h2>Arrange your reservation directly</h2><p>Call 0977 165 165 or 0888 165 165 and mention the show and performance date. Trixie staff can provide reservation information; confirm the details directly with the venue before visiting.</p>",
    thumbnail_url: "/trixie/venue-3.jpg",
    published_at: "2026-10-26T00:00:00+07:00",
  },
];

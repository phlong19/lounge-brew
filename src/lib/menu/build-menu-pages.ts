import type { AppLocale } from "@/i18n/config";
import type { MenuPage } from "@/types/domain";

/** Order and categories inspected against the original 18-page menu on 26 October 2026. */
const artwork = [
  ["cover", "Bìa thực đơn", "Menu cover"],
  ["welcome", "Trixie · Chào bạn", "Welcome to Trixie"],
  ["tea", "Trà & nước ép", "Tea & fresh juice"],
  ["juice", "Nước ép pha chế", "Mixed juices"],
  ["cocktails", "Cocktail", "Cocktails"],
  ["gin", "Cocktail gin trái cây", "Fruity gin cocktails"],
  ["mixed-drinks", "Đồ uống pha chế", "Mixed drinks & by the glass"],
  ["wine", "Rượu vang", "Wine"],
  ["spirits", "Rượu mạnh", "Spirits by the bottle"],
  ["snacks", "Đồ ăn nhẹ", "Snacks"],
  ["beer", "Bia, nước ngọt & trái cây", "Beer, soft drinks & fruit"],
  ["food", "Thực đơn món ăn", "Food menu"],
  ["appetisers", "Khai vị & salad", "Appetisers & salads"],
  ["beef-pork", "Bò & heo", "Beef & pork"],
  ["chicken", "Gà", "Chicken"],
  ["rice-pasta", "Cơm & mỳ Ý", "Rice & pasta"],
  ["thanks", "Lời cảm ơn", "Thank you"],
  ["back", "Bìa sau", "Back cover"],
] as const;

export function buildImageMenuPages(locale: AppLocale = "vi"): MenuPage[] {
  return artwork.map(([id, vi, en], index) => ({
    id,
    physicalIndex: index,
    kind:
      index === 0 ? "cover" : index === artwork.length - 1 ? "back" : "content",
    image: `/menu/page-${String(index + 1).padStart(2, "0")}.webp`,
    label: locale === "vi" ? vi : en,
    category: id,
    width: index === 0 || index === 17 ? 1200 : 1211,
    height: index === 0 || index === 17 ? 1700 : 1683,
  }));
}

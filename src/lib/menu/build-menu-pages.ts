import type {MenuPage} from '@/types/domain';

/**
 * Menu image filenames from /public/menu/, in page order.
 * Each image is one face of a flipbook leaf.
 * Two consecutive images share the same physical leaf (front + back).
 */
const MENU_IMAGES: { src: string; kind: MenuPage['kind'] }[] = [
  {src: '/menu/thucdon_bia.webp', kind: 'cover'},
  {src: '/menu/trang-1-1769419455.webp', kind: 'content'},
  {src: '/menu/trang-2-1769419493.webp', kind: 'content'},
  {src: '/menu/trang-3-1769419503.webp', kind: 'content'},
  {src: '/menu/trang-4-1769419515.webp', kind: 'content'},
  {src: '/menu/trang-5-1769419523.webp', kind: 'content'},
  {src: '/menu/trang-6-1769419536.webp', kind: 'content'},
  {src: '/menu/trang-7-1769419548.webp', kind: 'content'},
  {src: '/menu/trang-8-1769419557.webp', kind: 'content'},
  {src: '/menu/trang-9-1769419570.webp', kind: 'content'},
  {src: '/menu/trang-10-1769419579.webp', kind: 'content'},
  {src: '/menu/trang-11-1769419591.webp', kind: 'content'},
  {src: '/menu/trang-12-1769419600.webp', kind: 'content'},
  {src: '/menu/trang-13-1769419611.webp', kind: 'content'},
  {src: '/menu/trang-14-1769419620.webp', kind: 'content'},
  {src: '/menu/thucdon_cuoi.webp', kind: 'back'},
];

export function buildImageMenuPages(): MenuPage[] {
  return MENU_IMAGES.map((entry, index) => ({
    id: entry.kind === 'cover' ? 'cover' : entry.kind === 'back' ? 'back' : `page-${index}`,
    physicalIndex: index,
    kind: entry.kind,
    image: entry.src,
  }));
}

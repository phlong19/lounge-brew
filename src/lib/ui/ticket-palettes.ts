/** Static Tailwind stocks: generated metadata selects a key, never arbitrary CSS. */
export const ticketPalettes = {
 forest: { stock: "bg-[#244736] text-[#FFF4D7]", stripe: "bg-[#9DBB87]", hue: 145 },
 teal: { stock: "bg-[#28545A] text-[#FFF4D7]", stripe: "bg-[#A0C7CA]", hue: 185 },
 blue: { stock: "bg-[#35485E] text-[#FFF4D7]", stripe: "bg-[#A3BDDA]", hue: 215 },
 violet: { stock: "bg-[#51405F] text-[#FFF4D7]", stripe: "bg-[#C5AEDB]", hue: 275 },
 plum: { stock: "bg-[#603C56] text-[#FFF4D7]", stripe: "bg-[#DDB5D3]", hue: 320 },
 wine: { stock: "bg-[#62373D] text-[#FFF4D7]", stripe: "bg-[#E2ADB3]", hue: 350 },
 rust: { stock: "bg-[#704536] text-[#FFF4D7]", stripe: "bg-[#E5B89D]", hue: 20 },
 amber: { stock: "bg-[#70592D] text-[#FFF4D7]", stripe: "bg-[#E6CE96]", hue: 43 },
 olive: { stock: "bg-[#4F5634] text-[#FFF4D7]", stripe: "bg-[#CCD39F]", hue: 75 },
 charcoal: { stock: "bg-[#41494A] text-[#FFF4D7]", stripe: "bg-[#BCC7C8]", hue: 0 },
 'forest-light': { stock: "bg-[#AEC2A5] text-[#172C20]", stripe: "bg-[#335A3E]", hue: 145 },
 'teal-light': { stock: "bg-[#A4BDBD] text-[#173034]", stripe: "bg-[#365D64]", hue: 185 },
 'blue-light': { stock: "bg-[#B0BDCC] text-[#202F42]", stripe: "bg-[#3A5678]", hue: 215 },
 'violet-light': { stock: "bg-[#B6A6C9] text-[#2D203E]", stripe: "bg-[#64467F]", hue: 275 },
 'plum-light': { stock: "bg-[#C6A6BA] text-[#38202F]", stripe: "bg-[#7B4468]", hue: 320 },
 'wine-light': { stock: "bg-[#C9A2A3] text-[#3E2025]", stripe: "bg-[#87434C]", hue: 350 },
 'rust-light': { stock: "bg-[#CDAE99] text-[#3D281B]", stripe: "bg-[#89563A]", hue: 20 },
 'amber-light': { stock: "bg-[#D5C49D] text-[#382D16]", stripe: "bg-[#8B6D32]", hue: 43 },
 'olive-light': { stock: "bg-[#C1C69D] text-[#2B3018]", stripe: "bg-[#68763A]", hue: 75 },
 'charcoal-light': { stock: "bg-[#C0C4BE] text-[#28312D]", stripe: "bg-[#59665E]", hue: 0 },
} as const;
export type TicketPaletteKey = keyof typeof ticketPalettes;
export function ticketPalette(key?: string | null) {
 return key && Object.hasOwn(ticketPalettes, key) ? ticketPalettes[key as TicketPaletteKey] : null;
}

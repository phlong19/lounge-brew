import { Barlow_Condensed, Great_Vibes } from "next/font/google";

export const scriptHeadingFont = Great_Vibes({
  subsets: ["latin", "vietnamese"],
  weight: "400",
  display: "swap",
});

export const ticketPrintFont = Barlow_Condensed({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  display: "swap",
});

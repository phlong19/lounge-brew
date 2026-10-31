import type {AppLocale} from "@/i18n/config";
/** Presentation only: retain the original imported title in storage. */
export function eventHeadingTitle(value:string,locale:AppLocale="vi"){
 return value.normalize("NFC").toLocaleLowerCase(locale).replace(/(^|[^\p{L}\p{M}\p{N}])(\p{L})/gu,(_match,boundary:string,letter:string)=>boundary+letter.toLocaleUpperCase(locale));
}

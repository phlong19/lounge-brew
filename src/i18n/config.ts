export const locales = ['vi', 'en'] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'vi';
export const localeCookieName = 'LB_LOCALE';

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return locales.includes(value as AppLocale);
}

type WeightedTag = {
  q: number;
  tag: string;
};

function parseAcceptLanguage(headerValue: string | null): WeightedTag[] {
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(',')
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const q = qualityParameter ? Number(qualityParameter.split('=')[1]) : 1;

      return {
        tag: tag.toLowerCase(),
        q: Number.isFinite(q) ? q : 0
      };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((left, right) => right.q - left.q);
}

export function resolveLocaleFromHeader(headerValue: string | null): AppLocale {
  for (const entry of parseAcceptLanguage(headerValue)) {
    if (entry.tag.startsWith('vi')) {
      return 'vi';
    }

    if (entry.tag.startsWith('en')) {
      return 'en';
    }
  }

  return defaultLocale;
}


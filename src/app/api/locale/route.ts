import {NextResponse} from 'next/server';

import {isAppLocale, localeCookieName} from '@/i18n/config';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {locale?: string} | null;
  const locale = body?.locale;

  if (!isAppLocale(locale)) {
    return NextResponse.json({error: 'Invalid locale'}, {status: 400});
  }

  const response = NextResponse.json({ok: true});

  response.cookies.set(localeCookieName, locale, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax'
  });

  return response;
}


import type {Metadata} from 'next';
import {DM_Sans, Playfair_Display} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

import './globals.css';

const sans = DM_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans'
});

const display = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display'
});

export const metadata: Metadata = {
  title: 'Lounge Brew 2.0',
  description: 'Premium bilingual flipbook menu for a coffee lounge and live music venue.'
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const [locale, messages] = await Promise.all([
    getLocale().catch(() => 'vi'),
    getMessages().catch(() => null)
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages ?? undefined}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

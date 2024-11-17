// app/layout.tsx

import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import { Providers } from './providers';
import PrelineScript from '@/components/PrelineScript';
import clsx from 'clsx';
import SchemaOrg from '@/components/SchemaOrg';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  metadataBase: new URL('https://tutee.co.uk'),
  title: {
    default: siteConfig.seo.title,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: 'Tutee' }],
  creator: 'Tutee',
  openGraph: {
    type: 'website',
    locale: siteConfig.seo.openGraph.locale,
    url: siteConfig.seo.openGraph.url,
    siteName: siteConfig.seo.openGraph.siteName,
    images: siteConfig.seo.openGraph.images,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    site: siteConfig.seo.twitter.site,
    creator: siteConfig.seo.twitter.handle,
  },
  robots: siteConfig.seo.robots,
  alternates: {
    canonical: siteConfig.seo.canonical,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SchemaOrg />
        <link rel="alternate" hrefLang="en-gb" href="https://tutee.co.uk" />
        <link rel="alternate" hrefLang="x-default" href="https://tutee.co.uk" />
      </head>
      <body
        className={clsx(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
          </div>
        </Providers>
        <Script
          src="/assets/scripts/lang-config.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/assets/scripts/translation.js"
          strategy="beforeInteractive"
        />
        <PrelineScript />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}

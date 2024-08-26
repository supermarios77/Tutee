// components/SchemaOrg.tsx

import React from 'react';
import { siteConfig } from '@/config/site';

export default function SchemaOrg() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: siteConfig.name,
    description: siteConfig.seo.description,
    url: siteConfig.seo.openGraph.url,
    logo: `${siteConfig.seo.openGraph.url}/logo.png`,
    sameAs: [
      'https://www.facebook.com/Tutee',
      'https://twitter.com/tuteeuk',
      'https://www.linkedin.com/company/tutee',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+44-XXX-XXXX-XXXX', // Replace with your actual contact number
      contactType: 'customer service',
      areaServed: 'GB',
      availableLanguage: ['English'],
    },
    offers: {
      '@type': 'Offer',
      price: '59.99',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: '2023-01-01',
      priceValidUntil: '2023-12-31',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
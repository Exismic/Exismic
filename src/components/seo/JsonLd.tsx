import React from 'react';

interface SEOProps {
  type: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'FAQPage';
  data: Record<string, unknown>;
}

export function JsonLd({ type, data }: SEOProps) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(baseData) }}
    />
  );
}

export const defaultSchemaData = {
  organization: {
    name: 'Lumora',
    url: 'https://www.lumoraai.online',
    logo: 'https://www.lumoraai.online/logo.png',
    sameAs: [
      'https://twitter.com/lumoraai',
      'https://github.com/lumoraai',
    ],
  },
  website: {
    name: 'Lumora AI',
    url: 'https://www.lumoraai.online',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.lumoraai.online/tools?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
};

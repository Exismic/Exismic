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
    name: 'Exismic',
    url: 'https://www.exismicai.online',
    logo: 'https://www.exismicai.online/logo.png',
    sameAs: [
      'https://twitter.com/exismicai',
      'https://github.com/exismicai',
    ],
  },
  website: {
    name: 'Exismic Ai',
    url: 'https://www.exismicai.online',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.exismicai.online/tools?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
};

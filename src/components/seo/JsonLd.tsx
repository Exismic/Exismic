import React from 'react';
import { SITE_URL } from '@/lib/seo';

interface SEOProps {
  type: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'WebApplication' | 'FAQPage' | 'BreadcrumbList' | 'Article';
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
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Exismic is an AI-powered creative workspace for image, video, audio, PDF, coding, and productivity workflows.',
  },
  website: {
    name: 'Exismic',
    alternateName: ['Exismic AI', 'Exismic AI Studio'],
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/tools?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  },
};

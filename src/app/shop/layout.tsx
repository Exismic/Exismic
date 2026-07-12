import type { Metadata } from 'next';
import { constructMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Exismic Credit Shop - Permanent AI Credits',
  description: 'Purchase permanent Exismic credits for image, video, audio, document, and AI workflows. Purchased credits never expire.',
  canonicalUrl: `${SITE_URL}/shop`,
  keywords: ['Exismic credits', 'buy AI credits', 'permanent AI credits', 'AI tool credits'],
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}

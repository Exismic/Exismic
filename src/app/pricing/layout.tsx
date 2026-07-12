import type { Metadata } from 'next';
import { constructMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Exismic Plans and Pricing',
  description: 'Compare Exismic plans and choose the right creative AI workspace for your projects.',
  canonicalUrl: `${SITE_URL}/pricing`,
  noIndex: true,
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

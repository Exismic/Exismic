import type { Metadata } from 'next';
import { constructMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Exismic Plans and Pricing - Flexible AI Workspace & Generation Credits',
  description: 'Compare Exismic plans and pricing. Free daily allowance, permanent generation credit packs, and Exismic Pro membership with priority GPU access and daily refills.',
  canonicalUrl: `${SITE_URL}/pricing`,
  keywords: [
    'Exismic pricing',
    'Exismic pro plan',
    'buy AI credits',
    'cheap AI image generator',
    'Exismic subscription',
    'AI tool pricing',
  ],
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

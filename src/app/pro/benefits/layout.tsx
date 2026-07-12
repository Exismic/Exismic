import type { Metadata } from 'next';
import { constructMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Exismic Pro Benefits - Faster AI Tools and Premium Workflows',
  description: 'Explore Exismic Pro benefits including priority processing, higher daily credits, batch workflows, commercial exports, and premium customization.',
  canonicalUrl: `${SITE_URL}/pro/benefits`,
  keywords: ['Exismic Pro benefits', 'priority AI processing', 'premium AI tools', 'commercial AI exports'],
});

export default function ProBenefitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

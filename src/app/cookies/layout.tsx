import type { Metadata } from 'next';
import { constructMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Exismic Cookie Policy',
  description: 'Learn how Exismic uses essential, preference, and analytics cookies.',
  canonicalUrl: `${SITE_URL}/cookies`,
  noIndex: true,
});

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

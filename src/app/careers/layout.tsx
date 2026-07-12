import type { Metadata } from 'next';
import { constructMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Careers at Exismic - Build the Future of AI Creative Tools',
  description: 'Explore opportunities to help Exismic build practical AI tools for creators, students, developers, and businesses.',
  canonicalUrl: `${SITE_URL}/careers`,
  keywords: ['Exismic careers', 'AI startup jobs', 'AI tools careers', 'software jobs'],
});

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';
import { getToolMetadata } from '@/lib/seo';

export const metadata: Metadata = getToolMetadata('ai-code');

export default function CodeStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}

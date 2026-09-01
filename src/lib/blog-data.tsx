import React from 'react';
import { Sparkles, Zap, ImageDown, Palette, MessageSquareText, Code2, Shield } from 'lucide-react';

export type BlogPostMetadata = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
  };
  coverImage: string;
  category: string;
};

export const BLOG_POSTS: BlogPostMetadata[] = [
  {
    slug: 'exismic-1-5-release',
    title: 'Exismic 1.5: Quests, Developer API, Yearly Pro, and Gifting',
    excerpt: 'Exismic 1.5 introduces Daily & Weekly Quests to earn credits, official Developer API access, Yearly Pro plans, credit and membership gifting, and extensive visual refinements.',
    publishedAt: '2026-09-01',
    readTime: '4 min read',
    author: {
      name: 'Exismic Team',
      avatar: 'https://i.pravatar.cc/150?u=exismic',
    },
    coverImage: 'bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.18),transparent_50%)]',
    category: 'Product Updates',
  }
];

export function getPostBySlug(slug: string): BlogPostMetadata | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

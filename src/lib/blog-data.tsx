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
    slug: 'introducing-exismic',
    title: 'Introducing Exismic: The Future of Creative Workflows',
    excerpt: 'We are thrilled to announce the launch of Exismic, the ultimate AI-powered workspace designed to give you power without the clutter.',
    publishedAt: '2026-07-09',
    readTime: '4 min read',
    author: {
      name: 'Exismic Team',
      avatar: 'https://i.pravatar.cc/150?u=exismic',
    },
    coverImage: 'bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.15),transparent_50%)]',
    category: 'Product Updates',
  }
];

export function getPostBySlug(slug: string): BlogPostMetadata | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

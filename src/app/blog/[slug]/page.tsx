import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { BlogPostClient } from "./BlogPostClient";
import { getPostBySlug } from "@/lib/blog-data";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return constructMetadata({ title: "Post Not Found" });
  }

  return constructMetadata({
    title: `${post.title} | Exismic Blog`,
    description: post.excerpt,
    canonicalUrl: `${SITE_URL}/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch the actual user profile for Syed Rayan
  const realAuthor = await prisma.user.findFirst({
    where: {
      email: {
        equals: 'syedrayangames@Gmail.com',
        mode: 'insensitive'
      }
    }
  });

  if (realAuthor) {
    post.author = {
      name: realAuthor.name || realAuthor.username || "Syed Rayan",
      avatar: realAuthor.customAvatarUrl || realAuthor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuthor.name || 'SR')}`,
      ...( { username: realAuthor.username || realAuthor.id } as any )
    };
  }

  return <BlogPostClient post={post} />;
}

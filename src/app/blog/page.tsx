import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { BlogIndexClient } from "./BlogIndexClient";
import { BLOG_POSTS } from "@/lib/blog-data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Blog - AI Tools Tips & Tutorials",
  description: "The official Exismic Journal. Expert deep-dives into AI design, prompt engineering, and productivity hacks. Learn how to master the future of creativity.",
  canonicalUrl: `${SITE_URL}/blog`,
});

export default async function BlogPage() {
  const realAuthor = await prisma.user.findFirst({
    where: { email: { equals: 'syedrayangames@Gmail.com', mode: 'insensitive' } },
    select: { id: true, name: true, username: true, image: true, customAvatarUrl: true, plan: true, avatarFrame: true, nameGradient: true }
  });

  const posts = BLOG_POSTS.map(post => {
    if (realAuthor) {
      return {
        ...post,
        author: {
          name: realAuthor.name || realAuthor.username || "Syed Rayan",
          avatar: realAuthor.customAvatarUrl || realAuthor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuthor.name || 'SR')}`,
          username: realAuthor.username || realAuthor.id,
          avatarFrame: realAuthor.avatarFrame,
          nameGradient: realAuthor.nameGradient,
          plan: realAuthor.plan,
        }
      };
    }
    return post;
  });

  return <BlogIndexClient posts={posts} />;
}

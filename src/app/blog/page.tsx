import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { BlogIndexClient } from "./BlogIndexClient";
import { BLOG_POSTS } from "@/lib/blog-data";
import { getBlogAuthor } from "@/lib/blog-author";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Blog - AI Tools Tips & Tutorials",
  description: "The official Exismic Journal. Expert deep-dives into AI design, prompt engineering, and productivity hacks. Learn how to master the future of creativity.",
  canonicalUrl: `${SITE_URL}/blog`,
});

export default async function BlogPage() {
  const realAuthor = await getBlogAuthor();

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

import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

export default function BlogPreviewSection() {
  const { posts } = useSiteData();
  const featuredPosts = posts
    .filter((post) => post.published)
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
    .slice(0, 3);

  if (!featuredPosts.length) {
    return null;
  }

  return (
    <section className="section-padding bg-deep">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <span className="caption text-accent-gold uppercase tracking-widest">Latest Insights</span>
            <h2 className="heading-lg mt-2" style={{ color: "var(--color-text-main)" }}>
              Guidance Your Clients Can Actually Use
            </h2>
            <p className="body-md text-muted-green mt-3 max-w-2xl">
              Fresh travel, study, visa, and document guidance from the GenieHub team, now managed directly from your admin workspace.
            </p>
          </div>
          <Link to="/blog" className="btn-outline-theme inline-flex items-center gap-2">
            View all posts <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredPosts.map((post) => (
            <article key={post.id} className="card-theme-soft p-6 flex flex-col">
              {post.imageUrl && (
                <div className="mb-5 aspect-[16/9] overflow-hidden rounded-2xl bg-deep-green/60">
                  <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                </div>
              )}
              <span className="caption text-accent-gold uppercase tracking-wider">{post.category}</span>
              <h3 className="heading-sm mt-3" style={{ color: "var(--color-text-main)" }}>
                {post.title}
              </h3>
              <p className="body-sm text-muted-green mt-3 flex-1">{post.excerpt}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="caption text-muted-green inline-flex items-center gap-1">
                  <Clock3 size={12} />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
                <Link to={`/blog/${post.slug}`} className="caption text-accent-gold inline-flex items-center gap-1 hover:underline">
                  <BookOpen size={12} />
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

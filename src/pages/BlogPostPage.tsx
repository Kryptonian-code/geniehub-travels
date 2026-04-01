import { Link, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useSiteData } from "@/contexts/SiteDataContext";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { posts } = useSiteData();
  const post = posts.find((entry) => entry.slug === slug && entry.published);

  if (!post) {
    return (
      <PageLayout title="Blog Post Not Found" subtitle="The article you are looking for is unavailable or no longer published.">
        <section className="section-padding bg-deep">
          <div className="max-w-3xl mx-auto card-theme p-8">
            <p className="body-md text-muted-green mb-6">
              Try heading back to the blog overview to browse the latest GenieHub travel, visa, and study abroad content.
            </p>
            <Link to="/blog" className="btn-accent inline-flex">
              Back to Blog
            </Link>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={post.title} subtitle={post.excerpt}>
      <section className="section-padding bg-deep">
        <article className="max-w-3xl mx-auto card-theme p-8 md:p-10">
          {post.imageUrl && (
            <div className="mb-8 aspect-[16/9] overflow-hidden rounded-[28px] bg-deep-green/60">
              <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <span className="caption uppercase tracking-wide text-accent-gold">{post.category}</span>
            <span className="caption text-muted-green">{new Date(post.publishedAt).toLocaleDateString()}</span>
            <span className="caption text-muted-green">{post.author}</span>
          </div>
          <div className="space-y-5 body-md text-muted-green leading-8">
            {post.content.split(/\n+/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-theme">
            <Link to="/contact" className="btn-outline-theme inline-flex">
              Need help with your application?
            </Link>
          </div>
        </article>
      </section>
    </PageLayout>
  );
}

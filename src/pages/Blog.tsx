import PageLayout from "@/components/PageLayout";
import { BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteData } from "@/contexts/SiteDataContext";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

const Blog = () => {
  const { posts } = useSiteData();
  const publishedPosts = posts.filter((post) => post.published);
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(publishedPosts, {
    defaultPageSize: 6,
  });

  return (
    <PageLayout title="Blog" subtitle="Travel tips, visa advice, study abroad insights, and document guidance from the GenieHub team.">
      <section className="section-padding bg-deep">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((post) => (
            <article key={post.id} className="card-theme p-6 flex flex-col">
              {post.imageUrl && (
                <div className="mb-5 aspect-[16/9] overflow-hidden rounded-2xl bg-deep-green/60">
                  <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                </div>
              )}
              <span className="caption text-accent-gold uppercase tracking-wider mb-2">{post.category}</span>
              <h3 className="heading-sm mb-3" style={{ color: "var(--color-text-main)", fontSize: "1.1rem" }}>{post.title}</h3>
              <p className="body-sm text-muted-green flex-1 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 caption text-muted-green"><Clock size={12} /> {new Date(post.publishedAt).toLocaleDateString()}</span>
                <Link to={`/blog/${post.slug}`} className="caption text-accent-gold flex items-center gap-1 hover:underline">
                  <BookOpen size={12} /> Read more
                </Link>
              </div>
            </article>
          ))}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </section>
    </PageLayout>
  );
};

export default Blog;

import { useRef, useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { uploadMediaAsset } from "@/lib/backend";
import { MAX_UPLOAD_MB } from "@/lib/config";
import { createId } from "@/lib/storage";
import { validateUploadFile } from "@/lib/validation";
import type { BlogPost } from "@/lib/types";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

const emptyPost = (): BlogPost => ({
  id: createId("blog"),
  title: "",
  slug: "",
  category: "Insights",
  excerpt: "",
  content: "",
  author: "GenieHub Editorial",
  imageUrl: "",
  published: true,
  publishedAt: new Date().toISOString().slice(0, 10),
});

export default function AdminBlogPage() {
  const { workspace, loading, saveBlogPost, deleteBlogPost } = useAdminDashboard();
  const [form, setForm] = useState<BlogPost>(emptyPost());
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const { runAction, isPending } = useAsyncAction();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const posts = workspace?.blogPosts ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(posts, {
    pageParam: "blogPage",
    sizeParam: "blogPageSize",
    defaultPageSize: 8,
  });

  function resetForm() {
    setForm(emptyPost());
    setImageMode("url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function loadPost(post: BlogPost) {
    setForm(post);
    setImageMode(post.imageUrl?.startsWith("data:image") ? "upload" : "url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function clearPostImage() {
    setForm((current) => ({ ...current, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImageUpload(file?: File | null) {
    if (!file) {
      return;
    }

    try {
      validateUploadFile(file);
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose a JPG, PNG, or WEBP image.");
      }
      const asset = await runAction("upload-blog-image", () => uploadMediaAsset(file));
      setForm((current) => ({ ...current, imageUrl: asset.fileUrl }));
      toast.success("Blog image uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to use that image.");
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Enter a blog title.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Enter a blog slug.");
      return;
    }
    if (!form.excerpt.trim()) {
      toast.error("Enter a short excerpt.");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Enter the blog content.");
      return;
    }

    try {
      await runAction("save-blog", () => saveBlogPost(form));
      toast.success("Blog post saved successfully.");
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the blog post.");
    }
  }

  async function handleDelete(postId: string) {
    try {
      await runAction(`delete-blog-${postId}`, () => deleteBlogPost(postId));
      toast.success("Blog post deleted successfully.");
      if (form.id === postId) {
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete the blog post.");
    }
  }

  return (
    <AdminShell title="Blog Management" subtitle="Create, edit, publish, and retire blog content without leaving the same brand language used on the public site.">
      {loading || !workspace ? <DashboardLoadingState cards={2} lines={5} /> : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Title</label>
              <input className="field-theme" placeholder="Example: What makes a strong tour enquiry" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Slug</label>
              <input className="field-theme" placeholder="example-blog-slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Category</label>
              <input className="field-theme" placeholder="Example: Travel Guide" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Author</label>
              <input className="field-theme" placeholder="GenieHub Editorial" value={form.author} onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-text mb-2 block">Featured image</label>
                <div className="inline-flex rounded-full border border-white/10 bg-deep-green/70 p-1">
                  <button
                    className={`rounded-full px-4 py-2 text-sm transition ${imageMode === "url" ? "bg-accent-gold text-deep-green" : "text-muted-green hover:text-cream"}`}
                    type="button"
                    onClick={() => setImageMode("url")}
                  >
                    Image URL
                  </button>
                  <button
                    className={`rounded-full px-4 py-2 text-sm transition ${imageMode === "upload" ? "bg-accent-gold text-deep-green" : "text-muted-green hover:text-cream"}`}
                    type="button"
                    onClick={() => setImageMode("upload")}
                  >
                    Upload from device
                  </button>
                </div>
              </div>
              {imageMode === "url" ? (
                <div>
                  <label className="label-text mb-1 block">Image URL</label>
                  <input className="field-theme" placeholder="Paste a hosted image URL if available" value={form.imageUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
                </div>
              ) : (
                <div className="card-theme-soft p-4 space-y-3">
                  <div>
                    <label className="label-text mb-1 block">Upload blog image</label>
                    <input
                      ref={fileInputRef}
                      className="field-theme file:mr-3 file:rounded-full file:border-0 file:bg-accent-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-deep-green"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isPending("upload-blog-image")}
                      onChange={(event) => void handleImageUpload(event.target.files?.[0] ?? null)}
                    />
                    <p className="caption text-muted-green mt-2">
                      {isPending("upload-blog-image")
                        ? "Uploading image..."
                        : `Choose a JPG, PNG, or WEBP image up to ${MAX_UPLOAD_MB}MB.`}
                    </p>
                  </div>
                  {!!form.imageUrl && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => fileInputRef.current?.click()}>
                        Replace image
                      </button>
                      <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={clearPostImage}>
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              )}
              {form.imageUrl ? (
                <div className="card-theme-soft overflow-hidden">
                  <div className="aspect-[16/9] bg-deep-green/60">
                    <img src={form.imageUrl} alt={form.title ? `${form.title} preview` : "Blog preview"} className="h-full w-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="card-theme-soft p-4">
                  <p className="caption text-muted-green">No blog image selected yet.</p>
                </div>
              )}
            </div>
            <div>
              <label className="label-text mb-1 block">Excerpt</label>
              <textarea className="field-theme" rows={2} placeholder="Write the short summary shown in blog cards." value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Content</label>
              <textarea className="field-theme" rows={6} placeholder="Write the full article content here." value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="inline-flex items-center gap-2 body-sm text-muted-green"><input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} /> Published</label>
              <label className="block">
                <span className="label-text mb-1 block">Publish date</span>
                <input type="date" className="field-theme" value={form.publishedAt} onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))} />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-accent" type="button" disabled={isPending("save-blog")} onClick={() => void handleSave()}>{isPending("save-blog") ? "Saving..." : "Save post"}</button>
              <button className="btn-outline-theme" type="button" onClick={resetForm}>Clear form</button>
            </div>
          </section>
          <section className="card-theme p-6 space-y-3">
            {paginatedItems.map((post) => (
              <div key={post.id} className="card-theme-soft p-4">
                {post.imageUrl && (
                  <div className="mb-3 aspect-[16/9] overflow-hidden rounded-2xl bg-deep-green/60">
                    <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <p className="body-sm">{post.title}</p>
                <p className="caption text-muted-green mt-1">{post.category} | {post.slug} | {post.published ? "published" : "draft"}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => loadPost(post)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" disabled={isPending(`delete-blog-${post.id}`)} onClick={() => void handleDelete(post.id)}>{isPending(`delete-blog-${post.id}`) ? "Deleting..." : "Delete"}</button>
                </div>
              </div>
            ))}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </section>
        </div>
      )}
    </AdminShell>
  );
}

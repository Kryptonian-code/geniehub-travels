import { useRef, useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { uploadMediaAsset } from "@/lib/backend";
import { MAX_UPLOAD_MB } from "@/lib/config";
import { createId, STORAGE_KEYS } from "@/lib/storage";
import { validateUploadFile } from "@/lib/validation";
import type { TestimonialRecord } from "@/lib/adminTypes";

const emptyItem = (): TestimonialRecord => ({
  id: createId("testimonial"),
  name: "",
  quote: "",
  category: "visa",
  featured: false,
  displayOrder: 1,
  status: "approved",
  imageUrl: "",
  updatedAt: new Date().toISOString(),
});

export default function AdminTestimonialsPage() {
  const { workspace, loading, saveTestimonial, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<TestimonialRecord>(emptyItem());
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const { runAction, isPending } = useAsyncAction();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetForm() {
    setForm(emptyItem());
    setImageMode("url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function loadItem(item: TestimonialRecord) {
    setForm(item);
    setImageMode(item.imageUrl?.startsWith("data:image") ? "upload" : "url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function clearImage() {
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
      const asset = await runAction("upload-testimonial-image", () => uploadMediaAsset(file));
      setForm((current) => ({ ...current, imageUrl: asset.fileUrl }));
      toast.success("Testimonial image uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to use that image.");
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Enter the client name.");
      return;
    }
    if (!form.quote.trim()) {
      toast.error("Enter the testimonial quote.");
      return;
    }

    try {
      await runAction("save-testimonial", () => saveTestimonial({ ...form, updatedAt: new Date().toISOString() }));
      toast.success("Testimonial saved successfully.");
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the testimonial.");
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await runAction(`delete-testimonial-${itemId}`, () => deleteCollectionItem(STORAGE_KEYS.testimonials, itemId));
      toast.success("Testimonial deleted successfully.");
      if (form.id === itemId) {
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete the testimonial.");
    }
  }

  return (
    <AdminShell title="Testimonials" subtitle="Approve, feature, and reorder testimonials so trust signals stay strong and on-brand across public pages.">
      {loading || !workspace ? <DashboardLoadingState cards={2} lines={5} /> : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Client name</label>
              <input className="field-theme" placeholder="Example: Efua A." value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Quote</label>
              <textarea className="field-theme" rows={4} placeholder="Write the client testimonial exactly as approved." value={form.quote} onChange={(event) => setForm((current) => ({ ...current, quote: event.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-1 block">Category</label>
                <select className="field-theme" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as TestimonialRecord["category"] }))}>
                  <option value="study abroad">Study abroad</option>
                  <option value="visa">Visa</option>
                  <option value="tours">Tours</option>
                  <option value="travel support">Travel support</option>
                </select>
              </div>
              <div>
                <label className="label-text mb-1 block">Display order</label>
                <input className="field-theme" type="number" min={1} value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) || 1 }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="inline-flex items-center gap-2 body-sm text-muted-green"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Featured testimonial</label>
              <div>
                <label className="label-text mb-1 block">Approval status</label>
                <select className="field-theme" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TestimonialRecord["status"] }))}>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-text mb-2 block">Client image</label>
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
                    <label className="label-text mb-1 block">Upload client image</label>
                    <input
                      ref={fileInputRef}
                      className="field-theme file:mr-3 file:rounded-full file:border-0 file:bg-accent-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-deep-green"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isPending("upload-testimonial-image")}
                      onChange={(event) => void handleImageUpload(event.target.files?.[0] ?? null)}
                    />
                    <p className="caption text-muted-green mt-2">
                      {isPending("upload-testimonial-image")
                        ? "Uploading image..."
                        : `Choose a JPG, PNG, or WEBP image up to ${MAX_UPLOAD_MB}MB.`}
                    </p>
                  </div>
                  {!!form.imageUrl && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => fileInputRef.current?.click()}>
                        Replace image
                      </button>
                      <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={clearImage}>
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              )}
              {form.imageUrl ? (
                <div className="card-theme-soft overflow-hidden">
                  <div className="aspect-square max-w-[12rem] bg-deep-green/60">
                    <img src={form.imageUrl} alt={form.name ? `${form.name} preview` : "Testimonial preview"} className="h-full w-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="card-theme-soft p-4">
                  <p className="caption text-muted-green">No testimonial image selected yet.</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-accent" type="button" disabled={isPending("save-testimonial")} onClick={() => void handleSave()}>{isPending("save-testimonial") ? "Saving..." : "Save testimonial"}</button>
              <button className="btn-outline-theme" type="button" onClick={resetForm}>Clear form</button>
            </div>
          </section>
          <section className="card-theme p-6 space-y-3">
            {workspace.testimonials.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <div className="flex items-start gap-4">
                  {item.imageUrl ? (
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-deep-green/60 shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-deep-green/60 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="body-sm">{item.name}</p>
                    <p className="caption text-muted-green mt-1">{item.category} | {item.status} | {item.featured ? "featured" : "standard"}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => loadItem(item)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" disabled={isPending(`delete-testimonial-${item.id}`)} onClick={() => void handleDelete(item.id)}>{isPending(`delete-testimonial-${item.id}`) ? "Deleting..." : "Delete"}</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </AdminShell>
  );
}

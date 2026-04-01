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
import type { TourPackageRecord } from "@/lib/adminTypes";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

const emptyItem = (): TourPackageRecord => ({
  id: createId("package"),
  title: "",
  destination: "",
  duration: "",
  description: "",
  startingPrice: "",
  currency: "GHS",
  travelPeriod: "",
  travelDates: "",
  itinerarySummary: "",
  inclusions: "",
  exclusions: "",
  imageUrl: "",
  visible: true,
  featured: false,
  status: "draft",
  updatedAt: new Date().toISOString(),
});

export default function AdminTourPackagesPage() {
  const { workspace, loading, saveTourPackage, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<TourPackageRecord>(emptyItem());
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const { runAction, isPending } = useAsyncAction();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const destinationOptions = workspace?.destinationOptions.filter((item) => item.active && (item.category === "tour" || item.category === "travel")) ?? [];
  const packages = workspace?.tourPackages ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(packages, {
    pageParam: "packagesPage",
    sizeParam: "packagesPageSize",
    defaultPageSize: 8,
  });

  async function handleImageUpload(file?: File | null) {
    if (!file) {
      return;
    }

    try {
      validateUploadFile(file);
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose a JPG, PNG, or WEBP image.");
      }

      const asset = await runAction("upload-package-image", () => uploadMediaAsset(file));
      setForm((current) => ({
        ...current,
        imageUrl: asset.fileUrl,
        imageGallery: [asset.fileUrl],
      }));
      toast.success("Package image uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to use that image.");
    }
  }

  function resetForm() {
    setForm(emptyItem());
    setImageMode("url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function loadItemForEdit(item: TourPackageRecord) {
    setForm(item);
    setImageMode(item.imageUrl?.startsWith("data:image") ? "upload" : "url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function clearPackageImage() {
    setForm((current) => ({
      ...current,
      imageUrl: "",
      imageGallery: [],
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Enter a package title.");
      return;
    }
    if (!form.destination.trim()) {
      toast.error("Select a destination.");
      return;
    }
    if (!form.duration.trim()) {
      toast.error("Enter the package duration.");
      return;
    }

    try {
      await runAction("save-package", () => saveTourPackage({ ...form, updatedAt: new Date().toISOString() }));
      toast.success(form.id.startsWith("package-") ? "Tour package saved successfully." : "Tour package updated successfully.");
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the tour package.");
    }
  }

  async function handleDelete(packageId: string) {
    try {
      await runAction(`delete-package-${packageId}`, () => deleteCollectionItem("geniehub-admin-tour-packages", packageId));
      toast.success("Tour package deleted successfully.");
      if (form.id === packageId) {
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete the tour package.");
    }
  }

  return (
    <AdminShell title="Tour Packages" subtitle="Create, feature, and manage travel packages so the public site and enquiry process stay aligned with operations.">
      {loading || !workspace ? <DashboardLoadingState cards={2} lines={5} /> : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Package title</label>
              <input className="field-theme" placeholder="Example: Dubai escape" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-1 block">Destination</label>
                <select className="field-theme" value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))}>
                  <option value="">Select a destination</option>
                  {destinationOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text mb-1 block">Duration</label>
                <input className="field-theme" placeholder="Example: 5 days / 4 nights" value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-1 block">Starting price</label>
                <input className="field-theme" placeholder="Example: From GHS 15,000" value={form.startingPrice} onChange={(event) => setForm((current) => ({ ...current, startingPrice: event.target.value }))} />
              </div>
              <div>
                <label className="label-text mb-1 block">Currency</label>
                <input className="field-theme" placeholder="GHS" value={form.currency ?? "GHS"} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-1 block">Travel period</label>
                <input className="field-theme" placeholder="Example: June to September 2026" value={form.travelPeriod} onChange={(event) => setForm((current) => ({ ...current, travelPeriod: event.target.value }))} />
              </div>
              <div>
                <label className="label-text mb-1 block">Specific travel dates</label>
                <input className="field-theme" placeholder="Example: 12-17 August 2026" value={form.travelDates ?? ""} onChange={(event) => setForm((current) => ({ ...current, travelDates: event.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label-text mb-1 block">Short description</label>
              <textarea className="field-theme" rows={3} placeholder="Write the package summary shown on the public site." value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Itinerary summary</label>
              <textarea className="field-theme" rows={4} placeholder="Summarise the trip highlights, accommodation, and key inclusions." value={form.itinerarySummary} onChange={(event) => setForm((current) => ({ ...current, itinerarySummary: event.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-1 block">Inclusions</label>
                <textarea className="field-theme" rows={3} placeholder="Airport pickup, hotel, tours, breakfast..." value={form.inclusions ?? ""} onChange={(event) => setForm((current) => ({ ...current, inclusions: event.target.value }))} />
              </div>
              <div>
                <label className="label-text mb-1 block">Exclusions</label>
                <textarea className="field-theme" rows={3} placeholder="Visa fee, lunch, personal shopping..." value={form.exclusions ?? ""} onChange={(event) => setForm((current) => ({ ...current, exclusions: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-text mb-2 block">Package image</label>
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
                  <input
                    className="field-theme"
                    placeholder="Paste an uploaded image URL if available"
                    value={form.imageUrl ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value, imageGallery: event.target.value ? [event.target.value] : [] }))}
                  />
                </div>
              ) : (
                <div className="card-theme-soft p-4 space-y-3">
                  <div>
                    <label className="label-text mb-1 block">Upload package image</label>
                    <input
                      ref={fileInputRef}
                      className="field-theme file:mr-3 file:rounded-full file:border-0 file:bg-accent-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-deep-green"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isPending("upload-package-image")}
                      onChange={(event) => void handleImageUpload(event.target.files?.[0] ?? null)}
                    />
                    <p className="caption text-muted-green mt-2">
                      {isPending("upload-package-image")
                        ? "Uploading image..."
                        : `Choose a JPG, PNG, or WEBP image up to ${MAX_UPLOAD_MB}MB from your device gallery.`}
                    </p>
                  </div>
                  {!!form.imageUrl && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => fileInputRef.current?.click()}>
                        Replace image
                      </button>
                      <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={clearPackageImage}>
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              )}
              {form.imageUrl ? (
                <div className="card-theme-soft overflow-hidden">
                  <div className="aspect-[16/9] bg-deep-green/60">
                    <img src={form.imageUrl} alt={form.title ? `${form.title} preview` : "Package preview"} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="caption text-muted-green">Image preview</p>
                  </div>
                </div>
              ) : (
                <div className="card-theme-soft p-4">
                  <p className="caption text-muted-green">No package image selected yet.</p>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="inline-flex items-center gap-2 body-sm text-muted-green"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Featured package</label>
              <label className="inline-flex items-center gap-2 body-sm text-muted-green"><input type="checkbox" checked={form.visible ?? true} onChange={(event) => setForm((current) => ({ ...current, visible: event.target.checked }))} /> Visible on the public site</label>
            </div>
            <div>
              <label className="label-text mb-1 block">Status</label>
              <select className="field-theme" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TourPackageRecord["status"] }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-accent" type="button" disabled={isPending("save-package")} onClick={() => void handleSave()}>{isPending("save-package") ? "Saving..." : "Save package"}</button>
              <button className="btn-outline-theme" type="button" onClick={resetForm}>Clear form</button>
            </div>
          </section>
          <section className="card-theme p-6 space-y-3">
            {paginatedItems.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                {item.imageUrl && (
                  <div className="mb-3 aspect-[16/9] overflow-hidden rounded-2xl bg-deep-green/60">
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <p className="body-sm">{item.title}</p>
                <p className="caption text-muted-green mt-1">{item.destination} | {item.startingPrice} {item.currency ?? "GHS"}</p>
                <p className="caption text-muted-green mt-1">{item.status} | {(item.visible ?? true) ? "visible" : "hidden"} | {item.featured ? "featured" : "standard"}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => loadItemForEdit(item)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" disabled={isPending(`delete-package-${item.id}`)} onClick={() => void handleDelete(item.id)}>{isPending(`delete-package-${item.id}`) ? "Deleting..." : "Delete"}</button>
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

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { createId } from "@/lib/storage";
import type { VisaServiceRecord } from "@/lib/adminTypes";

const emptyItem = (): VisaServiceRecord => ({
  id: createId("visa-service"),
  country: "",
  title: "",
  requirements: "",
  checklistContent: "",
  pricingNote: "",
  seoTitle: "",
  seoDescription: "",
  ctaEnabled: true,
  status: "published",
  updatedAt: new Date().toISOString(),
});

export default function AdminVisaServicesPage() {
  const { workspace, loading, saveVisaService, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<VisaServiceRecord>(emptyItem());
  const destinationOptions = workspace?.destinationOptions.filter((item) => item.active && item.category === "visa") ?? [];

  return (
    <AdminShell title="Visa Services CMS" subtitle="Manage country-specific visa support content, requirements, checklist copy, SEO notes, and CTA visibility.">
      {loading || !workspace ? <div className="card-theme p-6 body-md text-muted-green">Loading visa services...</div> : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Destination country</label>
              <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}>
                <option value="">Select a destination</option>
                {destinationOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text mb-1 block">Service title</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Example: UK visitor visa support" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Requirements</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={3} placeholder="List the main document and eligibility requirements." value={form.requirements} onChange={(event) => setForm((current) => ({ ...current, requirements: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Checklist content</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={3} placeholder="Write the checklist summary clients should see." value={form.checklistContent} onChange={(event) => setForm((current) => ({ ...current, checklistContent: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Pricing note</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Add any fee guidance or disclaimer." value={form.pricingNote ?? ""} onChange={(event) => setForm((current) => ({ ...current, pricingNote: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Publish status</label>
              <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as VisaServiceRecord["status"] }))}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <button className="btn-accent" type="button" onClick={() => void saveVisaService({ ...form, updatedAt: new Date().toISOString() }).then(() => setForm(emptyItem()))}>Save visa service</button>
          </section>
          <section className="card-theme p-6 space-y-3">
            {workspace.visaServices.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <p className="body-sm">{item.title}</p>
                <p className="caption text-muted-green mt-1">{item.country} | {item.status}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => setForm(item)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => void deleteCollectionItem("geniehub-admin-visa-services", item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </AdminShell>
  );
}

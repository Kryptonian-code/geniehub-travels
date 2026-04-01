import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { createId } from "@/lib/storage";
import type { ContentBlockRecord } from "@/lib/adminTypes";

const emptyItem = (): ContentBlockRecord => ({
  id: createId("content"),
  key: "",
  sectionKey: "homepage_services",
  title: "",
  description: "",
  content: "",
  icon: "FileText",
  displayOrder: 1,
  visible: true,
  published: true,
  updatedAt: new Date().toISOString(),
});

export default function AdminContentPage() {
  const { workspace, loading, saveContentBlock, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<ContentBlockRecord>(emptyItem());

  return (
    <AdminShell title="Content Blocks" subtitle="Manage homepage and shared site content in structured blocks without turning the product into a page builder.">
      {loading || !workspace ? <div className="card-theme p-6 body-md text-muted-green">Loading content blocks...</div> : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Block key</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Example: homepage.hero" value={form.key} onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Section</label>
              <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.sectionKey} onChange={(event) => setForm((current) => ({ ...current, sectionKey: event.target.value }))}>
                <option value="homepage_services">Homepage services</option>
                <option value="homepage_hero_actions">Homepage hero actions</option>
                <option value="homepage_process_steps">Homepage process steps</option>
                <option value="header_navigation">Header navigation</option>
                <option value="footer_quick_links">Footer quick links</option>
                <option value="footer_support_links">Footer support links</option>
                <option value="why_choose_us">Why choose us</option>
                <option value="trust_points">Trust points</option>
                <option value="service_highlights">Service highlights</option>
                <option value="study_abroad_support">Study abroad support</option>
              </select>
            </div>
            <div>
              <label className="label-text mb-1 block">Block title</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Example: Homepage hero" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Short description</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={3} placeholder="The helper text shown with this item." value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Content / link value</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={5} placeholder="Write the content or path used in this shared site block." value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">CTA label</span>
                <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Optional button or menu label" value={form.ctaLabel ?? ""} onChange={(event) => setForm((current) => ({ ...current, ctaLabel: event.target.value }))} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">CTA / link href</span>
                <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Example: /tours" value={form.ctaHref ?? ""} onChange={(event) => setForm((current) => ({ ...current, ctaHref: event.target.value }))} />
              </label>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Icon name</span>
                <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.icon ?? ""} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Display order</span>
                <input type="number" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.displayOrder ?? 1} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} />
              </label>
              <label className="flex items-center gap-3 body-sm rounded-lg border border-theme bg-surface-soft px-4 py-3 mt-6">
                <input type="checkbox" checked={form.visible ?? true} onChange={(event) => setForm((current) => ({ ...current, visible: event.target.checked }))} />
                Visible on site
              </label>
            </div>
            <button className="btn-accent" type="button" onClick={() => void saveContentBlock({ ...form, updatedAt: new Date().toISOString() }).then(() => setForm(emptyItem()))}>Save content block</button>
          </section>
          <section className="card-theme p-6 space-y-3">
            {workspace.contentBlocks.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <p className="body-sm">{item.title}</p>
                <p className="caption text-muted-green mt-1">{item.sectionKey} | {item.key}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => setForm(item)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => void deleteCollectionItem("geniehub-admin-content-blocks", item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </AdminShell>
  );
}

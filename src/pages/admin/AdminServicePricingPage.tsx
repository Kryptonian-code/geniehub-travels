import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { createId } from "@/lib/storage";
import type { ServicePricingRecord } from "@/lib/types";

const emptyItem = (): ServicePricingRecord => ({
  id: createId("pricing"),
  name: "",
  description: "",
  price: 0,
  currency: "GHS",
  category: "general",
  visible: true,
  displayOrder: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function AdminServicePricingPage() {
  const { workspace, loading, saveServicePricing, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<ServicePricingRecord>(emptyItem());

  return (
    <AdminShell title="Service Pricing" subtitle="Manage service names, pricing, categories, and visibility without changing the public GenieHub design language.">
      {loading || !workspace ? (
        <div className="card-theme p-6 body-md text-muted-green">Loading service pricing...</div>
      ) : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Service name</span>
                <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Category</span>
                <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              </label>
            </div>
            <label className="block">
              <span className="label-text mb-1 block">Description</span>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Price</span>
                <input type="number" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Currency</span>
                <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Display order</span>
                <input type="number" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} />
              </label>
            </div>
            <label className="flex items-center gap-3 body-sm">
              <input type="checkbox" checked={form.visible} onChange={(event) => setForm((current) => ({ ...current, visible: event.target.checked }))} />
              Show this service publicly
            </label>
            <button
              className="btn-accent"
              type="button"
              onClick={() =>
                void saveServicePricing({ ...form, updatedAt: new Date().toISOString() }).then(() => setForm(emptyItem()))
              }
            >
              Save pricing record
            </button>
          </section>
          <section className="card-theme p-6 space-y-3">
            {workspace.servicePricing.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="body-sm">{item.name}</p>
                    <p className="caption text-muted-green mt-1">{item.category} | {item.currency} {item.price.toLocaleString()}</p>
                  </div>
                  <span className="caption text-accent-gold">{item.visible ? "Visible" : "Hidden"}</span>
                </div>
                <p className="caption text-muted-green mt-3">{item.description}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => setForm(item)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => void deleteCollectionItem("geniehub-admin-service-pricing", item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </AdminShell>
  );
}

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { createId } from "@/lib/storage";
import type { FAQRecord } from "@/lib/adminTypes";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

const emptyItem = (): FAQRecord => ({
  id: createId("faq"),
  question: "",
  answer: "",
  category: "general",
  displayOrder: 1,
  published: true,
  updatedAt: new Date().toISOString(),
});

export default function AdminFaqsPage() {
  const { workspace, loading, saveFaq, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<FAQRecord>(emptyItem());
  const items = workspace?.faqs ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(items, {
    pageParam: "faqsPage",
    sizeParam: "faqsPageSize",
    defaultPageSize: 8,
  });

  return (
    <AdminShell title="FAQs" subtitle="Maintain practical answers by category so the public site and support team share the same guidance.">
      {loading || !workspace ? <div className="card-theme p-6 body-md text-muted-green">Loading FAQs...</div> : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Question</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Write the FAQ question clearly." value={form.question} onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Answer</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={4} placeholder="Write the answer shown on the public site." value={form.answer} onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Category</label>
              <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as FAQRecord["category"] }))}>
                <option value="general">General</option>
                <option value="visa">Visa</option>
                <option value="study abroad">Study abroad</option>
                <option value="tours">Tours</option>
                <option value="payments">Payments</option>
                <option value="consultations">Consultations</option>
              </select>
            </div>
            <button className="btn-accent" type="button" onClick={() => void saveFaq({ ...form, updatedAt: new Date().toISOString() }).then(() => setForm(emptyItem()))}>Save FAQ</button>
          </section>
          <section className="card-theme p-6 space-y-3">
            {paginatedItems.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <p className="body-sm">{item.question}</p>
                <p className="caption text-muted-green mt-1">{item.category}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => setForm(item)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => void deleteCollectionItem("geniehub-admin-faqs", item.id)}>Delete</button>
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

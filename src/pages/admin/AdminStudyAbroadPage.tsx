import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { createId } from "@/lib/storage";
import type { StudyAbroadRecord } from "@/lib/adminTypes";

const emptyItem = (): StudyAbroadRecord => ({
  id: createId("study"),
  country: "",
  title: "",
  programmes: "",
  intakeInfo: "",
  content: "",
  ctaBanner: "",
  status: "draft",
  updatedAt: new Date().toISOString(),
});

export default function AdminStudyAbroadPage() {
  const { workspace, loading, saveStudyAbroadRecord, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<StudyAbroadRecord>(emptyItem());
  const destinationOptions = workspace?.destinationOptions.filter((item) => item.active && item.category === "study-abroad") ?? [];

  return (
    <AdminShell title="Study Abroad Content" subtitle="Manage destination content, programme information, intake notes, and supporting CTA blocks for study pathways.">
      {loading || !workspace ? <div className="card-theme p-6 body-md text-muted-green">Loading study abroad content...</div> : (
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
              <label className="label-text mb-1 block">Content title</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Example: Canada study pathways" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Programmes</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={2} placeholder="List the key programme types you support." value={form.programmes} onChange={(event) => setForm((current) => ({ ...current, programmes: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Intake information</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={2} placeholder="Share the intakes and timing details clients should know." value={form.intakeInfo} onChange={(event) => setForm((current) => ({ ...current, intakeInfo: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Content body</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={5} placeholder="Write the destination guidance shown on the public site." value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
            </div>
            <button className="btn-accent" type="button" onClick={() => void saveStudyAbroadRecord({ ...form, updatedAt: new Date().toISOString() }).then(() => setForm(emptyItem()))}>Save study content</button>
          </section>
          <section className="card-theme p-6 space-y-3">
            {workspace.studyAbroadRecords.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <p className="body-sm">{item.title}</p>
                <p className="caption text-muted-green mt-1">{item.country} | {item.status}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => setForm(item)}>Edit</button>
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => void deleteCollectionItem("geniehub-admin-study-abroad", item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </AdminShell>
  );
}

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { createId } from "@/lib/storage";
import type { AdminUserRecord } from "@/lib/adminTypes";

const emptyUser = (): AdminUserRecord => ({
  id: createId("staff"),
  fullName: "",
  email: "",
  role: "admin",
  active: true,
  createdAt: new Date().toISOString(),
});

export default function AdminUsersPage() {
  const { workspace, loading, saveAdminUser, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<AdminUserRecord>(emptyUser());

  return (
    <AdminShell title="Admin Users & Roles" subtitle="Manage the internal team directory and prepare role-based ownership across operations, content, and finance tasks.">
      {loading || !workspace ? <div className="card-theme p-6 body-md text-muted-green">Loading admin users...</div> : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Full name</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="Example: Akosua Mensah" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Email address</label>
              <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" placeholder="name@geniehub.co" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div>
              <label className="label-text mb-1 block">Role</label>
              <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AdminUserRecord["role"] }))}>
                <option value="super-admin">Super admin</option>
                <option value="admin">Admin</option>
                <option value="content-manager">Content manager</option>
                <option value="operations-staff">Operations staff</option>
                <option value="finance-staff">Finance staff</option>
              </select>
            </div>
            <button className="btn-accent" type="button" onClick={() => void saveAdminUser(form).then(() => setForm(emptyUser()))}>Save admin user</button>
          </section>
          <section className="card-theme p-6 space-y-3">
            {workspace.adminUsers.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <p className="body-sm">{item.fullName}</p>
                <p className="caption text-muted-green mt-1">{item.email} | {item.role}</p>
                <p className="caption text-muted-green mt-1">
                  Activity logs: {workspace.auditLogs.filter((entry) => entry.actorUserId === (item.linkedUserId ?? item.id)).length}
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => setForm(item)}>Edit</button>
                  {item.id !== "admin-demo" && <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => void deleteCollectionItem("geniehub-admin-users", item.id)}>Delete</button>}
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </AdminShell>
  );
}

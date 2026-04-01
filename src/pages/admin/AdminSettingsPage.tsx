import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { AdminUserRecord } from "@/lib/adminTypes";
import type { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

export default function AdminSettingsPage() {
  const { workspace, loading, saveSettings, createStaffAccount, resetStaffPassword } = useAdminDashboard();
  const { adminRole } = useAuth();
  const [form, setForm] = useState<AppSettings | null>(null);
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    adminRole: "operations-staff" as AdminUserRecord["role"],
    isChatAgent: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState("");
  const { runAction, isPending } = useAsyncAction();

  useEffect(() => {
    setForm(workspace?.settings ?? DEFAULT_SETTINGS);
  }, [workspace?.settings]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    try {
      await runAction("save-settings", () => saveSettings(form));
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    }
  }

  async function handleCreateStaff() {
    try {
      const result = await runAction("create-staff", () => createStaffAccount(staffForm));
      setGeneratedPassword(result.tempPassword);
      setStaffForm({ fullName: "", email: "", phone: "", adminRole: "operations-staff", isChatAgent: true });
      toast.success("Staff login created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create staff login.");
    }
  }

  async function handleResetStaff(userId: string) {
    try {
      const result = await runAction(`reset-staff-${userId}`, () => resetStaffPassword(userId));
      setGeneratedPassword(result.tempPassword);
      toast.success("Temporary password generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reset password.");
    }
  }

  return (
    <AdminShell title="Settings" subtitle="Keep the business identity, support contact details, and key public-facing settings aligned across the whole product.">
      {loading || !form ? <DashboardLoadingState cards={2} lines={6} /> : (
        <div className="space-y-6">
          <form className="card-theme p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Business name</span>
                <input className="field-theme" value={form.brandName} onChange={(event) => setForm((current) => current && { ...current, brandName: event.target.value })} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Support email</span>
                <input className="field-theme" value={form.supportEmail} onChange={(event) => setForm((current) => current && { ...current, supportEmail: event.target.value })} />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Phone number</span>
                <input className="field-theme" value={form.phone} onChange={(event) => setForm((current) => current && { ...current, phone: event.target.value })} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">WhatsApp number</span>
                <input className="field-theme" value={form.whatsappNumber} onChange={(event) => setForm((current) => current && { ...current, whatsappNumber: event.target.value })} />
              </label>
            </div>
            <label className="block">
              <span className="label-text mb-1 block">Tagline</span>
              <textarea className="field-theme" rows={2} value={form.tagline} onChange={(event) => setForm((current) => current && { ...current, tagline: event.target.value })} />
            </label>
            <label className="block">
              <span className="label-text mb-1 block">Working hours</span>
              <textarea className="field-theme" rows={2} value={form.workingHours} onChange={(event) => setForm((current) => current && { ...current, workingHours: event.target.value })} />
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Instagram URL</span>
                <input className="field-theme" value={form.instagramUrl ?? ""} onChange={(event) => setForm((current) => current && { ...current, instagramUrl: event.target.value })} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Facebook URL</span>
                <input className="field-theme" value={form.facebookUrl ?? ""} onChange={(event) => setForm((current) => current && { ...current, facebookUrl: event.target.value })} />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Twitter / X URL</span>
                <input className="field-theme" value={form.twitterUrl ?? ""} onChange={(event) => setForm((current) => current && { ...current, twitterUrl: event.target.value })} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Snapchat URL</span>
                <input className="field-theme" value={form.snapchatUrl ?? ""} onChange={(event) => setForm((current) => current && { ...current, snapchatUrl: event.target.value })} />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Default currency</span>
                <input className="field-theme" value={form.defaultCurrency} onChange={(event) => setForm((current) => current && { ...current, defaultCurrency: event.target.value })} />
              </label>
              <label className="flex items-center gap-3 body-sm rounded-lg border border-theme bg-surface-soft px-4 py-3 mt-6">
                <input type="checkbox" checked={form.autoAssignChat} onChange={(event) => setForm((current) => current && { ...current, autoAssignChat: event.target.checked })} />
                Auto-assign new live chats to available chat staff
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-1 block">Tawk Property ID</span>
                <input className="field-theme" value={form.tawkPropertyId ?? ""} onChange={(event) => setForm((current) => current && { ...current, tawkPropertyId: event.target.value })} />
              </label>
              <label className="block">
                <span className="label-text mb-1 block">Tawk Widget ID</span>
                <input className="field-theme" value={form.tawkWidgetId ?? ""} onChange={(event) => setForm((current) => current && { ...current, tawkWidgetId: event.target.value })} />
              </label>
            </div>
            <button className="btn-accent" type="submit" disabled={isPending("save-settings")}>{isPending("save-settings") ? "Saving..." : "Save settings"}</button>
          </form>

          {adminRole === "super-admin" && (
            <section className="card-theme p-6 space-y-5">
              <div>
                <h2 className="heading-sm">Staff access</h2>
                <p className="body-sm text-muted-green mt-2">
                  Create staff logins with a temporary password. On first sign-in they will be required to create a new password before using the dashboard.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label-text mb-1 block">Full name</span>
                  <input className="field-theme" value={staffForm.fullName} onChange={(event) => setStaffForm((current) => ({ ...current, fullName: event.target.value }))} />
                </label>
                <label className="block">
                  <span className="label-text mb-1 block">Email address</span>
                  <input className="field-theme" value={staffForm.email} onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))} />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label-text mb-1 block">Phone number</span>
                  <input className="field-theme" value={staffForm.phone} onChange={(event) => setStaffForm((current) => ({ ...current, phone: event.target.value }))} />
                </label>
                <label className="block">
                  <span className="label-text mb-1 block">Responsibility</span>
                  <select className="field-theme" value={staffForm.adminRole} onChange={(event) => setStaffForm((current) => ({ ...current, adminRole: event.target.value as AdminUserRecord["role"] }))}>
                    <option value="admin">Admin</option>
                    <option value="content-manager">Content manager</option>
                    <option value="operations-staff">Operations staff</option>
                    <option value="finance-staff">Finance staff</option>
                  </select>
                </label>
              </div>
              <label className="flex items-center gap-3 body-sm">
                <input type="checkbox" checked={staffForm.isChatAgent} onChange={(event) => setStaffForm((current) => ({ ...current, isChatAgent: event.target.checked }))} />
                Allow this staff member to receive live chat assignments
              </label>
              <button className="btn-accent" type="button" disabled={isPending("create-staff")} onClick={() => void handleCreateStaff()}>
                {isPending("create-staff") ? "Creating..." : "Create staff login"}
              </button>

              {generatedPassword && (
                <div className="card-theme-soft p-4">
                  <label className="block">
                    <span className="label-text text-accent-gold mb-2 block">Temporary password</span>
                    <input
                      aria-label="Temporary password"
                      readOnly
                      value={generatedPassword}
                      className="w-full rounded-lg border border-theme bg-surface px-4 py-3 body-sm text-[color:var(--color-text-main)]"
                    />
                  </label>
                  <p className="caption text-muted-green mt-2">
                    Share this with the staff member once. They will be asked to choose a new password immediately after their first sign-in.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {workspace?.adminUsers.map((item) => (
                  <div key={item.id} className="card-theme-soft p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="body-sm">{item.fullName}</p>
                      <p className="caption text-muted-green mt-1">
                        {item.email} | {item.role} | {item.isChatAgent ? "chat enabled" : "chat disabled"} | {item.mustChangePassword ? "password update pending" : "password active"}
                      </p>
                    </div>
                    {item.linkedUserId && item.linkedUserId !== "admin-demo" && (
                      <button className="btn-outline-theme py-2 px-4 text-sm" type="button" disabled={isPending(`reset-staff-${item.linkedUserId}`)} onClick={() => void handleResetStaff(item.linkedUserId!)}>
                        {isPending(`reset-staff-${item.linkedUserId}`) ? "Resetting..." : "Reset password"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AdminShell>
  );
}

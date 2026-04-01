import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { COUNTRIES } from "@/lib/countries";
import type { ClientProfile, ContactMethod } from "@/lib/types";

export default function ProfilePage() {
  const { workspace, loading, saveProfile } = useClientDashboard();
  const [form, setForm] = useState<ClientProfile | null>(null);
  const { runAction, isPending } = useAsyncAction();

  useEffect(() => {
    if (workspace?.profile) {
      setForm(workspace.profile);
    }
  }, [workspace?.profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    try {
      await runAction("save-profile", () => saveProfile(form));
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile.");
    }
  }

  return (
    <DashboardShell title="Profile Settings" subtitle="Keep your personal details, passport information, and communication preferences up to date.">
      <section className="card-theme p-6">
        {loading || !form ? (
          <DashboardLoadingState cards={1} lines={6} />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-2 block">Full name</span>
                <input className="field-theme" value={form.fullName} onChange={(event) => setForm((current) => current && { ...current, fullName: event.target.value })} placeholder="Enter your full name" />
              </label>
              <label className="block">
                <span className="label-text mb-2 block">Email address</span>
                <input className="field-theme" value={form.email} onChange={(event) => setForm((current) => current && { ...current, email: event.target.value })} placeholder="Enter your email address" />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-2 block">Phone number</span>
                <input className="field-theme" value={form.phone ?? ""} onChange={(event) => setForm((current) => current && { ...current, phone: event.target.value })} placeholder="Enter your phone number" />
              </label>
              <label className="block">
                <span className="label-text mb-2 block">Date of birth</span>
                <input type="date" className="field-theme" value={form.dateOfBirth ?? ""} onChange={(event) => setForm((current) => current && { ...current, dateOfBirth: event.target.value })} />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-text mb-2 block">Nationality</span>
                <select
                  className="field-theme max-h-64"
                  value={form.nationality ?? ""}
                  onChange={(event) => setForm((current) => current && { ...current, nationality: event.target.value })}
                >
                  <option value="">Select your nationality</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label-text mb-2 block">Passport number</span>
                <input className="field-theme" value={form.passportNumber ?? ""} onChange={(event) => setForm((current) => current && { ...current, passportNumber: event.target.value })} placeholder="Enter your passport number" />
              </label>
            </div>
            <label className="block">
              <span className="label-text mb-2 block">Preferred contact method</span>
              <select className="field-theme" value={form.preferredContactMethod} onChange={(event) => setForm((current) => current && { ...current, preferredContactMethod: event.target.value as ContactMethod })}>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <div>
              <p className="label-text mb-2">Communication preferences</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="card-theme-soft p-4 body-sm flex items-center gap-3"><input type="checkbox" checked={form.communicationPreferences.email} onChange={(event) => setForm((current) => current && { ...current, communicationPreferences: { ...current.communicationPreferences, email: event.target.checked } })} /> Email updates</label>
                <label className="card-theme-soft p-4 body-sm flex items-center gap-3"><input type="checkbox" checked={form.communicationPreferences.whatsapp} onChange={(event) => setForm((current) => current && { ...current, communicationPreferences: { ...current.communicationPreferences, whatsapp: event.target.checked } })} /> WhatsApp updates</label>
                <label className="card-theme-soft p-4 body-sm flex items-center gap-3"><input type="checkbox" checked={form.communicationPreferences.sms} onChange={(event) => setForm((current) => current && { ...current, communicationPreferences: { ...current.communicationPreferences, sms: event.target.checked } })} /> SMS updates</label>
              </div>
            </div>
            <button className="btn-accent" type="submit" disabled={isPending("save-profile")}>{isPending("save-profile") ? "Saving..." : "Save profile"}</button>
          </form>
        )}
      </section>
    </DashboardShell>
  );
}

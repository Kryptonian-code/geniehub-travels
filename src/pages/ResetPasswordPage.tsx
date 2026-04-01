import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updatePassword } from "@/lib/backend";
import { getDefaultAdminPath } from "@/lib/adminAccess";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const targetPath = user.role === "admin" ? getDefaultAdminPath(user) : "/dashboard";

    if (password.length < 8) {
      toast.error("Use at least 8 characters for the new password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await updatePassword(password);
      try {
        await refresh();
      } catch {
        // Keep the user moving even if the session refresh falls back or stalls briefly.
      }
      toast.success("Password updated.");
      navigate(targetPath, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-deep px-4 py-10 md:py-16">
      <motion.div
        className="max-w-xl mx-auto card-theme p-8 md:p-10"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <p className="label-text text-accent-gold uppercase tracking-wide">Security step</p>
        <h1 className="heading-md mt-3">Create your new password</h1>
        <p className="body-sm text-muted-green mt-3">
          This is required before you can continue. Choose a password you will remember and keep private.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label-text mb-1 block">New password</label>
            <input
              aria-label="New password"
              type="password"
              className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div>
            <label className="label-text mb-1 block">Confirm new password</label>
            <input
              aria-label="Confirm new password"
              type="password"
              className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} className="btn-accent w-full" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save new password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

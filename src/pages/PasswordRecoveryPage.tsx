import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { consumePasswordReset } from "@/lib/backend";

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await consumePasswordReset(token, password);
      toast.success("Password updated. You can sign in now.");
      navigate("/login?workspace=client", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete password reset.");
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
        <p className="label-text text-accent-gold uppercase tracking-wide">Recovery link</p>
        <h1 className="heading-md mt-3">Choose a new password</h1>
        <p className="body-sm text-muted-green mt-3">
          Create a strong password for your GenieHub account. This recovery link is single-use and expires automatically.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label-text mb-1 block">New password</label>
            <input aria-label="Recovered password" type="password" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div>
            <label className="label-text mb-1 block">Confirm new password</label>
            <input aria-label="Confirm recovered password" type="password" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} className="btn-accent w-full" type="submit" disabled={saving || !token}>
            {saving ? "Saving..." : "Update password"}
          </motion.button>
        </form>

        {!token && (
          <p className="caption text-red-300 mt-4">This recovery link is incomplete. Request a fresh password reset link.</p>
        )}

        <p className="body-sm text-muted-green mt-6">
          Need a fresh link?{" "}
          <Link to="/forgot-password" className="text-accent-gold font-semibold hover:underline underline-offset-4">
            Start recovery again
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

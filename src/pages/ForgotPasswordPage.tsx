import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { requestPasswordReset } from "@/lib/backend";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSubmitting(true);
      const response = await requestPasswordReset(email);
      setRecoveryLink(response.resetUrl ?? null);
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start password recovery.");
    } finally {
      setSubmitting(false);
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
        <p className="label-text text-accent-gold uppercase tracking-wide">Password recovery</p>
        <h1 className="heading-md mt-3">Reset access securely</h1>
        <p className="body-sm text-muted-green mt-3">
          Enter the email address attached to your GenieHub account. We will generate a secure recovery link so you can choose a new password.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label-text mb-1 block">Email address</label>
            <input
              aria-label="Email address"
              type="email"
              className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} className="btn-accent w-full" type="submit" disabled={submitting}>
            {submitting ? "Generating secure link..." : "Send recovery link"}
          </motion.button>
        </form>

        {recoveryLink && (
          <div className="card-theme-soft p-4 mt-6">
            <p className="label-text text-accent-gold">Recovery link</p>
            <p className="caption text-muted-green mt-2">
              Demo mode shows the secure link directly here. In full email mode this should be delivered to the user’s inbox.
            </p>
            <Link to={recoveryLink.replace(window.location.origin, "")} className="body-sm mt-3 inline-flex break-all text-accent-gold hover:underline">
              {recoveryLink}
            </Link>
          </div>
        )}

        <p className="body-sm text-muted-green mt-6">
          Remembered it?{" "}
          <Link to="/login?workspace=client" className="text-accent-gold font-semibold hover:underline underline-offset-4">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

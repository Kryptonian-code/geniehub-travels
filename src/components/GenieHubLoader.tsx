import { motion } from "framer-motion";

export default function GenieHubLoader({
  message = "Loading GenieHub",
  fullScreen = true,
  compact = false,
}: {
  message?: string;
  fullScreen?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`${fullScreen ? "min-h-screen" : ""} ${compact ? "py-4" : "px-6 py-10"} flex items-center justify-center bg-deep text-[color:var(--color-text-main)]`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full border border-[color:var(--color-border)]"
            animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute inset-[7px] rounded-full border-2 border-transparent border-t-[color:var(--color-accent)] border-r-[color:var(--color-primary-hover)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <span className="heading-sm text-accent-gold">G</span>
        </div>
        <div className="text-center">
          <p className="heading-sm">{message}</p>
          <p className="caption text-muted-green mt-1">Preparing your workspace and latest content.</p>
        </div>
      </div>
    </div>
  );
}

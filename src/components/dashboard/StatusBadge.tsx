import { cn } from "@/lib/utils";
import type { RecordStatus } from "@/lib/types";

const statusTone: Record<RecordStatus, string> = {
  new: "bg-surface text-accent-gold border-theme",
  submitted: "bg-surface text-accent-gold border-theme",
  scheduled: "bg-surface text-accent-gold border-theme",
  pending: "bg-surface text-accent-gold border-theme",
  confirmed: "bg-[color:rgba(31,157,132,0.14)] text-[color:var(--color-success)] border-[color:rgba(31,157,132,0.35)]",
  rescheduled: "bg-surface text-muted-green border-theme",
  cancelled: "bg-[color:rgba(214,69,69,0.12)] text-[color:var(--color-danger)] border-[color:rgba(214,69,69,0.32)]",
  "documents-pending": "bg-surface text-accent-gold border-theme",
  "under-review": "bg-[color:rgba(15,107,87,0.15)] text-[color:var(--color-text-main)] border-[color:rgba(15,107,87,0.35)]",
  approved: "bg-[color:rgba(31,157,132,0.14)] text-[color:var(--color-success)] border-[color:rgba(31,157,132,0.35)]",
  completed: "bg-[color:rgba(31,157,132,0.14)] text-[color:var(--color-success)] border-[color:rgba(31,157,132,0.35)]",
  "more-info-needed": "bg-[color:rgba(230,184,0,0.12)] text-[color:var(--color-warning)] border-[color:rgba(230,184,0,0.32)]",
  received: "bg-surface text-accent-gold border-theme",
  "in-review": "bg-[color:rgba(15,107,87,0.15)] text-[color:var(--color-text-main)] border-[color:rgba(15,107,87,0.35)]",
  "awaiting-client-response": "bg-[color:rgba(230,184,0,0.12)] text-[color:var(--color-warning)] border-[color:rgba(230,184,0,0.32)]",
  processed: "bg-[color:rgba(15,107,87,0.15)] text-[color:var(--color-text-main)] border-[color:rgba(15,107,87,0.35)]",
  paid: "bg-[color:rgba(31,157,132,0.14)] text-[color:var(--color-success)] border-[color:rgba(31,157,132,0.35)]",
  failed: "bg-[color:rgba(214,69,69,0.12)] text-[color:var(--color-danger)] border-[color:rgba(214,69,69,0.32)]",
  refunded: "bg-surface text-muted-green border-theme",
  "pending-review": "bg-surface text-accent-gold border-theme",
  rejected: "bg-[color:rgba(214,69,69,0.12)] text-[color:var(--color-danger)] border-[color:rgba(214,69,69,0.32)]",
  "re-upload-required": "bg-[color:rgba(230,184,0,0.12)] text-[color:var(--color-warning)] border-[color:rgba(230,184,0,0.32)]",
  "in-progress": "bg-[color:rgba(15,107,87,0.15)] text-[color:var(--color-text-main)] border-[color:rgba(15,107,87,0.35)]",
  blocked: "bg-[color:rgba(214,69,69,0.12)] text-[color:var(--color-danger)] border-[color:rgba(214,69,69,0.32)]",
};

export default function StatusBadge({ status, className }: { status: RecordStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 caption uppercase tracking-wide",
        statusTone[status],
        className,
      )}
    >
      {status.replaceAll("-", " ")}
    </span>
  );
}

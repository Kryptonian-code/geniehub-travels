import { ReactNode } from "react";

export default function SummaryCard({
  title,
  value,
  caption,
  icon,
}: {
  title: string;
  value: string | number;
  caption: string;
  icon: ReactNode;
}) {
  return (
    <div className="card-theme p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="caption text-muted-green uppercase tracking-wide">{title}</p>
          <p className="heading-sm mt-2">{value}</p>
        </div>
        <div className="rounded-2xl bg-surface-soft p-3 text-accent-gold">{icon}</div>
      </div>
      <p className="body-sm text-muted-green mt-3">{caption}</p>
    </div>
  );
}

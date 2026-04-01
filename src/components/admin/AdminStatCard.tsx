import { ReactNode } from "react";

export default function AdminStatCard({
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
      <div className="flex items-center justify-between gap-3">
        <p className="caption text-muted-green uppercase tracking-wide">{title}</p>
        <span className="text-accent-gold">{icon}</span>
      </div>
      <p className="heading-sm mt-3">{value}</p>
      <p className="caption text-muted-green mt-2">{caption}</p>
    </div>
  );
}

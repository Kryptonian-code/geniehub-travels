export default function ProgressTracker({
  title,
  steps,
}: {
  title: string;
  steps: Array<{ title: string; complete: boolean }>;
}) {
  const completed = steps.filter((step) => step.complete).length;
  const progress = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  return (
    <div className="card-theme p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="caption text-muted-green uppercase tracking-wide">Progress Summary</p>
          <h3 className="heading-sm mt-2">{title}</h3>
        </div>
        <span className="heading-sm text-accent-gold">{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
        <div className="h-full rounded-full bg-[color:var(--color-accent)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-5 grid gap-3">
        {steps.map((step) => (
          <div key={step.title} className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${step.complete ? "bg-[color:var(--color-success)]" : "bg-surface-soft border border-theme"}`} />
            <span className={`body-sm ${step.complete ? "text-[color:var(--color-text-main)]" : "text-muted-green"}`}>{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card-theme-soft p-6 text-center">
      <p className="body-md">{title}</p>
      <p className="body-sm text-muted-green mt-2 max-w-md mx-auto">{description}</p>
    </div>
  );
}

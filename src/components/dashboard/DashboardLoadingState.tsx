export default function DashboardLoadingState({
  lines = 3,
  cards = 1,
}: {
  lines?: number;
  cards?: number;
}) {
  return (
    <div className="panel-list">
      {Array.from({ length: cards }).map((_, cardIndex) => (
        <div key={cardIndex} className="loading-card">
          <div className="loading-line h-4 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: lines }).map((__, lineIndex) => (
              <div
                key={lineIndex}
                className={`loading-line ${lineIndex === lines - 1 ? "w-2/3" : "w-full"} h-3`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

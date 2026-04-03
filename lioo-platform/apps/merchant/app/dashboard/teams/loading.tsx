export default function TeamsLoading() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse" aria-busy="true" aria-label="Memuat tim">
      <div className="h-9 w-56 rounded-lg bg-surface-container-high mb-2" />
      <div className="h-4 w-full max-w-xl rounded bg-surface-container-low mb-8" />

      <div className="h-24 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 mb-8" />

      <div className="rounded-2xl border border-outline-variant/20 overflow-hidden bg-surface-container-lowest">
        <div className="h-12 bg-surface-container-low border-b border-outline-variant/15" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 border-b border-outline-variant/10 flex items-center px-4 gap-4">
            <div className="h-10 w-10 rounded-full bg-surface-container-high shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-48 rounded bg-surface-container-high" />
              <div className="h-3 w-32 rounded bg-surface-container-low" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WalletLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse" aria-busy="true" aria-label="Memuat wallet">
      <div className="h-8 w-64 rounded-lg bg-surface-container-high mb-2" />
      <div className="h-4 w-96 max-w-full rounded bg-surface-container-low mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-72 rounded-3xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm" />
        <div className="lg:col-span-4 h-72 rounded-3xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm" />
      </div>

      <div className="mt-10 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-container-low border border-outline-variant/10" />
        ))}
      </div>
    </div>
  );
}

export default function MenuCatalogLoading() {
  return (
    <div className="max-w-7xl mx-auto pb-12 animate-pulse" aria-busy="true" aria-label="Memuat katalog menu">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-surface-container-high" />
          <div className="h-10 w-80 max-w-full rounded-lg bg-surface-container-high" />
          <div className="h-4 w-64 rounded bg-surface-container-low" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-36 rounded-full bg-surface-container-low" />
          <div className="h-12 w-40 rounded-full bg-primary/20" />
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-surface-container-high" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden"
          >
            <div className="aspect-square bg-surface-container-highest" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-[75%] rounded bg-surface-container-high" />
              <div className="h-5 w-1/2 rounded bg-surface-container-low" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

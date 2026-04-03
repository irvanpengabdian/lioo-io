/** Skeleton saat memuat Overview — feedback instan saat navigasi client. */
export default function DashboardLoading() {
  return (
    <div className="max-w-[1600px] mx-auto animate-pulse" aria-busy="true" aria-label="Memuat dashboard">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3">
          <div className="h-14 w-72 rounded-xl bg-surface-container-high" />
          <div className="h-4 w-48 rounded-lg bg-surface-container-low" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-48 rounded-full bg-surface-container-low" />
          <div className="h-12 w-44 rounded-full bg-surface-container-high" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-2 h-64 rounded-[2rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10" />
        <div className="h-52 rounded-[2rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10" />
        <div className="h-52 rounded-[2rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-80 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10" />
          <div className="h-96 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10" />
        </div>
        <div className="space-y-8">
          <div className="h-56 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10" />
          <div className="h-64 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10" />
        </div>
      </div>
    </div>
  );
}

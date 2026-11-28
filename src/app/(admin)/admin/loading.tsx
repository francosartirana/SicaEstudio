export default function AdminLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando panel administrativo"
      className="min-h-screen bg-[#F6F3EC] p-3 sm:p-5 lg:p-6 animate-pulse"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-5">
        <div className="hidden lg:block w-64 shrink-0 h-[calc(100vh-3rem)] rounded-3xl border border-[#E8DECF] bg-white/80" />

        <div className="flex-1 space-y-5">
          <div className="h-24 rounded-3xl border border-[#E8DECF] bg-white/80" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-3xl border border-[#E8DECF] bg-white/80"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-8 h-96 rounded-3xl border border-[#E8DECF] bg-white/80" />
            <div className="xl:col-span-4 h-96 rounded-3xl border border-[#E8DECF] bg-white/80" />
          </div>
        </div>
      </div>
    </div>
  )
}

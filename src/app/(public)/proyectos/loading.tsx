export default function ProyectosLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando proyectos"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-40 pb-20 space-y-10 animate-pulse"
    >
      {/* Encabezado skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-44 rounded-full bg-[#E8DECF]/80" />
        <div className="h-10 w-72 sm:w-96 rounded-2xl bg-[#E8DECF]" />
        <div className="h-4 w-full max-w-xl rounded-full bg-[#E8DECF]/70" />
      </div>

      {/* Barra de filtros skeleton */}
      <div className="h-16 w-full rounded-2xl border border-[#E8DECF] bg-white/70" />

      {/* Grilla de cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl sm:rounded-2xl border border-[#E8DECF] bg-white overflow-hidden"
          >
            <div className="aspect-square w-full bg-[#F5EFE6]" />
            <div className="p-3 sm:p-6 space-y-3">
              <div className="h-5 w-3/4 rounded-lg bg-[#E8DECF]" />
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-full bg-[#E8DECF]/70" />
                <div className="h-3 w-2/3 rounded-full bg-[#E8DECF]/70" />
              </div>
              <div className="h-9 sm:h-10 w-full rounded-full bg-[#E8DECF]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

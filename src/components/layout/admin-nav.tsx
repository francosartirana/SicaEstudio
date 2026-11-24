import Link from 'next/link'

export function AdminNav() {
  return (
    <header className="border-b border-neutral-200 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-bold text-lg tracking-tight">
            SicaEstudio <span className="text-amber-400 font-normal text-xs uppercase px-2 py-0.5 rounded bg-neutral-800">Admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-300">
            <Link href="/admin" className="hover:text-white transition-colors">
              Productos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" target="_blank" className="text-neutral-400 hover:text-white transition-colors text-xs">
            Ver web pública &rarr;
          </Link>
        </div>
      </div>
    </header>
  )
}

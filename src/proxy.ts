import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  /*
   * En Next.js 16 (convención Proxy), limitamos la ejecución a las rutas
   * protegidas (/admin) y de autenticación (/login).
   * De este modo, la vidriera pública no sufre sobrecargas ni demoras.
   */
  matcher: ['/admin/:path*', '/login'],
}

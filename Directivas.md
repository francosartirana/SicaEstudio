# Contexto del Proyecto
Actúa como un Tech Lead experto en Next.js, React, y Supabase. Vamos a desarrollar una aplicación web "vidriera" para un emprendimiento de diseños personalizados (etiquetas de vinos, álbumes de figuritas, tarjetas empresariales).
La web tiene dos flujos principales:
1. PÚBLICO: Los usuarios navegan por las categorías, ven imágenes optimizadas de los trabajos y, al interesarse en uno, son redirigidos a WhatsApp con un mensaje predefinido. No hay carrito de compras ni pasarela de pagos.
2. PRIVADO (Admin): Un panel de control donde el administrador puede autenticarse para hacer un CRUD (Crear, Leer, Actualizar, Borrar) de los productos/trabajos mostrados en la web, subiendo las imágenes correspondientes.

# Stack Tecnológico
- Framework: Next.js (App Router) >= 14
- Lenguaje: TypeScript
- Estilos: Tailwind CSS
- Backend / Base de Datos: Supabase (PostgreSQL, Auth, Storage)
- Despliegue: Vercel

# Arquitectura y Estructura de Carpetas
Sigue una estructura inspirada en MVC adaptada al App Router de Next.js:
- `/src/app`: Rutas de la aplicación (Server Components por defecto). Usar Route Groups como `(public)` y `(admin)` para separar layouts.
- `/src/components`: Componentes modulares separados en `/ui` (elementos base) y `/layout` (headers, footers).
- `/src/lib/actions`: Server Actions (Controladores) para mutaciones de datos (CRUD).
- `/src/lib/supabase`: Configuración de los clientes de Supabase (SSR).
- `/src/types`: Definiciones de interfaces TypeScript.

# Directivas de Frontend (UI/UX)
1. Server-First: Usa React Server Components (RSC) por defecto para obtener los datos de los productos directamente en la vista. Usa Client Components (`"use client"`) estrictamente cuando necesites interactividad (ej. botones, modales, formularios).
2. Optimización de Imágenes: Es un proyecto visual. Usa el componente `<Image>` de Next.js obligatoriamente. Configura los `remotePatterns` en `next.config.mjs` para permitir imágenes desde el Storage de Supabase.
3. Diseño Mobile-First: Utiliza las utilidades de Tailwind CSS para garantizar que la grilla de productos se vea excelente primero en celulares y luego escale a desktop.
4. WhatsApp Redirect: El Call to Action (CTA) de cada producto debe ser un enlace `href="https://wa.me/<NUMERO>?text=<MENSAJE>"` dinámico.

# Directivas de Backend (Data & Mutaciones)
1. Server Actions: Todas las operaciones del panel de administración (crear producto, eliminar producto) deben manejarse mediante Server Actions, no mediante API Routes (`/app/api`).
2. Revalidación de Caché: Tras cualquier mutación (ej. el admin sube una nueva etiqueta), el Server Action debe ejecutar `revalidatePath('/etiquetas')` para que los usuarios vean el nuevo producto sin reconstruir todo el sitio.
3. Supabase SSR: Utiliza el paquete `@supabase/ssr` para manejar las cookies de sesión tanto en Server Components como en Server Actions.
4. Storage: El flujo de creación de un producto debe subir primero la imagen a un bucket público de Supabase Storage, obtener la URL pública, y luego insertar el registro en la base de datos de PostgreSQL con esa URL.

# Directivas de Seguridad
1. Middleware de Autenticación: Implementa un `middleware.ts` en la raíz de `/src` que intercepte cualquier petición a la ruta `/admin`. Si no hay una sesión activa de Supabase, debe redirigir a `/login`.
2. Row Level Security (RLS): Las tablas en Supabase deben tener RLS habilitado.
   - Políticas de lectura (SELECT): Públicas (cualquiera puede ver los productos).
   - Políticas de mutación (INSERT, UPDATE, DELETE): Restringidas exclusivamente a usuarios autenticados.
   - El bucket de Storage debe permitir lectura pública pero escritura/borrado solo a usuarios autenticados.
3. Validación de Entradas: Usa `Zod` en los Server Actions para validar estrictamente los datos de los formularios (títulos, descripciones, categorías) antes de enviarlos a la base de datos.
4. Variables de Entorno: Mantén las keys de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en `.env.local`. Nunca expongas la `SERVICE_ROLE_KEY` en el cliente.

A partir de este momento, asimila estas directivas. Para empezar, generame la estructura de carpetas inicial y el código para el `middleware.ts` que protegerá las rutas del administrador.
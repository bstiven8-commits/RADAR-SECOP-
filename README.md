# Radar SECOP

Buscador de procesos de SECOP I y II con filtros (plataforma, modalidad, estado, departamento, fechas, palabra clave) y alarmas por correo. Next.js + Supabase + Resend, desplegable en Vercel.

## Cómo funciona

- **Búsqueda:** consulta en vivo los datasets abiertos de datos.gov.co (`p6dx-8zbt` SECOP II, `f789-7hwg` SECOP I). No hay que copiar datos a tu base.
- **Registro:** el usuario escribe su correo y recibe un enlace de acceso (sin contraseña).
- **Alarmas:** guardan un conjunto de filtros. Cada 30 min un cron llama a `/api/cron`, que busca procesos de los últimos 7 días, descarta los ya avisados (`alarm_hits`) y envía **un solo correo por usuario** con todo lo nuevo. La primera corrida de cada alarma solo guarda la línea base para no enviar procesos viejos.
- **Planes:** `lib/plans.ts` ya limita alarmas por plan (`free` 5). Hoy todos son `free`.

## Puesta en marcha

1. **Supabase:** crea un proyecto, pega `supabase/schema.sql` en SQL Editor. En Authentication > URL Configuration agrega la URL de tu sitio como Site URL / Redirect URL.
2. **Resend:** verifica tu dominio y crea una API key.
3. **Variables:** copia `.env.example` a `.env.local` y complétalo.
4. **Verifica las columnas reales:** `npm install && npm run check:fields`. Si algún nombre de columna difiere, el script lo dice; ajusta `DATASETS` y `normalize()` en `lib/secop.ts`.
5. `npm run dev`.
6. **Vercel:** importa el repo y carga las mismas variables.
7. **Cron:** en GitHub, Settings > Secrets, agrega `APP_URL` (https://tu-sitio) y `CRON_SECRET` (el mismo de Vercel). `.github/workflows/cron.yml` reemplaza el `radar.yml` anterior.

## Para monetizar

- Cobrar: integra Wompi, Mercado Pago o Stripe y que su webhook cambie `profiles.plan`.
- Ya listo: límites por plan, tabla de perfiles, un correo agrupado por usuario.
- Ideas de planes de pago: más alarmas, alertas más frecuentes, exportar a Excel, favoritos, alertas por WhatsApp/Telegram.

## Ya incluido para cumplimiento

- **Baja en cada correo:** enlace firmado (`/api/baja`) y cabecera `List-Unsubscribe` de un clic. Pausa todas las alarmas del usuario; puede reactivarlas en /alarmas.
- **Política de datos:** borrador en `/privacidad` (Ley 1581). Complétalo con responsable, NIT y domicilio y revísalo con un abogado.

## Pendientes recomendados antes de abrir al público

- Anti-abuso en el registro: en Supabase > Authentication > Attack Protection activa CAPTCHA (Turnstile) y limita los correos por hora.
- Nombre, dominio y correo de contacto definitivos (`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`).

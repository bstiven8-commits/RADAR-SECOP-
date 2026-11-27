# Auditoría de accesibilidad: Radar SECOP (código en main)

**Perspectiva**: Ingeniero de accesibilidad (más notas breves de diseño, frontend, backend y DX)
**Fecha**: 2026-11-27
**Alcance**: components/Buscador.tsx, AuthBar.tsx, app/favoritos, app/alarmas, app/layout.tsx, app/globals.css, app/api/*
**Método**: lectura de código y cálculo de contraste. No se probó con lector de pantalla real ni en navegador.

## Veredicto: APROBADO CON CAMBIOS
Base sólida: `lang="es"`, enlace "Saltar al contenido", `:focus-visible`, controles de 44 px, `prefers-reduced-motion` para la animación del logo, contraste de texto alto en claro y oscuro, estado del proceso con forma además de color. Los problemas son de detalle, no estructurales.

## Problemas críticos (corregir)
| # | Problema | WCAG | Archivo | Impacto | Arreglo |
|---|----------|------|---------|---------|---------|
| 1 | Los resultados de búsqueda no se anuncian: el contador ("20 procesos") y el "Buscando…" no están en una región viva | 4.1.3 | Buscador.tsx (`.resumen`, estado de carga) | Quien usa lector de pantalla pulsa Buscar y no oye nada | `role="status"` (o `aria-live="polite"`) en el contador y en el aviso de "sin resultados" |
| 2 | Los bordes de campos y listas (`--line`) tienen contraste 1,28 a 1,39:1 con el fondo; piden 3:1 | 1.4.11 | globals.css (`input, select`) | Con baja visión no se distinguen los campos de "Más filtros", alarma y favoritos | Oscurecer el borde de inputs/selects (p. ej. `#7d8a83` en claro, `#5f7068` en oscuro). El campo principal ya usa borde `--ink` |
| 3 | Enlaces y botones repetidos con el mismo nombre: "Ver detalle", "Abrir en SECOP", "☆ Guardar", "Quitar" en cada tarjeta | 2.4.4, 4.1.2 | Buscador.tsx, favoritos/page.tsx | La lista de enlaces del lector queda como 20 "Ver detalle" iguales | `aria-label` con el contexto, p. ej. `Ver detalle: {objeto resumido}` |

## Recomendaciones
| # | Problema | WCAG | Arreglo |
|---|----------|------|---------|
| 4 | Jerarquía de títulos: h1 y luego h3 en cada resultado, sin h2 | 1.3.1 | Cambiar `h3` por `h2` en resultados (y mantener el estilo en CSS) |
| 5 | El botón Guardar cambia su texto ("☆ Guardar" / "★ Guardado") y además usa `aria-pressed`: se anuncia doble | 4.1.2 | Texto fijo "Guardar proceso" con `aria-pressed`; la estrella queda como adorno (`aria-hidden`) |
| 6 | "Cargar más" se deshabilita mientras carga y el foco se pierde | 2.4.3 | No usar `disabled`; usar `aria-disabled`, o devolver el foco al primer resultado nuevo |
| 7 | En /favoritos el selector de estado y la nota tienen la misma etiqueta en cada fila | 4.1.2 | Etiqueta con contexto: `Estado de seguimiento de {objeto}` |
| 8 | Los mensajes de error (`role="alert"`) no están ligados al campo que falló | 3.3.1 | `aria-describedby` en el campo; en el formulario de registro, mostrar el error junto al correo |
| 9 | La trampa anti-bot (`input.trampa`) está con `aria-hidden` pero es un input; algunos lectores lo leen | 4.1.2 | Mantenerlo fuera del árbol: `display:none` no sirve contra bots, así que usar contenedor con `aria-hidden` y `inert` |
| 10 | Falta `prefers-reduced-motion` global si se añaden más transiciones | 2.3.3 | Regla global `@media (prefers-reduced-motion: reduce) { *{animation:none!important; transition:none!important} }` |

## Nice-to-haves
| # | Sugerencia | Razón |
|---|------------|-------|
| 1 | Anunciar "Proceso guardado" con una región viva | Confirma la acción a quien no ve el cambio de estrella |
| 2 | Fechas en formato largo para lector ("12 de marzo de 2026") con `<time datetime>` | Mejor lectura |
| 3 | Tabla "Todos los datos del proceso": añadir `<caption>` y `scope="row"` | Navegación por tablas |

## Recorrido por teclado
| Paso | Acción | Foco esperado | Anuncio esperado | ¿Se cumple? |
|------|--------|---------------|------------------|-------------|
| 1 | Tab desde la carga | "Saltar al contenido" | "Saltar al contenido, enlace" | Sí |
| 2 | Enter en el enlace | Contenido principal | Entra a main | Sí (`tabIndex=-1`) |
| 3 | Escribir palabra y Enter | Botón Buscar | "Buscando…", luego "N procesos" | **No**: no se anuncia (problema 1) |
| 4 | Tab por resultados | Enlaces y botón Guardar | Nombre del enlace | **Parcial**: nombres repetidos (problema 3) |
| 5 | "Más filtros" (details/summary) | Resumen | Expandido/contraído | Sí (elemento nativo) |
| 6 | Cargar más | Botón | Nuevos resultados | **Parcial**: foco se pierde (problema 6) |
| 7 | Escape en diálogos | n/a | n/a | Se usan `confirm()` nativos: accesibles |

## Lista ARIA
| Elemento | Rol | Etiqueta | Estados | Teclado | Notas |
|----------|-----|----------|---------|---------|-------|
| Campo de búsqueda | searchbox | Sí | n/a | Sí | OK |
| Selects del buscador | combobox | `aria-label` o `<label>` | n/a | Sí | OK |
| Chips de sector / estado | button | Texto visible | `aria-pressed` | Sí | OK |
| Guardar proceso | button | Cambia con el estado | `aria-pressed` | Sí | Ver recomendación 5 |
| Resumen de resultados | (ninguno) | n/a | n/a | n/a | Falta región viva |
| Formulario de registro | form | `aria-label` en correo | n/a | Sí | Casilla de 18 años con label |

## Detalle del veredicto
- Lector de pantalla: **CONCERNS** (anuncios y nombres repetidos)
- Teclado: **PASS**
- Gestión del foco: **CONCERNS** (cargar más)
- Contraste de texto: **PASS** (mín. 5,5:1 claro, 6,2:1 oscuro). Bordes de controles: **CONCERNS**
- Movimiento: **PASS**

---

## Notas de las otras lentes

### Diseño
- Los bordes finos (`--line`) hacen que los controles de "Más filtros" se pierdan; mismo arreglo que el problema 2.
- La portada ya prioriza búsqueda + departamento. Falta un bloque de prueba social o ejemplo de resultado sin buscar para que se entienda el valor en 5 segundos.
- Estados de "vacío" y "cargando" son texto plano; un esqueleto de tarjetas se sentiría más pulido.

### Frontend (React/Next)
- `Buscador.tsx` ya es grande (~370 líneas) con muchos `useState`. Conviene extraer `ResultadoFila` y un hook `useFavoritos` para no rerenderizar toda la lista al guardar un proceso.
- Cada tarjeta recalcula `guardados.has(...)` dos veces; usar una variable.
- No hay verificación de tipos ni build local (sin `node_modules` en el entorno de trabajo): el único chequeo es el build de Vercel. Añadir un workflow de GitHub con `tsc --noEmit` y `next lint`.

### Backend (API de Next.js; las reglas de Rust/Tauri no aplican)
- `/api/search` y `/api/facets` son públicas y sin límite: cualquiera puede usarlas para consumir el cupo de datos.gov.co. Añadir caché (`revalidate`/`s-maxage`) y un límite por IP como en `/api/entrar`.
- `/api/search` devuelve `e.message` al cliente en errores 502; puede filtrar detalles del origen. Devolver un mensaje genérico y registrar el detalle.
- Favoritos: el conteo contra el límite y el `upsert` no son atómicos; dos peticiones simultáneas pueden pasar el límite por 1. Riesgo bajo.
- `auth_intentos`: la limpieza de registros viejos corre en cada petición sin esperar; mejor moverla al cron.

### DX (la lente es para herramientas de desarrolladores; aplica poco)
- Lo único relevante: el repo no tiene README con los pasos de instalación, variables de entorno (hoy solo `.env.example`) ni orden de migraciones 001 a 006. Facilita retomar el proyecto.

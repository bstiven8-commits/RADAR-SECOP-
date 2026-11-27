import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/Icons";
import { AVISO, GUIAS, PASOS_BASE, guiaPor } from "@/lib/guias";
import { parseFilters, search, type Proceso } from "@/lib/secop";

export const revalidate = 3600;
const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

export function generateStaticParams() {
  return GUIAS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guiaPor((await params).slug);
  if (!g) return {};
  return { title: `${g.titulo} — ${NOMBRE}`, description: g.resumen, alternates: { canonical: `/guias/${g.slug}` } };
}

const cop = (n: number | null) =>
  n == null ? "" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export default async function GuiaPagina({ params }: { params: Promise<{ slug: string }> }) {
  const g = guiaPor((await params).slug);
  if (!g) notFound();

  // Procesos abiertos de este sector (ejemplo en vivo); si falla la consulta, la guía se muestra igual
  let procesos: Proceso[] = [];
  try {
    const r = await search(parseFilters(new URLSearchParams({ q: g.q, abiertos: "1", source: "secop2" })), 0, 5);
    procesos = r.items;
  } catch {}

  const buscar = `/?q=${encodeURIComponent(g.q)}`;
  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand" aria-label="Radar SECOP, inicio"><Logo /><span>{NOMBRE}</span></Link>
      </header>
      <Link href="/guias" className="volver">Todas las guías</Link>
      <article className="guia">
        <h1 className="titulo">{g.titulo}</h1>
        <p className="sub">{g.resumen}</p>

        <h2 className="sec">Qué compra el Estado en este sector</h2>
        <ul>{g.compra.map((x) => <li key={x}>{x}</li>)}</ul>

        <h2 className="sec">Cómo se contrata</h2>
        <p>{g.modalidades}</p>

        <h2 className="sec">Qué suelen pedirte</h2>
        <ul>{g.requisitos.map((x) => <li key={x}>{x}</li>)}</ul>

        <h2 className="sec">Pasos para empezar</h2>
        <ol className="pasos-lista">
          {PASOS_BASE.map((p) => <li key={p.t}><strong>{p.t}.</strong> {p.d}</li>)}
        </ol>

        <h2 className="sec">Consejos</h2>
        <ul>{g.consejos.map((x) => <li key={x}>{x}</li>)}</ul>

        <section className="alarma" aria-label="Busca procesos de este sector">
          <div className="alarma-texto">
            <strong>Procesos abiertos de {g.nombre.toLowerCase()}</strong>
            <span>Búscalos y crea una alarma para recibir los nuevos en tu correo.</span>
          </div>
          <Link href={buscar} className="chip-btn enlace">Ver y crear alarma →</Link>
        </section>

        {procesos.length > 0 && (
          <ul className="guia-procesos">
            {procesos.map((p) => (
              <li key={p.key}>
                <Link href={`/proceso/${p.source}/${encodeURIComponent(p.id)}`}>{p.objeto || "(sin descripción)"}</Link>
                <span className="muted">{p.entidad}{p.valor != null ? ` · ${cop(p.valor)}` : ""}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="muted pie">{AVISO}</p>
      </article>
    </div>
  );
}

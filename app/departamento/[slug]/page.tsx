import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/Icons";
import { facet, search } from "@/lib/secop";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

type Params = Promise<{ slug: string }>;

const cop = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const dia = (s?: string | null) => (s ? s.slice(0, 10) : "—");

async function nombreDe(slug: string): Promise<string | null> {
  try {
    const todos = await facet("secop2", "departamento");
    return todos.find((d) => slugify(d) === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const nombre = await nombreDe((await params).slug);
  if (!nombre) return { title: `Departamentos — ${NOMBRE}` };
  return {
    title: `Contratación pública en ${nombre}: procesos SECOP abiertos — ${NOMBRE}`,
    description: `Procesos de contratación pública de entidades de ${nombre} publicados en SECOP II. Consulta los que aún reciben ofertas y crea una alarma por correo.`,
  };
}

export default async function Departamento({ params }: { params: Params }) {
  const slug = (await params).slug;
  const nombre = await nombreDe(slug);
  if (!nombre) notFound();

  let items: Awaited<ReturnType<typeof search>>["items"] = [];
  let falla = false;
  try {
    items = (await search({ source: "secop2", departamento: nombre, abiertos: true }, 0, 20)).items;
  } catch {
    falla = true;
  }

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand"><Logo /><span>{NOMBRE}</span></Link>
        <Link href="/departamentos">Todos los departamentos</Link>
      </header>

      <h1 className="titulo">Procesos de contratación en {nombre}</h1>
      <p className="sub">Procesos de entidades de {nombre} en SECOP II que aún reciben ofertas, del más reciente al más antiguo.</p>

      <section className="alarma" aria-label="Crear alarma">
        <div className="alarma-texto">
          <strong>¿Quieres enterarte primero?</strong>
          <span>Crea una alarma para {nombre} y te escribimos cuando aparezcan procesos nuevos.</span>
        </div>
        <div className="alarma-form">
          <Link className="boton-link" href={`/?departamento=${encodeURIComponent(nombre)}`}>Buscar y crear alarma</Link>
        </div>
      </section>

      {falla && <p className="error">No pudimos consultar SECOP en este momento. Intenta de nuevo en unos minutos.</p>}
      {!falla && !items.length && <p className="muted">Ahora mismo no hay procesos abiertos a ofertas en {nombre}.</p>}

      {items.map((p) => (
        <article className="fila" key={p.key}>
          <div>
            <div className="meta">
              <span className="plataforma">SECOP II</span>
              {p.fase && <span className="estado abierto">{p.fase}</span>}
              <span>{p.modalidad}</span>
              {p.cierre && <span>Cierre {dia(p.cierre)}</span>}
            </div>
            <h3>{p.objeto || "(sin descripción)"}</h3>
            <div className="entidad">{p.entidad}{p.ciudad ? `, ${p.ciudad}` : ""}</div>
          </div>
          <div className="cifra">
            <strong>{cop(p.valor)}</strong>
            <Link href={`/proceso/${p.source}/${encodeURIComponent(p.id)}`}>Ver detalle</Link>
          </div>
        </article>
      ))}

      <p className="muted pie">Datos abiertos de Colombia Compra Eficiente (datos.gov.co). Verifica siempre en SECOP.</p>
    </div>
  );
}

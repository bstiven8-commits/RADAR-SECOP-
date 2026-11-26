import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/Icons";
import { getProceso, type SingleSource } from "@/lib/secop";

export const dynamic = "force-dynamic";
const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

type Params = Promise<{ source: string; id: string }>;

const fuente = (s: string): SingleSource | null => (s === "secop2" || s === "secop1" ? s : null);
const cop = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const dia = (s?: string | null) => (s ? s.slice(0, 10) : "—");

async function cargar(params: Params) {
  const { source, id } = await params;
  const src = fuente(source);
  if (!src) return null;
  try {
    return await getProceso(src, decodeURIComponent(id));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const d = await cargar(params);
  return { title: d ? `${d.proceso.objeto.slice(0, 70)} — ${NOMBRE}` : `Proceso — ${NOMBRE}` };
}

export default async function Detalle({ params }: { params: Params }) {
  const d = await cargar(params);
  if (!d) notFound();
  const p = d.proceso;
  const largo = (p.descripcion ?? "").trim();

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand"><Logo /><span>{NOMBRE}</span></Link>
      </header>
      <Link href="/" className="volver">← Volver a la búsqueda</Link>

      <div className="meta">
        <span className="plataforma">{p.source === "secop2" ? "SECOP II" : "SECOP I"}</span>
        <span className="estado">{p.estado}</span>
        <span>{p.modalidad}</span>
      </div>
      <h1 className="titulo" style={{ marginTop: 8 }}>{p.objeto || "(sin descripción)"}</h1>
      <p className="muted">{p.entidad}{[p.ciudad, p.departamento].filter(Boolean).length ? ` · ${[p.ciudad, p.departamento].filter(Boolean).join(", ")}` : ""}</p>

      <dl className="datos">
        <div><dt>Valor</dt><dd>{cop(p.valor)}</dd></div>
        <div><dt>Publicado</dt><dd>{dia(p.fecha)}</dd></div>
        {p.cierre && <div><dt>Cierre de ofertas</dt><dd>{dia(p.cierre)}</dd></div>}
        {p.fase && <div><dt>Fase</dt><dd>{p.fase}</dd></div>}
        {p.referencia && <div><dt>Referencia</dt><dd>{p.referencia}</dd></div>}
        {p.invitados ? <div><dt>Proveedores invitados</dt><dd>{p.invitados}</dd></div> : null}
        {p.duracion && <div><dt>Duración</dt><dd>{p.duracion}</dd></div>}
        {p.ofertas != null && <div><dt>Ofertas recibidas</dt><dd>{p.ofertas}</dd></div>}
        {p.adjudicado && <div><dt>Adjudicado a</dt><dd>{p.adjudicado}</dd></div>}
      </dl>

      {largo && largo !== p.objeto.trim() && (
        <section>
          <h2 className="sec">Descripción</h2>
          <p style={{ maxWidth: "70ch", whiteSpace: "pre-line" }}>{largo}</p>
        </section>
      )}

      {p.url && (
        <p style={{ margin: "24px 0" }}>
          <a className="boton-link" href={p.url} target="_blank" rel="noopener noreferrer">Abrir en SECOP y ver documentos</a>
        </p>
      )}

      <section>
        <h2 className="sec">Todos los datos del proceso</h2>
        <table className="tabla-datos">
          <tbody>
            {d.campos.map((c) => (
              <tr key={c.etiqueta}><th scope="row">{c.etiqueta}</th><td>{c.valor.startsWith("http") ? <a href={c.valor} target="_blank" rel="noopener noreferrer">{c.valor}</a> : c.valor}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="muted pie">Datos abiertos de Colombia Compra Eficiente (datos.gov.co). Verifica siempre en SECOP.</p>
    </div>
  );
}

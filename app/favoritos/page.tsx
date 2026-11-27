"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthBar from "@/components/AuthBar";
import { useSession } from "@/lib/use-session";
import { Logo } from "@/components/Icons";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

type Estado = "interesa" | "postulado" | "descartado";
interface Fav {
  source: "secop1" | "secop2";
  proceso_id: string;
  estado_seguimiento: Estado;
  nota: string;
  objeto: string;
  entidad: string;
  valor: number | null;
  cierre: string | null;
  url: string | null;
}

const ESTADOS: { v: Estado; t: string }[] = [
  { v: "interesa", t: "Me interesa" },
  { v: "postulado", t: "Postulado" },
  { v: "descartado", t: "Descartado" },
];

const cop = (n: number | null) =>
  n == null ? "Sin valor" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const corto = (s: string) => (s ? (s.length > 80 ? `${s.slice(0, 80).trimEnd()}…` : s) : "proceso sin descripción");
const dia = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "short", year: "numeric" }) : "");

export default function Favoritos() {
  const { session, ready } = useSession();
  const [favs, setFavs] = useState<Fav[]>([]);
  const [info, setInfo] = useState({ plan: "free", limite: 0 });
  const [filtro, setFiltro] = useState<"todos" | Estado>("todos");
  const [error, setError] = useState("");

  const auth = useCallback(() => ({ Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" }), [session]);

  const cargar = useCallback(async () => {
    if (!session) return;
    const r = await fetch("/api/favoritos", { headers: auth() });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setError(d.error ?? "No pudimos cargar tus procesos");
    setFavs(d.favoritos);
    setInfo({ plan: d.plan, limite: d.limite });
  }, [session, auth]);
  useEffect(() => { cargar(); }, [cargar]);

  async function cambiar(f: Fav, cambios: { estado?: Estado; nota?: string }) {
    setError("");
    const r = await fetch("/api/favoritos", { method: "PATCH", headers: auth(), body: JSON.stringify({ source: f.source, id: f.proceso_id, ...cambios }) });
    if (!r.ok) setError((await r.json().catch(() => ({}))).error ?? "No pudimos guardar el cambio");
    else if (cambios.estado) setFavs((l) => l.map((x) => (x === f ? { ...x, estado_seguimiento: cambios.estado! } : x)));
  }
  async function quitar(f: Fav) {
    if (!confirm("¿Quitar este proceso de tus guardados?")) return;
    const r = await fetch(`/api/favoritos?source=${f.source}&id=${encodeURIComponent(f.proceso_id)}`, { method: "DELETE", headers: auth() });
    if (r.ok) setFavs((l) => l.filter((x) => x !== f));
    else setError("No pudimos quitarlo");
  }

  const visibles = favs.filter((f) => filtro === "todos" || f.estado_seguimiento === filtro);

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand" aria-label="Radar SECOP, inicio">
          <Logo />
          <span>{NOMBRE}</span>
        </Link>
        <AuthBar />
      </header>

      <Link href="/" className="volver">Volver a la búsqueda</Link>
      <h1 className="titulo">Mis procesos guardados</h1>

      {ready && !session && <p>Registra tu correo arriba para guardar y seguir procesos.</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {session && (
        <>
          <p className="muted">Plan {info.plan}: {favs.length} de {info.limite} procesos guardados.</p>
          <div className="chips" role="group" aria-label="Filtrar por estado">
            {[{ v: "todos" as const, t: "Todos" }, ...ESTADOS].map((e) => (
              <button type="button" key={e.v} className={`chip-btn${filtro === e.v ? " on" : ""}`} aria-pressed={filtro === e.v} onClick={() => setFiltro(e.v)}>
                {e.t}
              </button>
            ))}
          </div>
          {!visibles.length && <p>{favs.length ? "No hay procesos en este estado." : "Aún no has guardado procesos. Pulsa “Guardar” en cualquier resultado de la búsqueda."}</p>}
          {visibles.map((f) => (
            <article className="fila fav" key={`${f.source}:${f.proceso_id}`}>
              <div>
                <div className="meta">
                  <span className="plataforma">{f.source === "secop2" ? "SECOP II" : "SECOP I"}</span>
                  {f.cierre && <span>Cierre {dia(f.cierre)}</span>}
                </div>
                <h2 className="fila-titulo">{f.objeto || "(sin descripción)"}</h2>
                <div className="entidad">{f.entidad}</div>
                <div className="fav-controles">
                  <select aria-label={`Estado de seguimiento: ${corto(f.objeto)}`} value={f.estado_seguimiento} onChange={(e) => cambiar(f, { estado: e.target.value as Estado })}>
                    {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.t}</option>)}
                  </select>
                  <input
                    type="text"
                    maxLength={500}
                    aria-label={`Nota: ${corto(f.objeto)}`}
                    placeholder="Nota (ej. pedir cotización a proveedor)"
                    defaultValue={f.nota}
                    onBlur={(e) => e.target.value !== f.nota && cambiar(f, { nota: e.target.value })}
                  />
                </div>
              </div>
              <div className="cifra">
                <strong>{cop(f.valor)}</strong>
                <Link href={`/proceso/${f.source}/${encodeURIComponent(f.proceso_id)}`} aria-label={`Ver detalle: ${corto(f.objeto)}`}>Ver detalle</Link>
                {f.url && <a href={f.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir en SECOP (se abre en otra pestaña): ${corto(f.objeto)}`}>Abrir en SECOP</a>}
                <button type="button" className="link" aria-label={`Quitar de guardados: ${corto(f.objeto)}`} onClick={() => quitar(f)}>Quitar</button>
              </div>
            </article>
          ))}
        </>
      )}
    </div>
  );
}

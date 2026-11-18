"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthBar from "@/components/AuthBar";
import { useSession } from "@/lib/use-session";
import type { Proceso } from "@/lib/secop";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

interface F {
  source: "secop2" | "secop1" | "both";
  q: string;
  modalidad: string;
  estado: string;
  departamento: string;
  desde: string;
  hasta: string;
}
const VACIO: F = { source: "secop2", q: "", modalidad: "", estado: "", departamento: "", desde: "", hasta: "" };

const cop = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const dia = (s: string | null) => (s ? s.slice(0, 10) : "—");

function query(f: F, page?: number) {
  const p = new URLSearchParams();
  (Object.entries(f) as [string, string][]).forEach(([k, v]) => v && p.set(k, v));
  if (page) p.set("page", String(page));
  return p;
}

export default function Home() {
  const { session } = useSession();
  const [f, setF] = useState<F>(VACIO);
  const [facets, setFacets] = useState({ modalidades: [] as string[], estados: [] as string[], departamentos: [] as string[] });
  const [items, setItems] = useState<Proceso[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [alarmName, setAlarmName] = useState("");
  const [alarmMsg, setAlarmMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <K extends keyof F>(k: K, v: F[K]) => setF((x) => ({ ...x, [k]: v }));

  // Los selectores se cargan desde los datos reales, para que coincidan exactamente con SECOP
  useEffect(() => {
    setF((x) => ({ ...x, modalidad: "", estado: "", departamento: "" }));
    fetch(`/api/facets?source=${f.source}`)
      .then((r) => r.json())
      .then((d) => !d.error && setFacets(d))
      .catch(() => {});
  }, [f.source]);

  const buscar = useCallback(
    async (pagina: number) => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(`/api/search?${query(f, pagina)}`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Error consultando SECOP");
        setItems((prev) => (pagina === 0 ? d.items : [...prev, ...d.items]));
        setHasMore(d.hasMore);
        setPage(pagina);
        setSearched(true);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [f],
  );

  async function crearAlarma() {
    setAlarmMsg(null);
    if (!session) return setAlarmMsg({ ok: false, text: "Primero registra tu correo arriba para poder crear alarmas." });
    const name = alarmName.trim() || f.q.trim() || "Mi alarma";
    const filters: Record<string, string> = {};
    (Object.entries(f) as [string, string][]).forEach(([k, v]) => k !== "desde" && k !== "hasta" && v && (filters[k] = v));
    const r = await fetch("/api/alarms", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ name, filters }),
    });
    const d = await r.json();
    setAlarmMsg(r.ok ? { ok: true, text: "Alarma creada. Te escribiremos cuando aparezcan procesos nuevos." } : { ok: false, text: d.error });
    if (r.ok) setAlarmName("");
  }

  return (
    <div className="wrap">
      <header className="top">
        <h1>{NOMBRE}</h1>
        <AuthBar />
      </header>

      <form className="panel" onSubmit={(e) => { e.preventDefault(); buscar(0); }}>
        <div className="filters">
          <label>Plataforma
            <select value={f.source} onChange={(e) => set("source", e.target.value as F["source"])}>
              <option value="secop2">SECOP II</option>
              <option value="secop1">SECOP I</option>
              <option value="both">Ambas</option>
            </select>
          </label>
          <label>Modalidad
            <select value={f.modalidad} onChange={(e) => set("modalidad", e.target.value)}>
              <option value="">Todas</option>
              {facets.modalidades.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label>Estado
            <select value={f.estado} onChange={(e) => set("estado", e.target.value)}>
              <option value="">Todos</option>
              {facets.estados.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label>Departamento
            <select value={f.departamento} onChange={(e) => set("departamento", e.target.value)}>
              <option value="">Todos</option>
              {facets.departamentos.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label>Publicado desde
            <input type="date" value={f.desde} onChange={(e) => set("desde", e.target.value)} />
          </label>
          <label>Publicado hasta
            <input type="date" value={f.hasta} onChange={(e) => set("hasta", e.target.value)} />
          </label>
          <label className="wide">Palabra clave (objeto del proceso)
            <input value={f.q} placeholder="ej. software, dotación, interventoría" onChange={(e) => set("q", e.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button disabled={loading}>{loading && page === 0 ? "Buscando…" : "Buscar"}</button>
          <button type="button" className="ghost" onClick={() => { setF({ ...VACIO, source: f.source }); setItems([]); setSearched(false); }}>Limpiar</button>
        </div>
      </form>

      {searched && (
        <div className="panel">
          <div className="actions" style={{ marginTop: 0 }}>
            <input placeholder="Nombre de la alarma" value={alarmName} onChange={(e) => setAlarmName(e.target.value)} />
            <button type="button" onClick={crearAlarma}>🔔 Avisarme de procesos nuevos con estos filtros</button>
          </div>
          {alarmMsg && <p className={alarmMsg.ok ? "ok" : "error"} style={{ marginBottom: 0 }}>{alarmMsg.text}</p>}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {searched && !loading && !items.length && !error && <p className="muted">No hay procesos con esos filtros.</p>}

      {items.map((p) => (
        <article className="item" key={p.key}>
          <div className="meta">
            <span className="badge">{p.source === "secop2" ? "SECOP II" : "SECOP I"}</span>
            <span>{p.modalidad}</span>
            <span>·</span>
            <span>{p.estado}</span>
            <span>·</span>
            <span>Publicado {dia(p.fecha)}</span>
          </div>
          <h3>{p.objeto || "(sin descripción)"}</h3>
          <div className="muted">{p.entidad} — {[p.ciudad, p.departamento].filter(Boolean).join(", ")}</div>
          <div className="actions">
            <strong>{cop(p.valor)}</strong>
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer">Ver en SECOP ↗</a>}
          </div>
        </article>
      ))}

      {hasMore && (
        <button className="ghost" disabled={loading} onClick={() => buscar(page + 1)}>
          {loading ? "Cargando…" : "Cargar más"}
        </button>
      )}

      <p className="muted" style={{ marginTop: 32 }}>
        Datos abiertos de Colombia Compra Eficiente (datos.gov.co). La información la registran las entidades; verifica siempre en SECOP.
        {" "}<Link href="/privacidad">Política de datos</Link>
      </p>
    </div>
  );
}

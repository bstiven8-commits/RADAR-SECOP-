"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import AuthBar from "@/components/AuthBar";
import { Bell, Logo } from "@/components/Icons";
import { useSession } from "@/lib/use-session";
import type { Proceso } from "@/lib/secop";
import { FRECUENCIAS, type Frecuencia } from "@/lib/plans";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

interface F {
  source: "secop2" | "secop1" | "both";
  q: string;
  modalidad: string;
  estado: string;
  departamento: string;
  desde: string;
  hasta: string;
  valorMin: string;
  valorMax: string;
  abiertos: string;
}
const VACIO: F = { source: "secop2", q: "", modalidad: "", estado: "", departamento: "", desde: "", hasta: "", valorMin: "", valorMax: "", abiertos: "" };

// Atajos por sector: llenan la palabra clave con varios términos (cualquiera de ellos)
const SECTORES: { nombre: string; q: string }[] = [
  { nombre: "Tecnología", q: "software, sistemas de información, plataforma, licencias, computadores" },
  { nombre: "Construcción", q: "obra, construcción, mejoramiento, pavimentación, mantenimiento de vías" },
  { nombre: "Interventoría", q: "interventoría, supervisión" },
  { nombre: "Salud", q: "dotación hospitalaria, medicamentos, insumos médicos, salud" },
  { nombre: "Papelería y aseo", q: "papelería, útiles de oficina, aseo, cafetería" },
  { nombre: "Consultoría", q: "consultoría, asesoría, estudios y diseños" },
  { nombre: "Dotación y vestuario", q: "dotación, uniformes, vestuario, calzado" },
  { nombre: "Alimentación", q: "alimentos, suministro de alimentación, refrigerios, mercados" },
];

const cop = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const dia = (s: string | null) => (s ? s.slice(0, 10) : "—");

// Solo para el indicador visual del estado; el texto del estado siempre se muestra
function tonoEstado(e: string | null): "abierto" | "cerrado" | "adjudicado" | "" {
  const t = (e ?? "").toLowerCase();
  if (/borrador|cancel|desiert|suspend|anulad|terminad|liquidad/.test(t)) return "cerrado";
  if (/adjudic|celebrad|firmad/.test(t)) return "adjudicado";
  if (/abiert|public|convoc|present|recep|evalua|proceso/.test(t)) return "abierto";
  return "";
}

function query(f: F, page?: number) {
  const p = new URLSearchParams();
  (Object.entries(f) as [string, string][]).forEach(([k, v]) => v && p.set(k, v));
  if (page) p.set("page", String(page));
  return p;
}

export interface Inicial {
  departamento: string;
  items: Proceso[];
  hasMore: boolean;
}

interface Props {
  titulo?: string;
  sub?: string;
  inicial?: Inicial;
}

export default function Buscador({
  titulo = "Procesos de contratación pública, SECOP I y II",
  sub = "Busca por palabra clave, modalidad o departamento. Crea una alarma y te escribimos cuando aparezcan procesos nuevos.",
  inicial,
}: Props) {
  const { session } = useSession();
  const [f, setF] = useState<F>(inicial ? { ...VACIO, departamento: inicial.departamento, abiertos: "1" } : VACIO);
  const [facets, setFacets] = useState({ modalidades: [] as string[], estados: [] as string[], departamentos: [] as string[] });
  const [items, setItems] = useState<Proceso[]>(inicial?.items ?? []);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(inicial?.hasMore ?? false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!inicial);
  const [error, setError] = useState("");
  const [alarmName, setAlarmName] = useState("");
  const [alarmMsg, setAlarmMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("daily");
  const [permitidas, setPermitidas] = useState<Frecuencia[]>(["daily"]);
  const [guardados, setGuardados] = useState<Set<string>>(new Set());
  const [favMsg, setFavMsg] = useState("");

  const set = <K extends keyof F>(k: K, v: F[K]) => setF((x) => ({ ...x, [k]: v }));
  const extrasActivos = [f.modalidad, f.estado, f.desde, f.hasta, f.valorMin, f.valorMax, f.abiertos].filter(Boolean).length;

  // Los selectores se cargan desde los datos reales, para que coincidan exactamente con SECOP
  const primera = useRef(true);
  useEffect(() => {
    // Al cambiar de plataforma se reinician los filtros; no en la carga inicial (conserva el departamento)
    if (primera.current) primera.current = false;
    else setF((x) => ({ ...x, modalidad: "", estado: "", departamento: "" }));
    fetch(`/api/facets?source=${f.source}`)
      .then((r) => r.json())
      .then((d) => !d.error && setFacets(d))
      .catch(() => {});
  }, [f.source]);

  // Frecuencias que permite el plan del usuario
  useEffect(() => {
    if (!session) return;
    fetch("/api/alarms", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.json())
      .then((d) => Array.isArray(d.frecuencias) && setPermitidas(d.frecuencias))
      .catch(() => {});
  }, [session]);

  // Procesos que el usuario ya guardó (para marcar la estrella)
  useEffect(() => {
    if (!session) return setGuardados(new Set());
    fetch("/api/favoritos", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.json())
      .then((d) => Array.isArray(d.favoritos) && setGuardados(new Set(d.favoritos.map((x: { source: string; proceso_id: string }) => `${x.source}:${x.proceso_id}`))))
      .catch(() => {});
  }, [session]);

  async function alternarFavorito(p: Proceso) {
    setFavMsg("");
    if (!session) return setFavMsg("Registra tu correo arriba para guardar procesos.");
    const clave = `${p.source}:${p.id}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };
    const ya = guardados.has(clave);
    const r = ya
      ? await fetch(`/api/favoritos?source=${p.source}&id=${encodeURIComponent(p.id)}`, { method: "DELETE", headers })
      : await fetch("/api/favoritos", {
          method: "POST",
          headers,
          body: JSON.stringify({ source: p.source, id: p.id, objeto: p.objeto, entidad: p.entidad, valor: p.valor, cierre: p.cierre, url: p.url }),
        });
    if (!r.ok) return setFavMsg((await r.json().catch(() => ({}))).error ?? "No pudimos guardar el proceso");
    setGuardados((s) => {
      const n = new Set(s);
      if (ya) n.delete(clave);
      else n.add(clave);
      return n;
    });
  }

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

  // Llegada desde /departamento/...: precarga el departamento y busca
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("departamento");
    if (d) {
      setF((x) => ({ ...x, source: "secop2", departamento: d, abiertos: "1" }));
      setAuto(true);
    }
  }, []);
  useEffect(() => {
    if (auto) {
      setAuto(false);
      buscar(0);
    }
  }, [auto, buscar]);

  async function exportar() {
    setError("");
    if (!session) return setError("Registra tu correo arriba para exportar.");
    const r = await fetch(`/api/export?${query(f)}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!r.ok) return setError((await r.json().catch(() => ({}))).error ?? "No se pudo exportar");
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `radar-secop-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function crearAlarma() {
    setAlarmMsg(null);
    if (!session) return setAlarmMsg({ ok: false, text: "Primero registra tu correo arriba para poder crear alarmas." });
    const name = alarmName.trim() || f.q.trim() || "Mi alarma";
    const filters: Record<string, string> = {};
    (Object.entries(f) as [string, string][]).forEach(([k, v]) => k !== "desde" && k !== "hasta" && v && (filters[k] = v));
    const r = await fetch("/api/alarms", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ name, filters, frequency: frecuencia }),
    });
    const d = await r.json();
    setAlarmMsg(r.ok ? { ok: true, text: `Alarma creada (${FRECUENCIAS[frecuencia].etiqueta.toLowerCase()}). Te escribiremos cuando aparezcan procesos nuevos.` } : { ok: false, text: d.error });
    if (r.ok) setAlarmName("");
  }

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand" aria-label={`${NOMBRE}, inicio`}>
          <Logo />
          <span>{NOMBRE}</span>
        </Link>
        <AuthBar />
      </header>

      <h1 className="lead">{titulo}</h1>
      {!searched && <p className="sub">{sub}</p>}

      <form className="buscador" onSubmit={(e) => { e.preventDefault(); buscar(0); }}>
        <div className="fila-principal">
          <input
            className="q"
            type="search"
            aria-label="Palabra clave (objeto del proceso)"
            value={f.q}
            placeholder="Palabra clave (separa varias con coma): software, dotación"
            onChange={(e) => set("q", e.target.value)}
          />
          <select aria-label="Departamento" className="depto" value={f.departamento} onChange={(e) => set("departamento", e.target.value)}>
            <option value="">Todo el país</option>
            {f.departamento && !facets.departamentos.includes(f.departamento) && <option>{f.departamento}</option>}
            {facets.departamentos.filter((d) => !/no definido/i.test(d)).map((m) => <option key={m}>{m}</option>)}
          </select>
          <select aria-label="Plataforma" value={f.source} onChange={(e) => set("source", e.target.value as F["source"])}>
            <option value="secop2">SECOP II</option>
            <option value="secop1">SECOP I</option>
            <option value="both">Ambas</option>
          </select>
          <button disabled={loading}>{loading && page === 0 ? "Buscando…" : "Buscar"}</button>
        </div>

        <div className="sectores" role="group" aria-label="Atajos por sector">
          <span className="muted">Atajos:</span>
          {SECTORES.map((x) => (
            <button type="button" key={x.nombre} className={`chip-btn${f.q === x.q ? " on" : ""}`} onClick={() => { set("q", f.q === x.q ? "" : x.q); if (!alarmName) setAlarmName(x.nombre); }}>
              {x.nombre}
            </button>
          ))}
          <Link href="/departamentos" className="chip-btn enlace">Por departamento →</Link>
        </div>

        <details className="mas">
          <summary>
            Más filtros
            {extrasActivos > 0 && <span className="n">{extrasActivos}</span>}
          </summary>
          <div className="filtros">
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
            <label className="check">
              <input type="checkbox" checked={f.abiertos === "1"} onChange={(e) => set("abiertos", e.target.checked ? "1" : "")} />
              Solo procesos que aún reciben ofertas (SECOP II)
            </label>
            <label>Valor mínimo (COP, SECOP II)
              <input type="number" inputMode="numeric" min="0" step="1000000" placeholder="Ej. 50000000" value={f.valorMin} onChange={(e) => set("valorMin", e.target.value)} />
            </label>
            <label>Valor máximo (COP, SECOP II)
              <input type="number" inputMode="numeric" min="0" step="1000000" placeholder="Ej. 500000000" value={f.valorMax} onChange={(e) => set("valorMax", e.target.value)} />
            </label>
            <label>Publicado desde
              <input type="date" value={f.desde} onChange={(e) => set("desde", e.target.value)} />
            </label>
            <label>Publicado hasta
              <input type="date" value={f.hasta} onChange={(e) => set("hasta", e.target.value)} />
            </label>
          </div>
        </details>

        {(searched || extrasActivos > 0 || f.q) && (
          <div className="acciones" style={{ marginTop: 12 }}>
            <button type="button" className="link" onClick={() => { setF({ ...VACIO, source: f.source, departamento: inicial?.departamento ?? "" }); setItems([]); setSearched(false); }}>Limpiar filtros</button>
          </div>
        )}
      </form>

      {searched && (
        <section className="alarma" aria-label="Crear una alarma con estos filtros">
          <div className="alarma-texto">
            <strong>¿Quieres que te avisemos?</strong>
            <span>Crea una alarma con estos filtros y te escribimos cuando aparezcan procesos nuevos.</span>
          </div>
          <div className="alarma-form">
            <input aria-label="Nombre de la alarma" placeholder="Nombre de la alarma" value={alarmName} onChange={(e) => setAlarmName(e.target.value)} />
            <select aria-label="Frecuencia de la alarma" value={frecuencia} onChange={(e) => setFrecuencia(e.target.value as Frecuencia)}>
              {(Object.keys(FRECUENCIAS) as Frecuencia[]).map((k) => (
                <option key={k} value={k} disabled={!permitidas.includes(k)}>
                  {FRECUENCIAS[k].etiqueta}{permitidas.includes(k) ? "" : " — plan Pro"}
                </option>
              ))}
            </select>
            <button type="button" onClick={crearAlarma}><Bell />Crear alarma</button>
          </div>
          {alarmMsg && <p className={alarmMsg.ok ? "ok" : "error"} role="status">{alarmMsg.text}</p>}
        </section>
      )}

      {error && <p className="error" role="alert">{error}</p>}
      {searched && !loading && !items.length && !error && (
        <p className="muted">No hay procesos con esos filtros. Prueba con otra palabra o quita algún filtro.</p>
      )}

      {items.length > 0 && (
        <div className="resumen">
          <span>{items.length} {items.length === 1 ? "proceso" : "procesos"}{hasMore ? " o más" : ""}</span>
          <span className="muted">Los más recientes primero</span>
          <button type="button" className="ghost" onClick={exportar} title="Planes Pro y Business">Exportar a Excel</button>
        </div>
      )}

      {favMsg && <p className="error" role="alert">{favMsg}</p>}
      {items.map((p) => (
        <article className="fila" key={p.key}>
          <div>
            <div className="meta">
              <span className="plataforma">{p.source === "secop2" ? "SECOP II" : "SECOP I"}</span>
              <span className={`estado ${tonoEstado(p.estado)}`}>{p.estado}</span>
              <span>{p.modalidad}</span>
              <span>Publicado {dia(p.fecha)}</span>
              {p.fase && <span>{p.fase}</span>}
              {p.cierre && <span>Cierre {dia(p.cierre)}</span>}
              {p.ofertas != null && <span>{p.ofertas} {p.ofertas === 1 ? "oferta" : "ofertas"}</span>}
            </div>
            <h3>{p.objeto || "(sin descripción)"}</h3>
            <div className="entidad">{p.entidad}{[p.ciudad, p.departamento].filter(Boolean).length ? `, ${[p.ciudad, p.departamento].filter(Boolean).join(", ")}` : ""}</div>
          </div>
          <div className="cifra">
            <strong>{cop(p.valor)}</strong>
            <button type="button" className="link" aria-pressed={guardados.has(`${p.source}:${p.id}`)} onClick={() => alternarFavorito(p)}>
              {guardados.has(`${p.source}:${p.id}`) ? "★ Guardado" : "☆ Guardar"}
            </button>
            <Link href={`/proceso/${p.source}/${encodeURIComponent(p.id)}`}>Ver detalle</Link>
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer">Abrir en SECOP</a>}
          </div>
        </article>
      ))}

      {hasMore && (
        <div className="mas-resultados">
          <button className="ghost" disabled={loading} onClick={() => buscar(page + 1)}>
            {loading ? "Cargando…" : "Cargar más"}
          </button>
        </div>
      )}

      <p className="muted pie">
        Datos abiertos de Colombia Compra Eficiente (datos.gov.co). La información la registran las entidades; verifica siempre en SECOP.
        {" "}<Link href="/departamentos">Por departamento</Link> · <Link href="/privacidad">Política de datos</Link> · <Link href="/terminos">Términos</Link> · <Link href="/devoluciones">Devoluciones</Link>
      </p>
    </div>
  );
}

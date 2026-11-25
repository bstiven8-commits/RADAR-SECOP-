"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthBar from "@/components/AuthBar";
import { useSession } from "@/lib/use-session";
import { Logo } from "@/components/Icons";
import { FRECUENCIAS, type Frecuencia } from "@/lib/plans";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

interface Alarm {
  id: string;
  name: string;
  filters: Record<string, string>;
  active: boolean;
  frequency: Frecuencia;
}

const ETIQUETAS: Record<string, string> = {
  source: "Plataforma", q: "Palabra", modalidad: "Modalidad", estado: "Estado", departamento: "Departamento",
};
const PLAT: Record<string, string> = { secop2: "SECOP II", secop1: "SECOP I", both: "Ambas" };

export default function Alarmas() {
  const { session, ready } = useSession();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [info, setInfo] = useState<{ plan: string; limite: number; frecuencias: Frecuencia[] }>({ plan: "free", limite: 0, frecuencias: ["daily"] });
  const [error, setError] = useState("");

  const auth = useCallback(() => ({ Authorization: `Bearer ${session?.access_token}` }), [session]);

  const cargar = useCallback(async () => {
    if (!session) return;
    const r = await fetch("/api/alarms", { headers: auth() });
    const d = await r.json();
    if (!r.ok) return setError(d.error);
    setAlarms(d.alarms);
    setInfo({ plan: d.plan, limite: d.limite, frecuencias: d.frecuencias ?? ["daily"] });
  }, [session, auth]);

  useEffect(() => { cargar(); }, [cargar]);

  async function alternar(a: Alarm) {
    await fetch("/api/alarms", { method: "PATCH", headers: { ...auth(), "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, active: !a.active }) });
    cargar();
  }
  async function cambiarFrecuencia(a: Alarm, frequency: Frecuencia) {
    setError("");
    const r = await fetch("/api/alarms", { method: "PATCH", headers: { ...auth(), "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, frequency }) });
    if (!r.ok) setError((await r.json()).error ?? "No se pudo cambiar la frecuencia");
    cargar();
  }
  async function borrar(a: Alarm) {
    if (!confirm(`¿Eliminar la alarma "${a.name}"?`)) return;
    await fetch(`/api/alarms?id=${a.id}`, { method: "DELETE", headers: auth() });
    cargar();
  }

  const pct = info.limite ? Math.min(100, Math.round((alarms.length / info.limite) * 100)) : 0;

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
      <h1 className="titulo">Mis alarmas</h1>

      {ready && !session && <p>Registra tu correo arriba para ver y administrar tus alarmas.</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {session && (
        <>
          <div className="uso">
            <span className="muted">Plan {info.plan}: {alarms.length} de {info.limite} alarmas usadas</span>
            <div className="meter" role="img" aria-label={`${alarms.length} de ${info.limite} alarmas usadas`}><span style={{ width: `${pct}%` }} /></div>
          </div>
          {!alarms.length && <p>Aún no tienes alarmas. Haz una búsqueda y créala desde la página principal.</p>}
          {alarms.map((a) => (
            <article className={`alarma-fila${a.active ? "" : " pausada"}`} key={a.id}>
              <div>
                <h3>{a.name}{a.active ? "" : " (pausada)"}</h3>
                <div className="chips">
                  {Object.entries(a.filters).map(([k, v]) => (
                    <span className="chip" key={k}>{ETIQUETAS[k] ?? k}: {k === "source" ? PLAT[v] ?? v : v}</span>
                  ))}
                </div>
              </div>
              <div className="controles">
                <select aria-label="Frecuencia" value={a.frequency} onChange={(e) => cambiarFrecuencia(a, e.target.value as Frecuencia)}>
                  {(Object.keys(FRECUENCIAS) as Frecuencia[]).map((k) => (
                    <option key={k} value={k} disabled={!info.frecuencias.includes(k) && k !== a.frequency}>
                      {FRECUENCIAS[k].etiqueta}{info.frecuencias.includes(k) ? "" : " — plan Pro"}
                    </option>
                  ))}
                </select>
                <button className="ghost" onClick={() => alternar(a)}>{a.active ? "Pausar" : "Reactivar"}</button>
                <button className="ghost" onClick={() => borrar(a)}>Eliminar</button>
              </div>
            </article>
          ))}
        </>
      )}
    </div>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthBar from "@/components/AuthBar";
import { useSession } from "@/lib/use-session";
import { supabaseBrowser } from "@/lib/supabase-browser";
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
  const [tg, setTg] = useState<{ disponible: boolean; conectado: boolean }>({ disponible: false, conectado: false });
  const [tgLink, setTgLink] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const auth = useCallback(() => ({ Authorization: `Bearer ${session?.access_token}` }), [session]);

  const cargar = useCallback(async () => {
    if (!session) return;
    const r = await fetch("/api/alarms", { headers: auth() });
    const d = await r.json();
    if (!r.ok) return setError(d.error);
    setAlarms(d.alarms);
    setTg({ disponible: !!d.telegramDisponible, conectado: !!d.telegramConectado });
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

  async function conectarTelegram() {
    setError("");
    const r = await fetch("/api/telegram/vincular", { method: "POST", headers: auth() });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setError(d.error ?? "No pudimos generar el enlace");
    setTgLink(d.url);
    window.open(d.url, "_blank", "noopener");
  }

  async function desconectarTelegram() {
    const r = await fetch("/api/telegram/vincular", { method: "DELETE", headers: auth() });
    if (!r.ok) return setError("No pudimos desvincular Telegram");
    setTg((t) => ({ ...t, conectado: false }));
    setTgLink("");
  }

  async function eliminarCuenta() {
    setBorrando(true);
    setError("");
    const r = await fetch("/api/cuenta", { method: "DELETE", headers: auth() });
    if (!r.ok) {
      setError((await r.json().catch(() => ({}))).error ?? "No pudimos eliminar la cuenta.");
      setBorrando(false);
      return;
    }
    await supabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

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

          {tg.disponible && (
            <section className="zona-datos" aria-label="Avisos por Telegram">
              <h2 className="sec">Avisos por Telegram</h2>
              {info.plan === "free" ? (
                <p className="muted">Recibe los procesos nuevos también en Telegram. Es parte de los planes <Link href="/precios">Pro y Business</Link>.</p>
              ) : tg.conectado ? (
                <div className="controles">
                  <span className="ok">Conectado. Te avisaremos por Telegram además del correo.</span>
                  <button type="button" className="ghost" onClick={desconectarTelegram}>Desconectar</button>
                </div>
              ) : (
                <>
                  <p className="muted">Pulsa el botón, abre el bot en Telegram y toca “Iniciar”. El enlace vale 15 minutos.</p>
                  <button type="button" onClick={conectarTelegram}>Conectar Telegram</button>
                  {tgLink && <p className="muted">Si no se abrió, <a href={tgLink} target="_blank" rel="noopener noreferrer">abre este enlace</a>. Cuando termines, recarga la página.</p>}
                </>
              )}
            </section>
          )}

          <section className="zona-datos" aria-label="Tus datos">
            <h2 className="sec">Tus datos</h2>
            <p className="muted">
              Puedes eliminar tu cuenta cuando quieras. Se borran tu correo, tus alarmas y tus registros de pago en {NOMBRE}. No se puede deshacer.
              Si solo quieres dejar de recibir correos, pausa tus alarmas o usa el enlace de baja de cualquier correo.
            </p>
            {!confirmando ? (
              <button type="button" className="ghost" onClick={() => setConfirmando(true)}>Eliminar mi cuenta</button>
            ) : (
              <div className="controles">
                <strong>¿Seguro? Se borrará todo.</strong>
                <button type="button" className="peligro" disabled={borrando} onClick={eliminarCuenta}>{borrando ? "Eliminando…" : "Sí, eliminar mi cuenta"}</button>
                <button type="button" className="ghost" disabled={borrando} onClick={() => setConfirmando(false)}>Cancelar</button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthBar from "@/components/AuthBar";
import { Logo } from "@/components/Icons";
import { useSession } from "@/lib/use-session";
import { FRECUENCIAS, PLAN_LIMITS, PRECIOS_COP, DIAS_PLAN, type Plan } from "@/lib/plans";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";
const cop = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

const PLANES: { id: Plan; nombre: string; precio: number; resumen: string }[] = [
  { id: "free", nombre: "Gratis", precio: 0, resumen: "Para probar el servicio." },
  { id: "pro", nombre: "Pro", precio: PRECIOS_COP.pro, resumen: "Para quien busca contratos todas las semanas." },
  { id: "business", nombre: "Business", precio: PRECIOS_COP.business, resumen: "Para equipos que siguen muchos frentes a la vez." },
];

export default function Precios() {
  const { session } = useSession();
  const [actual, setActual] = useState<{ plan: Plan; vence: string | null } | null>(null);
  const [cargando, setCargando] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return setActual(null);
    fetch("/api/alarms", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.json())
      .then((d) => d.plan && setActual({ plan: d.plan, vence: d.vence ?? null }))
      .catch(() => {});
  }, [session]);

  async function pagar(plan: Plan) {
    setError("");
    if (!session) return setError("Primero registra tu correo arriba para poder elegir un plan.");
    setCargando(plan);
    try {
      const r = await fetch("/api/pagos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "No se pudo iniciar el pago");
      window.location.href = d.url;
    } catch (e) {
      setError((e as Error).message);
      setCargando(null);
    }
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

      <Link href="/" className="volver">Volver a la búsqueda</Link>
      <h1 className="titulo">Planes</h1>
      <p className="sub">Más alarmas y revisiones más frecuentes para enterarte antes de los procesos que te interesan. Pagas {DIAS_PLAN} días a la vez, sin renovación automática.</p>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="planes">
        {PLANES.map((p) => {
          const lim = PLAN_LIMITS[p.id];
          const esActual = actual?.plan === p.id;
          return (
            <section className={`plan${p.id === "pro" ? " destacado" : ""}`} key={p.id} aria-label={`Plan ${p.nombre}`}>
              <h2>{p.nombre}</h2>
              <p className="plan-precio">
                <strong>{p.precio ? cop(p.precio) : "$0"}</strong>
                <span className="muted">{p.precio ? ` por ${DIAS_PLAN} días` : " siempre"}</span>
              </p>
              <p className="muted">{p.resumen}</p>
              <ul>
                <li>{lim.alarmas} alarmas</li>
                {lim.frecuencias.map((f) => <li key={f}>{FRECUENCIAS[f].etiqueta}</li>)}
                <li>Correo con los procesos nuevos</li>
              </ul>
              {p.id === "free" ? (
                <p className="muted">{esActual ? "Es tu plan actual." : "Incluido al registrarte."}</p>
              ) : (
                <>
                  <button type="button" disabled={cargando !== null} onClick={() => pagar(p.id)}>
                    {cargando === p.id ? "Abriendo el pago…" : esActual ? `Renovar ${p.nombre}` : `Elegir ${p.nombre}`}
                  </button>
                  {esActual && actual?.vence && <p className="muted">Activo hasta el {fecha(actual.vence)}.</p>}
                </>
              )}
            </section>
          );
        })}
      </div>

      <p className="muted pie">
        El pago se hace en Wompi con PSE, tarjeta, Nequi o Bancolombia. Cuando termine el plan, vuelves al gratuito y tus alarmas se conservan.
        Si pagas el mismo plan antes de que venza, los {DIAS_PLAN} días se suman a los que te quedan.
        {" "}<Link href="/terminos">Términos</Link> · <Link href="/devoluciones">Devoluciones</Link>
      </p>
    </div>
  );
}

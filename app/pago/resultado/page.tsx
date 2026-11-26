"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthBar from "@/components/AuthBar";
import { Logo } from "@/components/Icons";
import { useSession } from "@/lib/use-session";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";
const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

type Estado = { status: string; plan: string; vence: string | null };

function Resultado() {
  const ref = useSearchParams().get("ref");
  const { session, ready } = useSession();
  const [estado, setEstado] = useState<Estado | null>(null);
  const [intentos, setIntentos] = useState(0);

  // Wompi confirma el pago con un evento aparte; aquí se consulta hasta que llegue (máx. ~1 minuto)
  useEffect(() => {
    if (!session || !ref || (estado && estado.status !== "PENDING") || intentos >= 20) return;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/pagos/estado?ref=${encodeURIComponent(ref)}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (r.ok) setEstado(await r.json());
      } catch {}
      setIntentos((n) => n + 1);
    }, intentos === 0 ? 0 : 3000);
    return () => clearTimeout(t);
  }, [session, ref, estado, intentos]);

  const nombrePlan = estado?.plan === "business" ? "Business" : "Pro";

  return (
    <>
      <h1 className="titulo">Tu pago</h1>
      {!ref && <p>No encontramos ese pago. <Link href="/precios">Ver planes</Link></p>}
      {ready && !session && <p>Inicia sesión con tu correo (arriba) para ver el estado de tu pago.</p>}
      {estado?.status === "APPROVED" && (
        <p className="ok" role="status">
          Pago confirmado. Tu plan {nombrePlan} está activo{estado.vence ? ` hasta el ${fecha(estado.vence)}` : ""}.
        </p>
      )}
      {estado && ["DECLINED", "ERROR", "VOIDED"].includes(estado.status) && (
        <p className="error" role="alert">El pago no se completó y no se hizo ningún cobro. Puedes intentarlo de nuevo desde <Link href="/precios">Planes</Link>.</p>
      )}
      {session && ref && (!estado || estado.status === "PENDING") && intentos < 20 && (
        <p className="muted" role="status">Estamos confirmando tu pago con Wompi. Esto toma unos segundos.</p>
      )}
      {session && ref && (!estado || estado.status === "PENDING") && intentos >= 20 && (
        <p>Todavía no recibimos la confirmación. Si ya pagaste, tu plan se activará solo en unos minutos; recarga esta página para revisar.</p>
      )}
      <p><Link href="/">Volver a la búsqueda</Link> · <Link href="/alarmas">Mis alarmas</Link></p>
    </>
  );
}

export default function PagoResultado() {
  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand" aria-label={`${NOMBRE}, inicio`}>
          <Logo />
          <span>{NOMBRE}</span>
        </Link>
        <AuthBar />
      </header>
      <Suspense fallback={null}>
        <Resultado />
      </Suspense>
    </div>
  );
}

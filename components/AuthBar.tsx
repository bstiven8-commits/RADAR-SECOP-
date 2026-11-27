"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useSession } from "@/lib/use-session";

export default function AuthBar() {
  const { session, ready } = useSession();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [web, setWeb] = useState("");
  const inicio = useRef(Date.now());

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, web, t: Date.now() - inicio.current }),
      });
      const d = await r.json().catch(() => ({}));
      setMsg(r.ok ? d.mensaje : d.error ?? "No pudimos enviar el enlace. Inténtalo de nuevo.");
    } catch {
      setMsg("No pudimos conectar. Revisa tu internet e inténtalo de nuevo.");
    }
    setBusy(false);
  }

  if (!ready) return <div className="authbar" />;

  if (session) {
    return (
      <div className="authbar">
        <span>{session.user.email}</span>
        <Link href="/alarmas">Mis alarmas</Link>
        <Link href="/precios">Planes</Link>
        <button className="link" onClick={() => supabaseBrowser().auth.signOut()}>Salir</button>
      </div>
    );
  }

  return (
    <form className="authbar" onSubmit={entrar}>
      <Link href="/precios">Planes</Link>
      <input type="email" required aria-label="Tu correo" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="trampa" value={web} onChange={(e) => setWeb(e.target.value)} />
      <button disabled={busy}>Registrarme / Entrar</button>
      {msg && <span className="muted" role="status">{msg}</span>}
      <label className="consent check-consent">
        <input type="checkbox" required />
        <span>
          Soy mayor de 18 años y autorizo el tratamiento de mis datos según la <Link href="/privacidad">política de datos</Link> y acepto los <Link href="/terminos">términos</Link>.
        </span>
      </label>
    </form>
  );
}

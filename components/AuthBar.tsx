"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useSession } from "@/lib/use-session";

export default function AuthBar() {
  const { session, ready } = useSession();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    setMsg(error ? error.message : "Te enviamos un enlace de acceso. Revisa tu correo.");
  }

  if (!ready) return <div className="authbar" />;

  if (session) {
    return (
      <div className="authbar">
        <span>{session.user.email}</span>
        <Link href="/alarmas">Mis alarmas</Link>
        <button className="link" onClick={() => supabaseBrowser().auth.signOut()}>Salir</button>
      </div>
    );
  }

  return (
    <form className="authbar" onSubmit={entrar}>
      <input type="email" required placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={busy}>Registrarme / Entrar</button>
      <span className="muted" style={{ fontSize: 12 }}>
        Al registrarte aceptas la <Link href="/privacidad">política de tratamiento de datos</Link>.
      </span>
      {msg && <span className="muted">{msg}</span>}
    </form>
  );
}

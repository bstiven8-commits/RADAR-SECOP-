import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Icons";
import { facet } from "@/lib/secop";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

export const metadata: Metadata = {
  title: `Contratación pública por departamento — ${NOMBRE}`,
  description: "Explora los procesos de contratación pública de SECOP II por departamento de Colombia.",
};

export default async function Departamentos() {
  let lista: string[] = [];
  try {
    lista = (await facet("secop2", "departamento")).filter((d) => !/no definido/i.test(d));
  } catch {}
  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand"><Logo /><span>{NOMBRE}</span></Link>
      </header>
      <h1 className="titulo">Contratación pública por departamento</h1>
      <p className="sub">Elige un departamento para ver los procesos de SECOP II que aún reciben ofertas.</p>
      <ul className="lista-deptos">
        {lista.map((d) => (
          <li key={d}><Link href={`/departamento/${slugify(d)}`}>{d}</Link></li>
        ))}
      </ul>
      {!lista.length && <p className="muted">No pudimos cargar la lista en este momento.</p>}
    </div>
  );
}

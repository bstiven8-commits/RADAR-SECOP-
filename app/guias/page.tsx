import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Icons";
import { GUIAS } from "@/lib/guias";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

export const metadata: Metadata = {
  title: `Guías para venderle al Estado por sector — ${NOMBRE}`,
  description: "Guías prácticas para contratar con el Estado colombiano: tecnología, construcción, interventoría, salud, papelería y aseo, consultoría, dotación y alimentación.",
  alternates: { canonical: "/guias" },
};

export default function Guias() {
  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand" aria-label="Radar SECOP, inicio"><Logo /><span>{NOMBRE}</span></Link>
      </header>
      <Link href="/" className="volver">Volver a la búsqueda</Link>
      <h1 className="titulo">Guías para venderle al Estado</h1>
      <p className="sub">Qué compra el Estado en cada sector, qué documentos piden y cómo empezar. Elige el tuyo.</p>
      <ul className="lista-guias">
        {GUIAS.map((g) => (
          <li key={g.slug}>
            <Link href={`/guias/${g.slug}`}><strong>{g.nombre}</strong><span>{g.resumen}</span></Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

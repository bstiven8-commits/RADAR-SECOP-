import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Buscador from "@/components/Buscador";
import { facet, search, type SearchResult } from "@/lib/secop";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

type Params = Promise<{ slug: string }>;

async function nombreDe(slug: string): Promise<string | null> {
  try {
    const todos = await facet("secop2", "departamento");
    return todos.find((d) => slugify(d) === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const nombre = await nombreDe((await params).slug);
  if (!nombre) return { title: `Departamentos — ${NOMBRE}` };
  return {
    title: `Contratación pública en ${nombre}: procesos SECOP abiertos — ${NOMBRE}`,
    description: `Procesos de contratación pública de entidades de ${nombre} publicados en SECOP II. Filtra por palabra clave, valor y modalidad, y crea una alarma por correo.`,
  };
}

export default async function Departamento({ params }: { params: Params }) {
  const nombre = await nombreDe((await params).slug);
  if (!nombre) notFound();

  let r: SearchResult = { items: [], hasMore: false };
  try {
    r = await search({ source: "secop2", departamento: nombre, abiertos: true }, 0, 20);
  } catch {}

  return (
    <Buscador
      titulo={`Procesos de contratación en ${nombre}`}
      sub={`Procesos de SECOP II de ${nombre} que aún reciben ofertas. Cambia el departamento, agrega palabras clave o más filtros, y crea una alarma.`}
      inicial={{ departamento: nombre, items: r.items, hasMore: r.hasMore }}
    />
  );
}

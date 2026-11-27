import Buscador from "@/components/Buscador";
import { parseFilters, search, type Proceso } from "@/lib/secop";

// Los ejemplos de la portada se renuevan cada 10 minutos
export const revalidate = 600;

export default async function Home() {
  let ejemplos: Proceso[] = [];
  try {
    const r = await search(parseFilters(new URLSearchParams({ abiertos: "1", source: "secop2" })), 0, 4, 600);
    ejemplos = r.items;
  } catch {}
  return <Buscador ejemplos={ejemplos} />;
}

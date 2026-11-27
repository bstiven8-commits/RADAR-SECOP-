import type { Metadata } from "next";
import Buscador from "@/components/Buscador";
import JsonLd from "@/components/JsonLd";
import { parseFilters, search, type Proceso } from "@/lib/secop";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alertasecop.com").replace(/\/$/, "");
const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

// Los ejemplos de la portada se renuevan cada 10 minutos
export const revalidate = 600;

export default async function Home() {
  let ejemplos: Proceso[] = [];
  try {
    const r = await search(parseFilters(new URLSearchParams({ abiertos: "1", source: "secop2" })), 0, 4, 600);
    ejemplos = r.items;
  } catch {}
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "Organization", name: NOMBRE, url: BASE },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: NOMBRE,
            url: BASE,
            inLanguage: "es-CO",
            potentialAction: { "@type": "SearchAction", target: `${BASE}/?q={search_term_string}`, "query-input": "required name=search_term_string" },
          },
        ]}
      />
      <Buscador ejemplos={ejemplos} />
    </>
  );
}

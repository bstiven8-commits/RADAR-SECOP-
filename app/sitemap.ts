import type { MetadataRoute } from "next";
import { facet } from "@/lib/secop";
import { slugify } from "@/lib/slug";
import { GUIAS } from "@/lib/guias";
import { GENERALES } from "@/lib/guias-generales";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alertasecop.com").replace(/\/$/, "");
  let deptos: string[] = [];
  try {
    deptos = (await facet("secop2", "departamento")).filter((d) => !/no definido/i.test(d));
  } catch {}
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/precios`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/guias`, changeFrequency: "monthly", priority: 0.7 },
    ...GENERALES.map((g) => ({ url: `${base}/guias/${g.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...GUIAS.map((g) => ({ url: `${base}/guias/${g.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/departamentos`, changeFrequency: "weekly", priority: 0.7 },
    ...deptos.map((d) => ({ url: `${base}/departamento/${slugify(d)}`, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}

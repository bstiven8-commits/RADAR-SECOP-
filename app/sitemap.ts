import type { MetadataRoute } from "next";
import { facet } from "@/lib/secop";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alertasecop.com").replace(/\/$/, "");
  let deptos: string[] = [];
  try {
    deptos = await facet("secop2", "departamento");
  } catch {}
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/precios`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/departamentos`, changeFrequency: "weekly", priority: 0.7 },
    ...deptos.map((d) => ({ url: `${base}/departamento/${slugify(d)}`, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}

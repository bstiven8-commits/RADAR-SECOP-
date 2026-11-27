import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alertasecop.com").replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/alarmas", "/favoritos", "/pago/"] }, sitemap: `${base}/sitemap.xml` };
}

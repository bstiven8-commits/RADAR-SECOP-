import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const nombre = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

const sans = Schibsted_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alertasecop.com").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: `${nombre} — alertas de contratación pública (SECOP I y II)`,
  description: "Busca procesos de SECOP I y II y recibe un correo cuando aparezcan contratos nuevos de tu sector. Filtra por departamento, valor y modalidad. Empieza gratis.",
  openGraph: { type: "website", locale: "es_CO", siteName: nombre },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={sans.variable}>
      <body>
        <a href="#contenido" className="saltar">Saltar al contenido</a>
        <main id="contenido" tabIndex={-1}>{children}</main>
      </body>
    </html>
  );
}

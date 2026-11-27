import { ImageResponse } from "next/og";

// Imagen que se muestra al compartir el enlace en WhatsApp, redes y correo
export const alt = "Radar SECOP: alertas de contratación pública";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0e5a43", color: "#ffffff", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 800 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: "#f5b800" }} />
          Radar SECOP
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Entérate primero de cada contrato público</div>
          <div style={{ fontSize: 34, color: "#cfe9dd" }}>Procesos de SECOP I y II y alertas en tu correo</div>
        </div>
        <div style={{ fontSize: 30, color: "#f5b800", fontWeight: 700 }}>alertasecop.com</div>
      </div>
    ),
    size,
  );
}

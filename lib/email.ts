import type { Proceso } from "./secop";

const h = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fechaCorta = (s?: string | null) => (s ? s.slice(0, 10) : "");

const cop = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export interface Digest {
  alarma: string;
  procesos: Proceso[];
}

function resumen(p: Proceso): string {
  const d = (p.descripcion ?? "").trim();
  if (!d || d === p.objeto.trim()) return "";
  const corto = d.length > 280 ? `${d.slice(0, 280).trimEnd()}…` : d;
  return `<div style="font-size:13px;color:#333;margin:6px 0">${h(corto)}</div>`;
}

export function digestHtml(digests: Digest[], appUrl: string, bajaLink: string): string {
  const bloques = digests
    .map(
      (d) => `
      <h3 style="margin:24px 0 8px">${h(d.alarma)} <span style="color:#666;font-weight:normal">(${d.procesos.length} nuevos)</span></h3>
      ${d.procesos
        .map(
          (p) => `
        <div style="border:1px solid #e3e3e3;border-radius:8px;padding:12px;margin:8px 0">
          <div style="font-size:12px;color:#666">${p.source === "secop2" ? "SECOP II" : "SECOP I"} · ${h(p.modalidad)} · ${h(p.estado)}</div>
          <div style="font-weight:600;margin:4px 0">${h(p.objeto.slice(0, 220))}</div>
          <div style="font-size:13px;color:#444">${h(p.entidad)} — ${h([p.ciudad, p.departamento].filter(Boolean).join(", "))}</div>
          ${resumen(p)}
          <table style="font-size:13px;color:#444;margin:8px 0;border-collapse:collapse">
            <tr><td style="padding:2px 12px 2px 0;color:#777">Valor</td><td><b>${cop(p.valor)}</b></td></tr>
            <tr><td style="padding:2px 12px 2px 0;color:#777">Publicado</td><td>${h(fechaCorta(p.fecha) || "—")}</td></tr>
            ${p.cierre ? `<tr><td style="padding:2px 12px 2px 0;color:#777">Cierre de ofertas</td><td><b>${h(fechaCorta(p.cierre))}</b></td></tr>` : ""}
            ${p.duracion ? `<tr><td style="padding:2px 12px 2px 0;color:#777">Duración</td><td>${h(p.duracion)}</td></tr>` : ""}
            ${p.ofertas != null ? `<tr><td style="padding:2px 12px 2px 0;color:#777">Ofertas recibidas</td><td>${p.ofertas}</td></tr>` : ""}
            ${p.adjudicado ? `<tr><td style="padding:2px 12px 2px 0;color:#777">Adjudicado a</td><td>${h(p.adjudicado)}</td></tr>` : ""}
          </table>
          ${p.url ? `<a href="${h(p.url)}" style="font-size:13px">Ver proceso y documentos (estudios previos) en SECOP</a>` : ""}
        </div>`,
        )
        .join("")}`,
    )
    .join("");
  return `<div style="font-family:system-ui,sans-serif;max-width:640px;margin:auto">
    <h2>Nuevos procesos para tus alarmas</h2>${bloques}
    <p style="font-size:12px;color:#777;margin-top:32px">
      Administra o elimina tus alarmas en <a href="${h(appUrl)}/alarmas">${h(appUrl)}/alarmas</a>.<br>
      ¿No quieres más correos? <a href="${h(bajaLink)}">Darme de baja</a> ·
      <a href="${h(appUrl)}/privacidad">Política de tratamiento de datos</a>.
    </p></div>`;
}

export async function sendEmail(to: string, subject: string, html: string, bajaLink?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("Faltan RESEND_API_KEY o EMAIL_FROM");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(bajaLink && {
        headers: { "List-Unsubscribe": `<${bajaLink}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      }),
    }),
  });
  if (!res.ok) throw new Error(`Resend respondió ${res.status}: ${await res.text()}`);
}

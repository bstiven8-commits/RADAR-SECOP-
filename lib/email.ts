import type { Proceso } from "./secop";

const h = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cop = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export interface Digest {
  alarma: string;
  procesos: Proceso[];
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
          <div style="font-size:13px;color:#444">Valor: ${cop(p.valor)}</div>
          ${p.url ? `<a href="${h(p.url)}" style="font-size:13px">Ver en SECOP</a>` : ""}
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

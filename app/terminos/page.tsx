import Link from "next/link";
import { PRECIOS_COP, DIAS_PLAN } from "@/lib/plans";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";
const CONTACTO = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@tudominio.com";
const cop = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export const metadata = { title: `Términos y condiciones — ${NOMBRE}` };

// BORRADOR: revísalo con un abogado y completa responsable, NIT y domicilio antes de publicar.
export default function Terminos() {
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <Link href="/" className="volver">Volver a la búsqueda</Link>
      <h1 className="titulo">Términos y condiciones</h1>
      <p className="muted">Última actualización: noviembre de 2026</p>

      <h3>1. Qué es {NOMBRE}</h3>
      <p>
        {NOMBRE} es una plataforma web que permite consultar procesos de contratación pública de SECOP I y SECOP II y crear alarmas que envían un correo
        cuando aparecen procesos nuevos que coinciden con los filtros del usuario. No es una entidad estatal ni está afiliada a Colombia Compra Eficiente.
      </p>

      <h3>2. Origen y alcance de la información</h3>
      <p>
        Los procesos se obtienen de los datos abiertos de datos.gov.co, que registran las entidades contratantes. La plataforma no garantiza que la información
        esté completa, actualizada o libre de errores, ni que una alarma detecte todos los procesos. Verifica siempre en SECOP antes de tomar decisiones o presentar ofertas.
      </p>

      <h3>3. Cuenta</h3>
      <p>Para crear alarmas se usa el correo electrónico del usuario, con un enlace de acceso. El usuario es responsable de mantener el acceso a su correo y de la información que registre.</p>

      <h3>4. Planes y pagos</h3>
      <p>
        El plan Gratis no tiene costo. Los planes Pro ({cop(PRECIOS_COP.pro)}) y Business ({cop(PRECIOS_COP.business)}) se pagan por {DIAS_PLAN} días en pesos colombianos
        mediante Wompi. No se renuevan automáticamente: al terminar el período, la cuenta vuelve al plan Gratis y las alarmas creadas se conservan, con las limitaciones de ese plan.
        Si el usuario paga el mismo plan antes de que venza, los {DIAS_PLAN} días se suman al tiempo restante. Los precios pueden cambiar; el cambio no afecta períodos ya pagados.
      </p>

      <h3>5. Devoluciones</h3>
      <p>Las condiciones para solicitar la devolución del dinero están en la <Link href="/devoluciones">política de devoluciones</Link>.</p>

      <h3>6. Uso adecuado</h3>
      <p>
        El usuario se compromete a no usar la plataforma para actividades ilícitas, ni para sobrecargar o intentar vulnerar el servicio, ni para revender el acceso sin autorización.
        Podemos suspender cuentas que incumplan estas condiciones.
      </p>

      <h3>7. Disponibilidad</h3>
      <p>
        Procuramos que el servicio esté disponible, pero puede haber interrupciones por mantenimiento, fallas de proveedores o de las fuentes de datos. Los correos de alarma
        pueden demorarse o no entregarse por causas ajenas a la plataforma.
      </p>

      <h3>8. Limitación de responsabilidad</h3>
      <p>
        La plataforma es una herramienta de apoyo. No se responsabiliza por decisiones tomadas con base en su información ni por oportunidades de contratación no detectadas,
        dentro de lo permitido por la ley colombiana.
      </p>

      <h3>9. Datos personales</h3>
      <p>El tratamiento de datos se rige por la <Link href="/privacidad">política de tratamiento de datos</Link>.</p>

      <h3>10. Contacto y ley aplicable</h3>
      <p>Para consultas, reclamos o solicitudes: {CONTACTO}. Estos términos se rigen por las leyes de la República de Colombia.</p>
    </div>
  );
}

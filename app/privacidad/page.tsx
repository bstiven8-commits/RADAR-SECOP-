import Link from "next/link";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";
const CONTACTO = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@tudominio.com";

export const metadata = { title: `Política de tratamiento de datos — ${NOMBRE}` };

// BORRADOR: revísalo con un abogado y completa responsable, NIT y domicilio antes de publicar (Ley 1581 de 2012).
export default function Privacidad() {
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <p><Link href="/">← Volver</Link></p>
      <h1>Política de tratamiento de datos personales</h1>
      <p className="muted">Última actualización: noviembre de 2026</p>

      <h3>1. Responsable</h3>
      <p>{NOMBRE} (en adelante, “la plataforma”). Contacto para consultas y reclamos: {CONTACTO}.</p>

      <h3>2. Datos que recolectamos</h3>
      <p>Tu correo electrónico, las alarmas (filtros de búsqueda) que crees y los registros técnicos mínimos necesarios para operar el servicio. No recolectamos datos sensibles.</p>

      <h3>3. Finalidad</h3>
      <p>Autenticarte con un enlace de acceso, guardar tus alarmas, enviarte correos con procesos nuevos que coincidan con ellas y, si en el futuro hay planes de pago, gestionar tu suscripción y comunicarte cambios del servicio.</p>

      <h3>4. Derechos del titular</h3>
      <p>Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar tu autorización, escribiendo a {CONTACTO}. Cada correo incluye un enlace para darte de baja de las alertas.</p>

      <h3>5. Encargados y terceros</h3>
      <p>Usamos proveedores de infraestructura para operar el servicio (alojamiento, base de datos y envío de correo). No vendemos tus datos.</p>

      <h3>6. Fuente de la información de procesos</h3>
      <p>Los procesos se consultan de los datos abiertos de datos.gov.co publicados por Colombia Compra Eficiente. La plataforma no es una entidad estatal; verifica siempre la información en SECOP.</p>

      <h3>7. Vigencia</h3>
      <p>Conservamos tus datos mientras tengas cuenta activa. Puedes solicitar su eliminación en cualquier momento.</p>
    </div>
  );
}

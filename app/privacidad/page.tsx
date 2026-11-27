import Link from "next/link";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";
const CONTACTO = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@tudominio.com";

export const metadata = { title: `Política de tratamiento de datos — ${NOMBRE}` };

// BORRADOR: revísalo con un abogado y completa responsable, NIT y domicilio antes de publicar (Ley 1581 de 2012).
export default function Privacidad() {
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <Link href="/" className="volver">Volver a la búsqueda</Link>
      <h1 className="titulo">Política de tratamiento de datos personales</h1>
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
      <p>Usamos estos proveedores para operar el servicio. No vendemos tus datos ni los usamos para publicidad.</p>
      <ul>
        <li><strong>Supabase</strong>: autenticación y base de datos (servidores en Estados Unidos).</li>
        <li><strong>Vercel</strong>: alojamiento del sitio (infraestructura en Estados Unidos y otras regiones).</li>
        <li><strong>Resend</strong>: envío de correos (Estados Unidos).</li>
        <li><strong>Telegram</strong> (opcional): si conectas los avisos por Telegram, guardamos el identificador de tu chat para enviarte los mensajes.</li>
        <li><strong>Wompi</strong>: procesamiento de pagos. Los datos de tu medio de pago los captura Wompi; nosotros no los vemos ni los guardamos.</li>
      </ul>
      <p>Al usar el servicio autorizas que tu correo y tus alarmas se almacenen y procesen en esos proveedores, algunos fuera de Colombia (transferencia y transmisión internacional de datos).</p>

      <h3>6. Cookies y almacenamiento local</h3>
      <p>
        No usamos cookies de publicidad ni de analítica. Solo guardamos en tu navegador, en su almacenamiento local, la sesión que se crea cuando entras con el enlace
        de acceso, para que no tengas que repetirlo en cada visita. Es necesaria para el funcionamiento y se borra al cerrar sesión o limpiar los datos del navegador.
        Si en el futuro agregamos herramientas de medición, te lo informaremos y te pediremos tu autorización antes.
      </p>

      <h3>7. Menores de edad</h3>
      <p>El servicio es solo para mayores de 18 años. No recolectamos datos de menores de manera consciente; si detectamos una cuenta de un menor, la eliminaremos.</p>

      <h3>8. Fuente de la información de procesos</h3>
      <p>Los procesos se consultan de los datos abiertos de datos.gov.co publicados por Colombia Compra Eficiente. La plataforma no es una entidad estatal; verifica siempre la información en SECOP.</p>

      <h3>9. Vigencia y eliminación</h3>
      <p>Conservamos tus datos mientras tengas cuenta activa. Puedes eliminar tu cuenta en cualquier momento desde “Mis alarmas”, o pedirlo por correo. Al eliminarla se borran tu correo, tus alarmas y tus registros de pago en la plataforma; Wompi puede conservar el registro de las transacciones según la ley.</p>
    </div>
  );
}

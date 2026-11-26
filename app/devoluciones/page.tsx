import Link from "next/link";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";
const CONTACTO = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@tudominio.com";

export const metadata = { title: `Política de devoluciones — ${NOMBRE}` };

// BORRADOR: revísalo con un abogado (Ley 1480 de 2011, derecho de retracto en compras a distancia) antes de publicar.
export default function Devoluciones() {
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <Link href="/" className="volver">Volver a la búsqueda</Link>
      <h1 className="titulo">Política de devoluciones</h1>
      <p className="muted">Última actualización: noviembre de 2026</p>

      <h3>1. Qué se puede devolver</h3>
      <p>
        Los planes de pago de {NOMBRE} (Pro y Business) se pagan por 30 días. Puedes solicitar la devolución del dinero dentro de los
        <strong> 5 días hábiles siguientes al pago</strong>, sin tener que explicar el motivo.
      </p>

      <h3>2. Cómo solicitarla</h3>
      <p>Escribe a {CONTACTO} desde el correo con el que te registraste e incluye la referencia del pago (empieza por “RS-”). Respondemos en un máximo de 3 días hábiles.</p>

      <h3>3. Cómo se devuelve el dinero</h3>
      <p>
        El reembolso se hace por el mismo medio con el que pagaste, a través de Wompi. El tiempo en que se refleje depende de tu banco o medio de pago.
        Al devolverse el pago, tu cuenta vuelve al plan Gratis.
      </p>

      <h3>4. Pagos con problemas</h3>
      <p>
        Si el pago fue rechazado, no se hace ningún cobro. Si te cobraron y tu plan no se activó, escríbenos con la referencia y lo resolvemos o te devolvemos el dinero.
      </p>

      <h3>5. Después del plazo</h3>
      <p>
        Pasados los 5 días hábiles, no hay devolución por el período ya pagado, porque el servicio se presta desde el momento de la activación. El plan no se renueva solo,
        así que no habrá cobros posteriores sin que tú los hagas.
      </p>

      <p className="muted">Ver también los <Link href="/terminos">términos y condiciones</Link>.</p>
    </div>
  );
}

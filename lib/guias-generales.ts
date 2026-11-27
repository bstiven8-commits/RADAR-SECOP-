// Guías generales (no son de un sector): explican cómo se contrata con el Estado en Colombia.
// Contenido informativo; las normas y los montos cambian y cada guía lo advierte.
export interface Seccion {
  t: string;
  p?: string[]; // párrafos
  l?: string[]; // lista
}
export interface GuiaGeneral {
  slug: string;
  nombre: string;
  titulo: string;
  resumen: string;
  secciones: Seccion[];
  fuentes?: { t: string; u: string }[];
}

export const GENERALES: GuiaGeneral[] = [
  {
    slug: "como-ser-proveedor-del-estado",
    nombre: "Cómo ser proveedor del Estado",
    titulo: "Cómo ser proveedor del Estado colombiano, paso a paso",
    resumen: "Qué documentos necesitas, cómo registrarte en SECOP II y cómo conseguir tu primer contrato. Sirve para personas naturales y para empresas.",
    secciones: [
      { t: "Quién puede venderle al Estado", p: ["Pueden hacerlo personas naturales y jurídicas, colombianas o extranjeras, que no tengan inhabilidades ni incompatibilidades para contratar. No necesitas ser una empresa grande: muchos contratos pequeños los ganan independientes y microempresas."] },
      { t: "Lo que debes tener listo antes", l: ["RUT actualizado en la DIAN, con la actividad económica de lo que vas a ofrecer", "Cédula (o, si eres empresa, certificado de existencia y representación legal de la Cámara de Comercio)", "Cuenta bancaria a tu nombre o al de la empresa", "Soportes de experiencia: contratos, certificaciones o facturas de trabajos parecidos al que vas a ofrecer", "Estar al día con salud, pensión y ARL (o con los aportes parafiscales, si eres empresa)"] },
      { t: "Paso 1: regístrate como proveedor en SECOP II", p: ["Es gratis. Creas un usuario en SECOP II, completas los datos de tu empresa o los tuyos y adjuntas los documentos que te pidan. Allí también registras los códigos de clasificación (UNSPSC) de lo que ofreces, para que las entidades te encuentren y para que te avisen de procesos relacionados."] },
      { t: "Paso 2: revisa si necesitas el RUP", p: ["El Registro Único de Proponentes se tramita en la Cámara de Comercio y se exige en muchos procesos grandes. En los de menor valor normalmente no hace falta. Lo explicamos en la guía de qué es el RUP."] },
      { t: "Paso 3: busca procesos que encajen contigo", p: ["Filtra por palabra clave, departamento y valor, y crea una alarma para que te avisemos de los nuevos. Empieza por procesos pequeños, donde se exigen menos requisitos y es más fácil ganar."] },
      { t: "Paso 4: lee los documentos y presenta tu oferta", p: ["En cada proceso están el pliego o la invitación, los estudios previos y los anexos. Allí se dice qué piden, cómo evalúan y las fechas. Si tienes dudas, hay un plazo para hacer observaciones. Presenta la oferta completa y antes de que cierre."] },
      { t: "Errores comunes", l: ["Presentar la oferta incompleta o fuera de plazo", "Tener el RUT o el registro desactualizados", "No poder certificar la experiencia que declaras", "Ofertar sin leer los requisitos técnicos o el anexo de precios", "Cotizar sin incluir impuestos, transporte o garantías"] },
      { t: "Tu primer contrato", p: ["Lo más realista es empezar por la mínima cuantía: son procesos de menor valor, con plazos cortos y menos requisitos. Cada contrato que cumplas te da una certificación que te sirve para procesos más grandes."] },
    ],
    fuentes: [{ t: "Registro de proveedores en SECOP II (Colombia Compra Eficiente)", u: "https://www.colombiacompra.gov.co/secop-ii/registro-de-proveedores-secop-ii" }],
  },
  {
    slug: "que-es-el-rup",
    nombre: "Qué es el RUP",
    titulo: "Qué es el RUP (Registro Único de Proponentes) y cuándo lo necesitas",
    resumen: "El RUP certifica tu experiencia y tu capacidad para contratar con el Estado. Te explicamos qué es, cuándo se exige y cómo prepararlo.",
    secciones: [
      { t: "Qué es", p: ["El Registro Único de Proponentes (RUP) es un registro público que llevan las Cámaras de Comercio. Certifica la capacidad jurídica, financiera y organizacional de quien quiere contratar con el Estado, y su experiencia, clasificada por códigos de bienes y servicios (UNSPSC)."] },
      { t: "Para qué sirve", p: ["Las entidades lo usan para verificar rápido que un proponente cumple los requisitos habilitantes de un proceso, sin revisar cada documento por separado. Con el certificado del RUP vigente, esa verificación ya está hecha."] },
      { t: "Cuándo se exige", p: ["En general se pide en licitaciones públicas, selecciones abreviadas y concursos de méritos. En la mínima cuantía y en la contratación directa normalmente no se exige. Aun así, revisa siempre el pliego del proceso: allí está la regla que aplica."] },
      { t: "Qué se evalúa", l: ["Experiencia: contratos ya ejecutados, clasificados por códigos UNSPSC", "Capacidad financiera: indicadores como liquidez y endeudamiento, a partir de tus estados financieros", "Capacidad organizacional: indicadores de rentabilidad", "Capacidad jurídica: que puedas contratar según tu objeto social o tu actividad"] },
      { t: "Cómo prepararlo", l: ["Reúne tus estados financieros y los certificados de los contratos que quieras acreditar", "Define los códigos UNSPSC que corresponden a lo que vendes", "Haz el trámite en la Cámara de Comercio de tu ciudad, con tiempo antes de los procesos que te interesan", "Revisa que los códigos de tu RUP coincidan con los que pide cada proceso"] },
      { t: "Vigencia y renovación", p: ["El RUP se renueva cada año, a comienzos de abril. Si no lo renuevas a tiempo, pierde vigencia y no puedes presentarte a los procesos que lo exigen. Confirma con tu Cámara de Comercio la fecha y los costos vigentes."] },
    ],
  },
  {
    slug: "minima-cuantia-paso-a-paso",
    nombre: "Mínima cuantía paso a paso",
    titulo: "Contratación de mínima cuantía: cómo participar paso a paso",
    resumen: "La mínima cuantía es la puerta de entrada para ganar contratos pequeños con el Estado. Te explicamos cómo funciona y cómo presentar una buena oferta.",
    secciones: [
      { t: "Qué es la mínima cuantía", p: ["Es la modalidad para los contratos de menor valor de cada entidad: aquellos cuyo valor no supera el 10 % de la menor cuantía de la entidad, sin importar qué se contrate. El tope exacto depende del presupuesto de cada entidad y cambia cada año, así que míralo en cada proceso."] },
      { t: "Por qué conviene empezar por aquí", l: ["Pocos requisitos habilitantes", "Plazos cortos: el proceso se resuelve en días", "Normalmente no se pide RUP", "Cada contrato cumplido te deja una certificación para procesos mayores"] },
      { t: "Cómo funciona", l: ["La entidad publica en SECOP II una invitación con la descripción de lo que necesita, el presupuesto y las condiciones", "Hay un plazo corto para hacer observaciones", "Presentas tu oferta en SECOP II antes del cierre", "Normalmente se evalúa primero el precio: se verifican los requisitos del oferente que ofreció el menor precio", "Si cumple, se le adjudica el contrato; si no, se sigue con el siguiente"] },
      { t: "Cómo presentar una buena oferta", l: ["Lee la invitación completa y el anexo técnico", "Revisa que cumples cada requisito antes de ofertar", "Incluye en tu precio impuestos, transporte y cualquier costo de cumplimiento", "Presenta todos los documentos que piden, en el formato pedido", "Sube la oferta con tiempo: no esperes a la última hora"] },
      { t: "Qué suele descalificar", l: ["Oferta fuera de plazo", "Falta de un documento obligatorio", "No cumplir una especificación técnica", "Precio por encima del presupuesto oficial"] },
      { t: "Después de ganar", p: ["Se firma el contrato en SECOP II, se cumplen las obligaciones y se pide la certificación de cumplimiento. Guarda siempre esa certificación: es tu hoja de vida para el siguiente proceso."] },
    ],
  },
  {
    slug: "acuerdos-marco-de-precios",
    nombre: "Acuerdos Marco de Precios",
    titulo: "Acuerdos Marco de Precios: cómo vender en la Tienda Virtual del Estado",
    resumen: "Muchas entidades compran por acuerdos marco y no abren un proceso nuevo cada vez. Te explicamos qué son y cómo ser proveedor.",
    secciones: [
      { t: "Qué es un acuerdo marco", p: ["Es un contrato que firma Colombia Compra Eficiente con varios proveedores para ofrecer ciertos bienes o servicios, con precios y condiciones ya definidos. Las entidades públicas compran a través de la Tienda Virtual del Estado Colombiano, sin tener que hacer un proceso de selección completo cada vez."] },
      { t: "Cómo compra una entidad", p: ["La entidad entra a la Tienda Virtual, busca el acuerdo marco de lo que necesita, compara a los proveedores y precios, y hace su compra. En algunos acuerdos pide cotizaciones a varios proveedores para elegir."] },
      { t: "Qué categorías existen", p: ["Hay acuerdos para productos y servicios de uso común, por ejemplo útiles de oficina, aseo y cafetería, equipos de cómputo, servicios en la nube o combustible. Cuáles están vigentes cambia con el tiempo: revísalo en el sitio de Colombia Compra Eficiente."] },
      { t: "Cómo ser proveedor", l: ["Ten el registro de proveedor en SECOP II y tus documentos al día", "Revisa qué acuerdos marco están abiertos y cuándo hay procesos de selección o de incorporación de nuevos proveedores", "Cumple los requisitos del proceso: experiencia, capacidad financiera y el catálogo de productos", "Si te seleccionan, mantén tu catálogo y precios al día en la Tienda Virtual"] },
      { t: "Ventajas y límites", l: ["Ventaja: acceso a compras de muchas entidades con un solo registro", "Ventaja: menos trámite por cada venta", "Límite: los precios y condiciones están fijados de antemano y es competitivo", "Límite: solo aplica a las categorías que tengan acuerdo marco"] },
    ],
    fuentes: [{ t: "Colombia Compra Eficiente", u: "https://www.colombiacompra.gov.co" }],
  },
];

export const generalPor = (slug: string) => GENERALES.find((g) => g.slug === slug);

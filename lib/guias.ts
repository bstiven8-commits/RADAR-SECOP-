// Guías por sector: contenido informativo y general. Las normas y montos cambian; cada guía lo advierte.
export interface Guia {
  slug: string;
  nombre: string;
  q: string; // palabras clave de la búsqueda de este sector
  titulo: string;
  resumen: string;
  compra: string[]; // qué suele contratar el Estado
  modalidades: string;
  requisitos: string[];
  consejos: string[];
}

export const GUIAS: Guia[] = [
  {
    slug: "tecnologia",
    nombre: "Tecnología",
    q: "software, sistemas de información, plataforma, licencias, computadores",
    titulo: "Cómo venderle tecnología al Estado en Colombia",
    resumen: "Entidades de todos los niveles contratan desarrollo de software, licencias, equipos de cómputo, conectividad y soporte. Es un sector con muchos procesos pequeños, buenos para empezar.",
    compra: ["Desarrollo y mantenimiento de software o páginas web", "Licencias, nube y soporte técnico", "Computadores, impresoras y equipos de red", "Soporte y mesa de ayuda", "Ciberseguridad y migraciones"],
    modalidades: "Los montos pequeños suelen ir por mínima cuantía o selección abreviada. Para equipos de cómputo y algunos servicios de TI las entidades también compran por Acuerdos Marco de Precios en la Tienda Virtual del Estado Colombiano, donde primero debes estar habilitado como proveedor.",
    requisitos: ["Experiencia certificada en contratos similares (valor y objeto)", "Certificaciones del fabricante cuando lo pidan (por ejemplo para licencias o equipos)", "Soporte técnico con personal acreditado", "Capacidad financiera según los indicadores del pliego"],
    consejos: ["Guarda las certificaciones de cada contrato que termines: son tu activo principal.", "Lee el anexo técnico con calma: cumplir una sola especificación mal puede dejarte fuera.", "Cotiza costos de soporte y garantía; muchas entidades lo evalúan."],
  },
  {
    slug: "construccion",
    nombre: "Construcción",
    q: "obra, construcción, mejoramiento, pavimentación, mantenimiento de vías",
    titulo: "Cómo contratar obras civiles con el Estado en Colombia",
    resumen: "Es el sector que mueve los contratos más grandes: vías, edificaciones públicas, acueductos y adecuaciones. También hay mantenimientos y mejoramientos pequeños para empezar.",
    compra: ["Pavimentación, mantenimiento y rehabilitación de vías", "Construcción y mejoramiento de colegios, centros de salud y vivienda", "Redes de acueducto y alcantarillado", "Adecuaciones y mantenimiento locativo", "Obras menores de espacio público"],
    modalidades: "Las obras grandes se adjudican por licitación pública; las de menor valor, por selección abreviada o mínima cuantía. Con frecuencia se permite presentarse en consorcio o unión temporal para sumar experiencia y capacidad.",
    requisitos: ["Registro Único de Proponentes (RUP) vigente, con la clasificación de bienes y servicios que pide el pliego", "Experiencia en obras similares, medida en valor del contrato", "Indicadores de capacidad financiera y organizacional", "Garantía de seriedad de la oferta (póliza) y, si ganas, garantías de cumplimiento"],
    consejos: ["Revisa en el RUP que tus clasificaciones coincidan con las que exige el proceso antes de preparar la oferta.", "Un consorcio con un socio con más experiencia te abre procesos que solo no podrías cumplir.", "Revisa las visitas técnicas obligatorias y sus fechas: faltar puede descalificarte."],
  },
  {
    slug: "interventoria",
    nombre: "Interventoría",
    q: "interventoría, supervisión",
    titulo: "Cómo ganar contratos de interventoría con el Estado",
    resumen: "La interventoría es el control técnico, administrativo y financiero de otro contrato, casi siempre una obra. Se contrata aparte y valora mucho la experiencia del equipo.",
    compra: ["Interventoría técnica de obras civiles", "Interventoría administrativa y financiera", "Supervisión de proyectos de infraestructura y de suministros"],
    modalidades: "Suele adjudicarse por concurso de méritos, donde pesa la experiencia y la calidad del equipo y no el precio más bajo.",
    requisitos: ["RUP vigente con la clasificación pedida", "Experiencia específica en interventoría de proyectos similares", "Equipo de profesionales con hojas de vida y soportes que cumplan el perfil mínimo", "Capacidad financiera y organizacional según el pliego"],
    consejos: ["Arma desde temprano el equipo: la disponibilidad y los soportes de cada profesional se revisan uno por uno.", "En un concurso de méritos la propuesta técnica es lo que más cuenta; cuídala."],
  },
  {
    slug: "salud",
    nombre: "Salud",
    q: "dotación hospitalaria, medicamentos, insumos médicos, salud",
    titulo: "Cómo venderle insumos y equipos de salud a entidades públicas",
    resumen: "Hospitales públicos, secretarías de salud y entidades del sector compran dotación, insumos, medicamentos y servicios. Es un sector con requisitos sanitarios estrictos.",
    compra: ["Dotación y equipos biomédicos", "Insumos médico-quirúrgicos y de laboratorio", "Medicamentos y dispositivos médicos", "Mantenimiento de equipos", "Servicios de apoyo logístico y aseo hospitalario"],
    modalidades: "Muchos hospitales públicos (las ESE) tienen su propio estatuto de contratación, con reglas distintas a las de una alcaldía; revisa el manual de contratación de cada entidad. Otras entidades del sector usan las modalidades generales.",
    requisitos: ["Registros y autorizaciones sanitarias vigentes del producto o servicio (por ejemplo ante el INVIMA)", "Experiencia en suministro a entidades de salud", "Certificados de calidad y de cadena de frío cuando aplique", "Capacidad para entregas oportunas y en las cantidades pedidas"],
    consejos: ["Verifica que cada ítem tenga el registro sanitario correcto antes de ofertar.", "Los hospitales pagan con ciclos largos en algunos casos: calcula tu flujo de caja."],
  },
  {
    slug: "papeleria-y-aseo",
    nombre: "Papelería y aseo",
    q: "papelería, útiles de oficina, aseo, cafetería",
    titulo: "Cómo venderle papelería, aseo y cafetería al Estado",
    resumen: "Son compras recurrentes de casi todas las entidades. Los valores por contrato son bajos, pero se repiten y sirven para construir experiencia certificada.",
    compra: ["Papelería y útiles de oficina", "Elementos de aseo y cafetería", "Insumos de impresión y tóner", "Servicio de aseo y mantenimiento de instalaciones"],
    modalidades: "Predominan la mínima cuantía y las compras por Acuerdo Marco de Precios en la Tienda Virtual del Estado Colombiano, donde algunas categorías de papelería, aseo y cafetería se compran con proveedores ya habilitados. Revisa qué acuerdos están vigentes y cómo ser proveedor.",
    requisitos: ["Registro como proveedor en SECOP II", "Cotización en el formato y plazo que pide la entidad", "Cumplimiento de fichas técnicas y entrega en los plazos", "Documentos tributarios y de seguridad social al día"],
    consejos: ["En mínima cuantía gana normalmente el precio más bajo que cumple: afina tus costos por ítem.", "Responde rápido: los plazos de cotización suelen ser de pocos días.", "Pide a cada entidad una certificación de cumplimiento; te sirve para procesos mayores."],
  },
  {
    slug: "consultoria",
    nombre: "Consultoría",
    q: "consultoría, asesoría, estudios y diseños",
    titulo: "Cómo conseguir contratos de consultoría con el Estado",
    resumen: "Estudios, diseños, asesorías y apoyo profesional. Aquí se contrata sobre todo talento y experiencia, así que es un sector abierto a personas naturales y pequeñas firmas.",
    compra: ["Estudios y diseños de ingeniería y arquitectura", "Asesoría jurídica, financiera o técnica", "Estudios de mercado y formulación de proyectos", "Apoyo profesional a la gestión de la entidad"],
    modalidades: "Las consultorías se adjudican por concurso de méritos. Los servicios profesionales de personas naturales con idoneidad suelen contratarse de forma directa; revisa los procesos y sus justificaciones.",
    requisitos: ["Hoja de vida con soportes de estudios y experiencia", "RUP cuando lo exija el proceso", "Experiencia específica en proyectos similares", "Propuesta técnica clara y metodología"],
    consejos: ["Cuida los soportes: cada experiencia declarada debe poder certificarse.", "Una buena propuesta técnica pesa más que el precio en un concurso de méritos."],
  },
  {
    slug: "dotacion-y-vestuario",
    nombre: "Dotación y vestuario",
    q: "dotación, uniformes, vestuario, calzado",
    titulo: "Cómo venderle dotación y uniformes al Estado",
    resumen: "Las entidades dotan a su personal y a sus programas: uniformes, calzado, elementos de protección. Es un sector donde el cumplimiento de tallas, muestras y tiempos de entrega define quién gana.",
    compra: ["Uniformes y vestuario institucional", "Calzado y dotación de trabajo", "Elementos de protección personal", "Dotación para programas sociales"],
    modalidades: "Según el valor: mínima cuantía, selección abreviada o compra por Acuerdo Marco cuando exista uno para la categoría. Revisa en la Tienda Virtual del Estado Colombiano qué hay vigente.",
    requisitos: ["Experiencia en suministro de dotación", "Muestras o fichas técnicas conforme a lo que pide el pliego", "Capacidad de producción y entrega por lotes en plazo", "Garantía de calidad de los materiales"],
    consejos: ["Guarda registros de tallas y entregas: las entidades reclaman por errores de talla.", "Confirma plazos de tu proveedor de tela o calzado antes de ofertar."],
  },
  {
    slug: "alimentacion",
    nombre: "Alimentación",
    q: "alimentos, suministro de alimentación, refrigerios, mercados",
    titulo: "Cómo venderle alimentación y refrigerios al Estado",
    resumen: "Programas de alimentación escolar, eventos, hospitales y entidades contratan alimentos y refrigerios. Exige cumplir normas sanitarias y tener logística de entrega.",
    compra: ["Suministro de alimentos y mercados", "Refrigerios para eventos y capacitaciones", "Alimentación en programas sociales y escolares", "Servicio de alimentación para entidades con internado o turnos"],
    modalidades: "Depende del valor y de la entidad: mínima cuantía para compras pequeñas, selección abreviada o licitación para programas grandes. Los programas de alimentación escolar tienen reglas propias; revisa cada proceso.",
    requisitos: ["Concepto sanitario favorable y cumplimiento de buenas prácticas de manufactura", "Experiencia en suministro de alimentos", "Capacidad logística y de cadena de frío en la zona de entrega", "Cumplimiento de la minuta o menú que pida la entidad"],
    consejos: ["Verifica la cobertura de entrega: muchos procesos son en municipios apartados.", "Calcula bien los costos de transporte y de pérdida de producto."],
  },
];

export const guiaPor = (slug: string) => GUIAS.find((g) => g.slug === slug);

// Pasos comunes a todos los sectores
export const PASOS_BASE: { t: string; d: string }[] = [
  { t: "Regístrate como proveedor en SECOP II", d: "Es gratis. Con ese registro puedes presentar ofertas en línea. Te piden los datos de tu empresa o de ti como persona natural." },
  { t: "Revisa si necesitas el RUP", d: "El Registro Único de Proponentes (RUP), que se tramita en la Cámara de Comercio, es obligatorio en la mayoría de licitaciones, selecciones abreviadas y concursos de méritos. En mínima cuantía y contratación directa normalmente no se exige." },
  { t: "Busca procesos que encajen contigo", d: "Filtra por palabra clave, departamento y valor. Crea una alarma para enterarte de los nuevos sin tener que entrar todos los días." },
  { t: "Lee los documentos del proceso", d: "En SECOP II están el pliego, los estudios previos y los anexos. Allí se dice qué piden, cómo evalúan y las fechas de cada etapa." },
  { t: "Pregunta antes de que cierre", d: "Hay un plazo para hacer observaciones al pliego. Si algo no está claro, es el momento de preguntar." },
  { t: "Presenta la oferta completa y a tiempo", d: "Una oferta incompleta o fuera de plazo se rechaza. Prepara los documentos con anticipación." },
];

export const AVISO = "Esta guía es informativa y general, no es asesoría legal. Las normas (como la Ley 80 de 1993, la Ley 1150 de 2007 y el Decreto 1082 de 2015), los montos y los requisitos cambian; verifica siempre en SECOP y en el pliego de cada proceso.";

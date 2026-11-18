// Verifica que las columnas que usa la app existan en los datasets reales.
// Uso: npm run check:fields   (necesita internet; opcional SOCRATA_TOKEN)
const BASE = "https://www.datos.gov.co/resource";

const ESPERADOS = {
  "p6dx-8zbt (SECOP II)": [
    "id_del_proceso", "referencia_del_proceso", "nombre_del_procedimiento", "descripci_n_del_procedimiento",
    "entidad", "departamento_entidad", "ciudad_entidad", "estado_del_procedimiento", "fase",
    "modalidad_de_contratacion", "fecha_de_publicacion_del", "precio_base", "urlproceso",
  ],
  "f789-7hwg (SECOP I)": [
    "numero_de_constancia", "uid", "nombre_entidad", "departamento_entidad", "municipio_entidad",
    "estado_del_proceso", "modalidad_de_contratacion", "fecha_de_cargue_en_el_secop",
    "cuantia_proceso", "detalle_del_objeto_a_contratar", "objeto_a_contratar", "ruta_proceso_en_secop_i",
  ],
};

const headers = process.env.SOCRATA_TOKEN ? { "X-App-Token": process.env.SOCRATA_TOKEN } : {};
let problemas = 0;

for (const [nombre, campos] of Object.entries(ESPERADOS)) {
  const id = nombre.split(" ")[0];
  const res = await fetch(`${BASE}/${id}.json?$limit=1`, { headers });
  if (!res.ok) { console.log(`✗ ${nombre}: HTTP ${res.status}`); problemas++; continue; }
  const [fila] = await res.json();
  const reales = new Set(Object.keys(fila ?? {}));
  const faltan = campos.filter((c) => !reales.has(c));
  console.log(`\n${nombre}: ${faltan.length ? "faltan " + faltan.join(", ") : "todas las columnas existen"}`);
  if (faltan.length) {
    problemas++;
    console.log("  Columnas disponibles:", [...reales].join(", "));
    console.log("  → Ajusta DATASETS y normalize() en lib/secop.ts");
  }
}
process.exit(problemas ? 1 : 0);

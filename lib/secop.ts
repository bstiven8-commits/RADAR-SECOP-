// Consulta a los datasets abiertos de SECOP I y II (Socrata, datos.gov.co).
// SECOP II - Procesos de Contratación: p6dx-8zbt
// SECOP I  - Procesos de Compra Pública: f789-7hwg
// Si un nombre de columna cambia, corre `npm run check:fields` para detectarlo.

export type Source = "secop2" | "secop1" | "both";
export type SingleSource = "secop2" | "secop1";

export interface Filters {
  source: Source;
  q?: string;
  modalidad?: string;
  estado?: string;
  departamento?: string;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}

export interface Proceso {
  key: string;
  source: SingleSource;
  id: string;
  entidad: string;
  objeto: string;
  modalidad: string;
  estado: string;
  departamento: string;
  ciudad: string;
  valor: number | null;
  fecha: string | null;
  url: string | null;
}

const BASE = "https://www.datos.gov.co/resource";

export const DATASETS = {
  secop2: {
    id: "p6dx-8zbt",
    modalidad: "modalidad_de_contratacion",
    estado: "estado_del_procedimiento",
    departamento: "departamento_entidad",
    fecha: "fecha_de_publicacion_del",
    texto: ["nombre_del_procedimiento", "descripci_n_del_procedimiento"],
  },
  secop1: {
    id: "f789-7hwg",
    modalidad: "modalidad_de_contratacion",
    estado: "estado_del_proceso",
    departamento: "departamento_entidad",
    fecha: "fecha_de_cargue_en_el_secop",
    texto: ["detalle_del_objeto_a_contratar", "objeto_a_contratar"],
  },
} as const;

type Row = Record<string, unknown>;

const esc = (s: string) => s.replace(/'/g, "''");
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const urlOf = (v: unknown): string | null => {
  if (typeof v === "string") return v || null;
  if (v && typeof v === "object" && "url" in v) return str((v as { url: unknown }).url) || null;
  return null;
};

function where(src: SingleSource, f: Filters): string {
  const c = DATASETS[src];
  // Sin fecha de publicación son borradores no públicos: se excluyen y evitan que lideren el orden por fecha.
  const parts: string[] = [`${c.fecha} IS NOT NULL`];
  if (f.modalidad) parts.push(`${c.modalidad} = '${esc(f.modalidad)}'`);
  if (f.estado) parts.push(`${c.estado} = '${esc(f.estado)}'`);
  if (f.departamento) parts.push(`${c.departamento} = '${esc(f.departamento)}'`);
  if (f.desde) parts.push(`${c.fecha} >= '${esc(f.desde)}T00:00:00'`);
  if (f.hasta) parts.push(`${c.fecha} <= '${esc(f.hasta)}T23:59:59'`);
  const q = f.q?.trim();
  if (q) {
    const like = c.texto.map((col) => `upper(${col}) like upper('%${esc(q)}%')`);
    parts.push(`(${like.join(" OR ")})`);
  }
  return parts.join(" AND ");
}

async function getJson(url: string, revalidate?: number): Promise<Row[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.SOCRATA_TOKEN) headers["X-App-Token"] = process.env.SOCRATA_TOKEN;
  const res = await fetch(url, revalidate ? { headers, next: { revalidate } } : { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`datos.gov.co respondió ${res.status}`);
  return (await res.json()) as Row[];
}

function normalize(src: SingleSource, r: Row): Proceso {
  if (src === "secop2") {
    const id = str(r.id_del_proceso) || str(r.referencia_del_proceso);
    return {
      key: `s2:${id}`,
      source: "secop2",
      id,
      entidad: str(r.entidad),
      objeto: str(r.nombre_del_procedimiento) || str(r.descripci_n_del_procedimiento),
      modalidad: str(r.modalidad_de_contratacion),
      estado: str(r.estado_del_procedimiento) || str(r.fase),
      departamento: str(r.departamento_entidad),
      ciudad: str(r.ciudad_entidad),
      valor: num(r.precio_base),
      fecha: str(r.fecha_de_publicacion_del) || null,
      url: urlOf(r.urlproceso),
    };
  }
  const id = str(r.numero_de_constancia) || str(r.uid) || str(r.numero_de_proceso);
  return {
    key: `s1:${id}`,
    source: "secop1",
    id,
    entidad: str(r.nombre_entidad),
    objeto: str(r.detalle_del_objeto_a_contratar) || str(r.objeto_a_contratar),
    modalidad: str(r.modalidad_de_contratacion),
    estado: str(r.estado_del_proceso),
    departamento: str(r.departamento_entidad),
    ciudad: str(r.municipio_entidad),
    valor: num(r.cuantia_proceso),
    fecha: str(r.fecha_de_cargue_en_el_secop) || null,
    url: urlOf(r.ruta_proceso_en_secop_i),
  };
}

async function querySource(src: SingleSource, f: Filters, offset: number, limit: number): Promise<Proceso[]> {
  const c = DATASETS[src];
  const p = new URLSearchParams({
    $order: `${c.fecha} DESC`,
    $limit: String(limit),
    $offset: String(offset),
  });
  const w = where(src, f);
  if (w) p.set("$where", w);
  const rows = await getJson(`${BASE}/${c.id}.json?${p}`);
  return rows.map((r) => normalize(src, r));
}

export interface SearchResult {
  items: Proceso[];
  hasMore: boolean;
}

export async function search(f: Filters, page = 0, pageSize = 20): Promise<SearchResult> {
  const sources: SingleSource[] = f.source === "both" ? ["secop2", "secop1"] : [f.source];
  const per = f.source === "both" ? Math.ceil(pageSize / 2) : pageSize;
  const parts = await Promise.all(sources.map((s) => querySource(s, f, page * per, per)));
  const items = parts.flat().sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  return { items, hasMore: parts.some((p) => p.length >= per) };
}

// Valores distintos de un campo (modalidad, estado, departamento) para los selectores.
export async function facet(src: Source, field: "modalidad" | "estado" | "departamento"): Promise<string[]> {
  const sources: SingleSource[] = src === "both" ? ["secop2", "secop1"] : [src];
  const lists = await Promise.all(
    sources.map(async (s) => {
      const col = DATASETS[s][field];
      const p = new URLSearchParams({
        $select: `${col} as v, count(*) as n`,
        $group: col,
        $where: `${col} IS NOT NULL`,
        $order: "n DESC",
        $limit: "80",
      });
      const rows = await getJson(`${BASE}/${DATASETS[s].id}.json?${p}`, 86400);
      return rows.map((r) => str(r.v)).filter(Boolean);
    }),
  );
  return [...new Set(lists.flat())].sort((a, b) => a.localeCompare(b, "es"));
}

export function parseFilters(sp: URLSearchParams): Filters {
  const source = sp.get("source");
  const g = (k: string) => sp.get(k)?.trim() || undefined;
  return {
    source: source === "secop1" || source === "both" ? source : "secop2",
    q: g("q"),
    modalidad: g("modalidad"),
    estado: g("estado"),
    departamento: g("departamento"),
    desde: g("desde"),
    hasta: g("hasta"),
  };
}

#!/usr/bin/env python3
"""Radar SECOP II - bot de alertas por Telegram (solo librería estándar).

Revisa datos.gov.co (conjunto SECOP II - Procesos de Contratación) y avisa:
  1. Procesos NUEVOS que cumplan tus búsquedas vigiladas.
  2. Cierres de ofertas a menos de 48 h de tus postulaciones.
  3. Cambios de estado de los procesos que sigues (ej. Adjudicado).

Variables de entorno:
  TELEGRAM_TOKEN, TELEGRAM_CHAT_ID  (obligatorias)
  WATCHES_JSON   contenido del archivo exportado desde la app (o usa watches.json)
  SOCRATA_TOKEN  opcional, evita límites de uso
Uso:
  python watcher.py            una revisión
  python watcher.py --loop 10  revisa cada 10 min (para PC/servidor propio)
  python watcher.py --test     envía un mensaje de prueba
"""
import json, os, sys, time, html, urllib.request, urllib.parse
from datetime import datetime, timedelta, timezone

API = "https://www.datos.gov.co/resource/p6dx-8zbt.json"
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "state.json")
CO = timezone(timedelta(hours=-5))  # hora de Colombia: SECOP guarda fechas sin zona horaria
FINALES = {"Descartada", "Adjudicada", "No adjudicada", "Presentada"}


def now_co():
    return datetime.now(CO).replace(tzinfo=None)


def iso(d):
    return d.strftime("%Y-%m-%dT%H:%M:%S")


def sq(v):
    return str(v).replace("'", "''")


def api(params):
    headers = {"User-Agent": "radar-secop/1.0"}
    if os.getenv("SOCRATA_TOKEN"):
        headers["X-App-Token"] = os.environ["SOCRATA_TOKEN"]
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def build_where(f):
    c = []
    if f.get("q"):
        terms = [t.strip() for t in f["q"].split(",") if t.strip()]
        parts = [
            f"(upper(nombre_del_procedimiento) like upper('%{sq(t)}%') OR "
            f"upper(descripci_n_del_procedimiento) like upper('%{sq(t)}%'))"
            for t in terms
        ]
        if parts:
            c.append("(" + " OR ".join(parts) + ")")
    if f.get("mod"):
        c.append(f"modalidad_de_contratacion='{sq(f['mod'])}'")
    if f.get("dep"):
        c.append(f"departamento_entidad='{sq(f['dep'])}'")
    if f.get("ciu"):
        c.append(f"upper(ciudad_entidad) like upper('%{sq(f['ciu'])}%')")
    if f.get("est"):
        c.append(f"estado_del_procedimiento='{sq(f['est'])}'")
    if f.get("tipo"):
        c.append(f"tipo_de_contrato='{sq(f['tipo'])}'")
    if f.get("min") not in (None, ""):
        c.append(f"precio_base >= {float(f['min'])}")
    if f.get("max") not in (None, ""):
        c.append(f"precio_base <= {float(f['max'])}")
    if f.get("dias"):
        d = (now_co() - timedelta(days=int(f["dias"]))).replace(hour=0, minute=0, second=0)
        c.append(f"fecha_de_publicacion_del >= '{iso(d)}'")
    if f.get("abiertos"):
        c.append(f"fecha_de_recepcion_de > '{iso(now_co())}'")
    return " AND ".join(c)


def money(n):
    try:
        return "$" + f"{float(n):,.0f}".replace(",", ".")
    except (TypeError, ValueError):
        return "—"


def url_of(r):
    u = r.get("urlproceso")
    return (u.get("url") if isinstance(u, dict) else u) or ""


def telegram(text):
    token, chat = os.getenv("TELEGRAM_TOKEN"), os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print("[sin Telegram configurado]\n" + text)
        return
    data = urllib.parse.urlencode({
        "chat_id": chat, "text": text[:4000], "parse_mode": "HTML",
        "disable_web_page_preview": "true"}).encode()
    urllib.request.urlopen(
        urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=data), timeout=30).read()


def fmt_item(r):
    nombre = html.escape((r.get("nombre_del_procedimiento") or "Sin título")[:140])
    ent = html.escape(r.get("entidad") or "")
    lugar = html.escape(", ".join(x for x in [r.get("ciudad_entidad"), r.get("departamento_entidad")] if x))
    mod = html.escape(r.get("modalidad_de_contratacion") or "")
    cierre = r.get("fecha_de_recepcion_de")
    linea = f"<b>{nombre}</b>\n{ent} — {lugar}\n{mod} | {money(r.get('precio_base'))}"
    if cierre:
        linea += f"\nCierre de ofertas: {cierre[:16].replace('T', ' ')}"
    u = url_of(r)
    if u:
        linea += f"\n<a href=\"{html.escape(u)}\">Abrir en SECOP II</a>"
    return linea


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def load_config():
    raw = os.getenv("WATCHES_JSON")
    if raw:
        return json.loads(raw)
    return load_json(os.path.join(os.path.dirname(STATE_FILE), "watches.json"), {"watches": [], "tracked": []})


def check_watches(cfg, st):
    for w in cfg.get("watches", []):
        name = w["name"]
        try:
            where = build_where(w.get("filters", {}))
            params = {"$order": "fecha_de_publicacion_del DESC", "$limit": "100"}
            if where:
                params["$where"] = where
            rows = api(params)
        except Exception as e:  # noqa: BLE001
            print(f"[error] {name}: {e}")
            continue
        seen = set(st["seen"].get(name, []))
        if name not in st["seen"]:
            telegram(f"Vigilancia activa: <b>{html.escape(name)}</b>\n"
                     f"Hay {len(rows)} procesos actuales; te aviso solo de los que aparezcan desde ahora.")
        else:
            nuevos = [r for r in rows if r.get("id_del_proceso") not in seen]
            for i in range(0, len(nuevos), 5):
                lote = nuevos[i:i + 5]
                cab = f"<b>{len(nuevos)} proceso(s) nuevo(s)</b> en «{html.escape(name)}»\n\n" if i == 0 else ""
                telegram(cab + "\n\n".join(fmt_item(r) for r in lote))
        ids = [r.get("id_del_proceso") for r in rows] + list(st["seen"].get(name, []))
        st["seen"][name] = list(dict.fromkeys(i for i in ids if i))[:600]


def check_tracked(cfg, st):
    items = [t for t in cfg.get("tracked", []) if t.get("id")]
    if not items:
        return
    ids = [t["id"] for t in items]
    mine = {t["id"]: t.get("miEstado", "") for t in items}
    for i in range(0, len(ids), 40):
        chunk = ids[i:i + 40]
        try:
            rows = api({"$where": "id_del_proceso in (" + ",".join(f"'{sq(x)}'" for x in chunk) + ")", "$limit": "100"})
        except Exception as e:  # noqa: BLE001
            print(f"[error] seguimiento: {e}")
            continue
        for r in rows:
            pid = r["id_del_proceso"]
            estado = r.get("estado_del_procedimiento") or ""
            previo = st["estados"].get(pid)
            if previo is not None and previo != estado:
                extra = ""
                if r.get("nombredelproveedoradjudicado"):
                    extra = f"\nAdjudicado a: {html.escape(r['nombredelproveedoradjudicado'])} por {money(r.get('valor_total_adjudicacion'))}"
                telegram(f"<b>Cambió el estado</b>: {html.escape(previo)} → {html.escape(estado)}\n\n{fmt_item(r)}{extra}")
            st["estados"][pid] = estado
            if mine.get(pid) in FINALES:
                continue
            cierre = r.get("fecha_de_recepcion_de")
            if cierre:
                try:
                    horas = (datetime.fromisoformat(cierre[:19]) - now_co()).total_seconds() / 3600
                except ValueError:
                    continue
                clave = pid + cierre
                if 0 < horas < 48 and clave not in st["reminded"]:
                    st["reminded"].append(clave)
                    telegram(f"<b>Cierra en {int(horas)} h</b>\n\n{fmt_item(r)}")
    st["reminded"] = st["reminded"][-300:]


def run_once():
    cfg = load_config()
    st = load_json(STATE_FILE, {})
    st.setdefault("seen", {}); st.setdefault("estados", {}); st.setdefault("reminded", [])
    check_watches(cfg, st)
    check_tracked(cfg, st)
    with open(STATE_FILE, "w", encoding="utf-8") as fh:
        json.dump(st, fh, ensure_ascii=False)
    print(f"[{iso(now_co())}] revisión lista: {len(cfg.get('watches', []))} vigilancias, {len(cfg.get('tracked', []))} seguidos")


if __name__ == "__main__":
    if "--test" in sys.argv:
        telegram("Radar SECOP II conectado. Si lees esto, las alertas funcionan.")
    elif "--loop" in sys.argv:
        mins = int(sys.argv[sys.argv.index("--loop") + 1]) if len(sys.argv) > sys.argv.index("--loop") + 1 else 10
        while True:
            try:
                run_once()
            except Exception as e:  # noqa: BLE001
                print(f"[error] {e}")
            time.sleep(mins * 60)
    else:
        run_once()

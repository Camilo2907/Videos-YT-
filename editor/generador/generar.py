# Genera las composiciones de HyperFrames de Los Nefilim (escenas 16–183) a partir de escenas.py y la voz alineada.
import os, re, json, math, html
from alinear import alinear, norm, OFF
from escenas import S, SECCIONES

BASE = "/home/user/Videos-YT-/trabajo/nefilim"
PROY = f"{BASE}/proyecto"
FIN = 894.25 + 1.6           # fin del video (voz + cola)
E, W = alinear()
EN = {e["n"]: e for e in E}

# ---------- tiempos ----------
def inicio_seccion(nombre, n0):
    if nombre == "intro2": return EN[16]["t"]
    blk = {"cap1": 2, "cap2": 3, "cap3": 4, "cap4": 5, "giro": 6, "cierre": 7}[nombre]
    return OFF[blk]
SEC_T = [(nm, a, b, inicio_seccion(nm, a)) for nm, a, b in SECCIONES]

def t_escena(n):
    e = EN[n]
    if e["t"] is not None: return e["t"]
    return EN[n + 1]["t"]          # títulos sin voz: empiezan con la escena siguiente
def fin_escena(n):
    for nm, a, b, t0 in SEC_T:
        if a <= n <= b and n == b:
            idx = [s[0] for s in SEC_T].index(nm)
            return SEC_T[idx + 1][3] if idx + 1 < len(SEC_T) else FIN
    return t_escena(n + 1)

def palabra_t(word, a, b):
    """Primera palabra de la voz entre a y b que empieza como `word`."""
    w0 = norm(word.split()[0])
    for x in W:
        if a - 0.05 <= x["s"] < b and (x["w"] == w0 or (len(w0) >= 4 and x["w"][:5] == w0[:5]) or (len(w0) < 4 and x["w"] == w0)):
            return x["s"]
    return None

# ---------- imágenes ----------
def tiene(img, suf): return os.path.exists(f"{PROY}/assets/img/{img}{suf}")
def capa3d(img): return tiene(img, "-figura.webp")

# ---------- piezas comunes ----------
CSS = open(f"{BASE}/gen/comun.css").read()
JS = open(f"{BASE}/gen/comun.js").read()
X = html.escape

class Comp:
    def __init__(self, cid, t0, t1):
        self.cid, self.t0, self.t1 = cid, t0, t1
        self.els, self.js, self.sfx = [], [], []
        self.k = 0
    def id(self, p):
        self.k += 1; return f"{self.cid}-{p}{self.k}"
    def L(self, t): return round(t - self.t0, 3)
    def tw(self, s): self.js.append("    " + s)

MOVS = {
    "in":    ("{scale: %(z)s}", "{scale: %(z2)s}"),
    "out":   ("{scale: %(z2)s}", "{scale: %(z)s}"),
    "left":  ("{scale: %(z1)s, xPercent: 3}", "{scale: %(z1)s, xPercent: -3}"),
    "right": ("{scale: %(z1)s, xPercent: -3}", "{scale: %(z1)s, xPercent: 3}"),
    "up":    ("{scale: %(z1)s, yPercent: 3}", "{scale: %(z1)s, yPercent: -3}"),
    "down":  ("{scale: %(z1)s, yPercent: -3}", "{scale: %(z1)s, yPercent: 3}"),
    "fuerte":("{scale: %(z)s}", "{scale: %(z3)s}"),
}
ORDEN = ["in", "left", "out", "right", "up", "in", "down"]

def plano_imagen(c, n, j, img, o, a, b):
    sid = c.id("p"); d = round(b - a, 3); st = c.L(a)
    z = o.get("z", 1.06); zz = dict(z=z, z2=round(z * 1.14, 3), z1=round(z * 1.12, 3), z3=round(z * 1.5, 3))
    mov = o.get("mov") or ORDEN[(n + j) % len(ORDEN)]
    pos = o.get("pos", "50% 50%"); org = o.get("origen", "50% 50%")
    sty = f"object-position: {pos}; transform-origin: {org};"
    inner = []
    if o.get("marco"):
        inner.append(f'<img id="{sid}-bg" class="kb" src="assets/img/{img}-fondo.jpg" style="object-position: 50% 50%;" alt="" />')
        inner.append('<div class="oscuro" style="opacity:0.45"></div>')
        inner.append(f'<div id="{sid}-mc" class="marco"><img src="assets/img/{img}.jpg" alt="{img}" /></div>')
        c.tw(f'tl.fromTo("#{sid}-bg", {{scale: 1.1}}, {{scale: 1.2, duration: {d}, ease: "none"}}, {st});')
        c.tw(f'tl.fromTo("#{sid}-mc", {{scale: 0.94, opacity: 0}}, {{scale: 1.03, opacity: 1, duration: {d}, ease: "none"}}, {st});')
    elif o.get("fondo"):
        inner.append(f'<img id="{sid}-i" class="kb" src="assets/img/{img}-fondo.jpg" style="{sty}" alt="{img}" />')
        inner.append('<div class="oscuro" style="opacity:0.5"></div>')
        a0, a1 = MOVS[mov]; c.tw(f'tl.fromTo("#{sid}-i", {a0 % zz}, {{...{a1 % zz}, duration: {d}, ease: "none"}}, {st});')
    elif capa3d(img) and not o.get("plano"):
        inner.append(f'<img id="{sid}-f" class="kb" src="assets/img/{img}-fondo.jpg" style="{sty}" alt="" />')
        inner.append(f'<img id="{sid}-i" class="kb" src="assets/img/{img}-figura.webp" style="{sty}" alt="{img}" />')
        dx = {"left": -2, "right": 2}.get(mov, 0); dy = {"up": -2, "down": 2}.get(mov, 0)
        if mov == "out":
            c.tw(f'profundidad("#{sid}-f", "#{sid}-i", {st}, {d}, {{s0: {zz["z2"]}, sf: {round(zz["z2"]*0.97,3)}, sg: {z}, dx: {dx}, dy: {dy}}});')
        else:
            c.tw(f'profundidad("#{sid}-f", "#{sid}-i", {st}, {d}, {{s0: {z}, sf: {round(z*1.05,3)}, sg: {round(z*1.18,3)}, dx: {dx}, dy: {dy}}});')
    else:
        inner.append(f'<img id="{sid}-i" class="kb" src="assets/img/{img}.jpg" style="{sty}" alt="{img}" />')
        a0, a1 = MOVS[mov]; c.tw(f'tl.fromTo("#{sid}-i", {a0 % zz}, {{...{a1 % zz}, duration: {d}, ease: "{"power2.in" if mov == "fuerte" else "none"}"}}, {st});')
    fx = o.get("fx")
    if fx == "lluvia":
        inner.append(f'<div id="{sid}-ll" class="lluvia"></div>')
        c.tw(f'tl.fromTo("#{sid}-ll", {{backgroundPosition: "0px 0px"}}, {{backgroundPosition: "-{int(80*d)}px {int(460*d)}px", duration: {d}, ease: "none"}}, {st});')
    elif fx:
        inner.append(f'<canvas id="{sid}-fx" class="fx" width="1920" height="1080"></canvas>')
        c.tw(f'particulas("{sid}-fx", {st}, {d}, "{fx}", 80, {n * 7 + j});')
    if o.get("rayos"):
        inner.append(f'<div id="{sid}-r" class="rayos"></div>')
        c.tw(f'tl.fromTo("#{sid}-r", {{opacity: 0.35, rotation: -3}}, {{opacity: 0.9, rotation: 3, duration: {d}, ease: "none"}}, {st});')
    if o.get("vino"): inner.append('<div class="tinte"></div>')
    if o.get("oscuro"): inner.append('<div class="oscuro" style="opacity:0.55"></div>')
    inner.append('<div class="vig"></div>')
    c.els.append(f'<div id="{sid}" class="clip shot" data-start="{st}" data-duration="{d}" data-layout-allow-overflow data-layout-allow-occlusion>' + "".join(inner) + "</div>")

def plano_video(c, n, clip, o, a, b):
    sid = c.id("v"); d = round(b - a, 3); st = c.L(a)
    extra = ' style="mix-blend-mode: screen;"' if o.get("pantalla") else ""
    c.els.append(f'<video id="{sid}" class="clip vid" src="assets/clips/{clip}.mp4" data-start="{st}" data-duration="{d}" data-media-start="{o.get("ms", 1)}" muted playsinline{extra}></video>')
    if o.get("oscuro"):
        c.els.append(f'<div id="{sid}-o" class="clip capa oscuro" data-start="{st}" data-duration="{d}" style="opacity:0.55"></div>')

def plano_fondo(c, n, kind, o, a, b):
    sid = c.id("f"); d = round(b - a, 3); st = c.L(a)
    cls = {"noche": "fondo-noche", "perg": "fondo-perg", "oscuro": "fondo-oscuro", "mapa": "fondo-noche"}[kind]
    inner = ""
    if kind in ("noche", "mapa"):
        inner = f'<canvas id="{sid}-fx" class="fx" width="1920" height="1080"></canvas>'
        c.tw(f'particulas("{sid}-fx", {st}, {d}, "polvo", 55, {n * 13});')
        c.tw(f'tl.fromTo("#{sid}", {{backgroundPosition: "50% 40%"}}, {{backgroundPosition: "50% 60%", duration: {d}, ease: "none"}}, {st});')
    c.els.append(f'<div id="{sid}" class="clip shot {cls}" data-start="{st}" data-duration="{d}" data-layout-allow-overflow>{inner}</div>')

def repartir(base, a, b):
    """Reparte la escena entre sus planos: un clip al inicio dura poco; el resto se reparte."""
    d = b - a; nb = len(base)
    if nb == 1: return [(a, b)]
    pesos = []
    for k, p in enumerate(base):
        if p[0] == "v" and k == 0: pesos.append(min(3.0, 0.42 * d))
        else: pesos.append(None)
    fijo = sum(x for x in pesos if x); libres = sum(1 for x in pesos if x is None)
    cada = (d - fijo) / max(1, libres); out = []; t = a
    for x in pesos:
        dd = x if x else cada; out.append((t, t + dd)); t += dd
    out[-1] = (out[-1][0], b); return out

# ---------- gráficos (overlays) ----------
def capa(c, cls, a, b, inner, style="", allow=True):
    gid = c.id("g"); st = c.L(a); d = round(b - a, 3)
    al = " data-layout-allow-overflow data-layout-allow-overlap data-layout-allow-occlusion" if allow else ""
    c.els.append(f'<div id="{gid}" class="clip capa {cls}" data-start="{st}" data-duration="{d}"{al} style="{style}">{inner}</div>')
    return gid, st, d

def sube(c, sel, t, d=0.6, y=40): c.tw(f'sube("{sel}", {t}, {d}, {y});')
def sfx(c, kind, t, vol=0.35): c.sfx.append((kind, t, vol))

def g_rotulo(c, o, a, b):
    vino = " vino" if o.get("vino") else ""
    gid, st, d = capa(c, "", a, b, f'<div class="rotulo-caja{vino}"><span></span>{X(o["txt"])}</div>')
    c.tw(f'tl.fromTo("#{gid} .rotulo-caja", {{opacity: 0, x: -40}}, {{opacity: 1, x: 0, duration: 0.5, ease: "power3.out"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .rotulo-caja span", {{scaleY: 0}}, {{scaleY: 1, duration: 0.4, ease: "power2.out"}}, {st + 0.1});')

def g_grande(c, o, a, b):
    sub = f'<div class="g-sub">{X(o["sub"])}</div>' if o.get("sub") else ""
    cls = "g-grande" + (" chico" if o.get("chico") else "") + (" abajo" if o.get("abajo") else "")
    gid, st, d = capa(c, "centro", a, b, f'<div class="{cls}">{X(o["txt"])}</div>{sub}')
    c.tw(f'tl.fromTo("#{gid} .g-grande", {{opacity: 0, scale: 1.12}}, {{opacity: 1, scale: 1, duration: 0.9, ease: "power3.out"}}, {st});')
    if sub: sube(c, f"#{gid} .g-sub", st + 0.6, 0.6, 20)

def g_titulo(c, o, a, b):
    num, txt, sello = o["titulo"]
    inner = (f'<div class="t-num">{num}</div><div class="t-txt">{X(txt)}</div><div class="t-linea"></div>'
             f'<div class="t-sello">{X(sello)}</div><canvas class="fx t-fx" width="1920" height="1080"></canvas><div class="rayos t-ray"></div>')
    gid, st, d = capa(c, "fondo-noche", a, b, inner)
    c.tw(f'tl.fromTo("#{gid} .t-num", {{opacity: 0, y: -30}}, {{opacity: 1, y: 0, duration: 0.6, ease: "power3.out"}}, {st + 0.1});')
    c.tw(f'tl.fromTo("#{gid} .t-txt", {{opacity: 0, scale: 1.15}}, {{opacity: 1, scale: 1, duration: 0.9, ease: "power3.out"}}, {st + 0.3});')
    c.tw(f'tl.fromTo("#{gid} .t-linea", {{scaleX: 0}}, {{scaleX: 1, duration: 0.8, ease: "power2.inOut"}}, {st + 0.7});')
    c.tw(f'tl.fromTo("#{gid} .t-sello", {{opacity: 0, scale: 1.8, rotation: -14}}, {{opacity: 1, scale: 1, rotation: -6, duration: 0.35, ease: "power4.out"}}, {st + 1.2});')
    c.tw(f'tl.fromTo("#{gid} .t-ray", {{opacity: 0}}, {{opacity: 0.8, duration: {d}, ease: "none"}}, {st});')
    c.tw(f'tl.to("#{gid}", {{opacity: 0, duration: 0.3}}, {round(st + d - 0.3, 3)});')
    c.tw(f'particulas_el(document.querySelector("#{gid} .t-fx"), {st}, {d}, "chispas", 50, {len(c.els)});')
    sfx(c, "whoosh-cinematic", a - 0.2, 0.3); sfx(c, "impact-bass-2", a + 1.2, 0.3)

def g_cita(c, o, a, b):
    txt = o["txt"]; words = txt.split(); oro = {norm(x) for x in o.get("oro", [])}
    size = 64 if len(txt) < 90 else (54 if len(txt) < 170 else 46)
    spans = "".join(f'<span class="w{" oro" if norm(w) in oro else ""}">{X(w)}</span> ' for w in words)
    inner = f'<div class="cita" style="font-size:{size}px"><div class="cita-txt">«{spans}»</div><div class="cita-ref">{X(o["ref"])}</div></div>'
    gid, st, d = capa(c, "centro", a, b, inner)
    c.tw(f'tl.fromTo("#{gid} .cita", {{opacity: 0, y: 40, scale: 0.97}}, {{opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out"}}, {st});')
    # palabras al ritmo real de la voz
    ws = [x for x in W if a - 0.2 <= x["s"] < b]; p = 0; times = []
    for w in words:
        nw = norm(w); hit = None
        for q in range(p, min(len(ws), p + 6)):
            if ws[q]["w"] == nw or (len(nw) >= 4 and ws[q]["w"][:4] == nw[:4]): hit = q; break
        if hit is not None: times.append(ws[hit]["s"]); p = hit + 1
        else: times.append(None)
    last = a + 0.3
    for k, tm in enumerate(times):
        if tm is None: tm = last + 0.25
        tm = max(tm, a + 0.2); last = tm
        c.tw(f'tl.fromTo("#{gid} .w:nth-child({k + 1})", {{opacity: 0.12}}, {{opacity: 1, duration: 0.25}}, {c.L(tm)});')
    sube(c, f"#{gid} .cita-ref", c.L(last) + 0.3, 0.5, 15)

def g_palabra(c, o, a, b):
    heb = f'<div class="p-heb">{X(o["heb"])}</div>' if o.get("heb") else ""
    inner = f'<div class="p-caja{" panel" if o.get("sobre") else ""}">{heb}<div class="p-tr">{X(o["tr"])}</div><div class="p-sig">{X(o["sig"])}</div></div>'
    gid, st, d = capa(c, "centro", a, b, inner)
    if heb: c.tw(f'tl.fromTo("#{gid} .p-heb", {{opacity: 0, scale: 1.3}}, {{opacity: 1, scale: 1, duration: 0.8, ease: "power3.out"}}, {st});')
    sube(c, f"#{gid} .p-tr", st + (0.5 if heb else 0), 0.6, 30)
    sube(c, f"#{gid} .p-sig", st + (1.2 if heb else 0.6), 0.6, 20)

def g_sello(c, o, a, b):
    gid, st, d = capa(c, "centro", a, b, f'<div class="sello">{X(o["txt"])}</div>')
    c.tw(f'tl.fromTo("#{gid} .sello", {{opacity: 0, scale: 2.4, rotation: -20}}, {{opacity: 1, scale: 1, rotation: -7, duration: 0.32, ease: "power4.in"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .sello", {{x: 0}}, {{x: 6, duration: 0.04, repeat: 5, yoyo: true, ease: "none"}}, {st + 0.32});')
    sfx(c, "impact-bass-1", a + 0.28, 0.4)

def g_contador(c, o, a, b):
    pts = '<canvas class="fx c-pts" width="1920" height="1080"></canvas>' if o.get("puntos") else ""
    gid, st, d = capa(c, "centro", a, b, f'{pts}<div class="c-num">0</div><div class="c-suf">{X(o.get("suf", ""))}</div>')
    n = o["n"]
    c.tw(f'contador("#{gid} .c-num", {st}, {min(1.6, d - 0.4)}, {n});')
    sube(c, f"#{gid} .c-suf", st + 0.4, 0.6, 20)
    if pts: c.tw(f'puntosLuz(document.querySelector("#{gid} .c-pts"), {st}, {d}, {n});')

def g_lista(c, o, a, b):
    its = "".join(f'<div class="l-item"><span>{X(t)}</span><i></i></div>' for t, _ in o["items"])
    gid, st, d = capa(c, "", a, b, f'<div class="l-tit">{X(o["titulo"])}</div><div class="l-lista">{its}</div>')
    sube(c, f"#{gid} .l-tit", st, 0.6, 20)
    for k, (t, w) in enumerate(o["items"]):
        tm = palabra_t(w, a, b) or (a + 1 + k * 2)
        sube(c, f"#{gid} .l-item:nth-child({k + 1})", c.L(tm) - 0.2, 0.5, 20)
        if o.get("tachar"): c.tw(f'tl.fromTo("#{gid} .l-item:nth-child({k + 1}) i", {{scaleX: 0}}, {{scaleX: 1, duration: 0.45, ease: "power2.inOut"}}, {c.L(tm) + 0.5});')

def g_fila(c, o, a, b):
    its = "".join(f'<div class="f-item">{X(t)}</div>' for t in o["items"])
    gid, st, d = capa(c, "centro", a, b, f'<div class="fila">{its}</div>')
    pal = o.get("palabras") or []
    for k in range(len(o["items"])):
        tm = palabra_t(pal[k], a, b) if k < len(pal) else None
        t = c.L(tm) - 0.1 if tm else st + 0.3 + k * min(0.9, (d - 1) / max(1, len(o["items"])))
        c.tw(f'tl.fromTo("#{gid} .f-item:nth-child({k + 1})", {{opacity: 0, y: 30, scale: 0.9}}, {{opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)"}}, {round(t, 3)});')

def g_flecha(c, o, a, b):
    parts = []
    for k, t in enumerate(o["items"]):
        if k: parts.append('<div class="fl-flecha">→</div>')
        parts.append(f'<div class="fl-item">{X(t)}</div>')
    gid, st, d = capa(c, "centro", a, b, f'<div class="flecha">{"".join(parts)}</div>')
    n = len(parts); paso = min(1.1, (d - 0.8) / n)
    c.tw(f'tl.fromTo("#{gid} .flecha > div", {{opacity: 0, x: -30}}, {{opacity: 1, x: 0, duration: 0.45, stagger: {round(paso, 2)}, ease: "power3.out"}}, {st});')

def g_libro(c, o, a, b):
    ico = '<svg viewBox="0 0 100 100"><path d="M50 22 C38 14 22 14 10 18 V80 C22 76 38 76 50 84 C62 76 78 76 90 80 V18 C78 14 62 14 50 22 Z M50 22 V84" fill="none" stroke="#0f1b2d" stroke-width="5" stroke-linejoin="round"/></svg>'
    gid, st, d = capa(c, "", a, b, f'<div class="libro">{ico}<div><div class="lb-n">{X(o["nombre"])}</div><div class="lb-f">{X(o["fecha"])}</div></div></div>')
    c.tw(f'tl.fromTo("#{gid} .libro", {{opacity: 0, y: 80, rotation: -3}}, {{opacity: 1, y: 0, rotation: 0, duration: 0.6, ease: "back.out(1.4)"}}, {st});')

def g_ficha(c, o, a, b):
    foto = "" if o.get("soloTexto") or not o.get("img") else f'<div class="fi-marco"><img src="assets/img/{o["img"]}.jpg" alt="{o["nombre"]}" /></div>'
    gid, st, d = capa(c, "", a, b, f'{foto}<div class="fi-txt{" solo" if not foto else ""}"><div class="fi-n">{X(o["nombre"])}</div><div class="fi-s">{X(o["siglo"])}</div></div>')
    if foto:
        c.tw(f'tl.fromTo("#{gid} .fi-marco", {{opacity: 0, x: -80}}, {{opacity: 1, x: 0, duration: 0.7, ease: "power3.out"}}, {st});')
        c.tw(f'tl.fromTo("#{gid} .fi-marco img", {{scale: 1.05}}, {{scale: 1.16, duration: {d}, ease: "none"}}, {st});')
    sube(c, f"#{gid} .fi-n", st + 0.4, 0.6, 30); sube(c, f"#{gid} .fi-s", st + 0.8, 0.6, 20)

def g_gancho(c, o, a, b):
    heb = f'<div class="gh-heb">{X(o["heb"])}</div>' if o.get("heb") else ""
    gid, st, d = capa(c, "centro", a, b, f'<div class="gh-osc"></div>{heb}<div class="gh-txt">{X(o["txt"])}</div>')
    c.tw(f'tl.fromTo("#{gid} .gh-osc", {{opacity: 0}}, {{opacity: {0.45 if o.get("suave") else 0.7}, duration: 0.6}}, {st});')
    if heb: c.tw(f'tl.fromTo("#{gid} .gh-heb", {{opacity: 0, scale: 0.8}}, {{opacity: 1, scale: 1, duration: 1.2, ease: "power2.out"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .gh-txt", {{opacity: 0, scale: 1.2}}, {{opacity: 1, scale: 1, duration: 0.7, ease: "power3.out"}}, {st + (0.8 if heb else 0.2)});')
    sfx(c, "impact-bass-2", a + 0.15, 0.35)

def g_tarjetas3(c, o, a, b):
    icos = ['<path d="M50 22 C38 14 22 14 10 18 V80 C22 76 38 76 50 84 C62 76 78 76 90 80 V18 C78 14 62 14 50 22 Z M50 22 V84" fill="none" stroke="#0f1b2d" stroke-width="5"/>',
            '<path d="M24 16 H78 C84 16 88 20 88 26 C88 32 84 36 78 36 H72 V78 C72 84 68 88 62 88 H20 C14 88 10 84 10 78 C10 72 14 68 20 68 H26 V26 Z M36 34 H62 M36 46 H62 M36 58 H56" fill="none" stroke="#0f1b2d" stroke-width="5" stroke-linecap="round"/>',
            '<circle cx="42" cy="42" r="24" fill="none" stroke="#0f1b2d" stroke-width="6"/><path d="M60 60 L86 86" stroke="#0f1b2d" stroke-width="9" stroke-linecap="round"/>']
    nombres = ["TEXTO", "TRADICIÓN", "ESTUDIOS"]
    cards = "".join(f'<div class="t3"><svg viewBox="0 0 100 100">{icos[k]}</svg><h3>{nombres[k]}</h3></div>' for k in range(3))
    gid, st, d = capa(c, "centro", a, b, f'<div class="t3-fila">{cards}</div>')
    if o.get("aparece"):
        for k, w in enumerate(o["aparece"]):
            tm = palabra_t(w, a, b) or (a + 0.5 + k * 3)
            c.tw(f'tl.fromTo("#{gid} .t3:nth-child({k + 1})", {{opacity: 0.12, scale: 0.9}}, {{opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)"}}, {c.L(tm) - 0.1});')
    else:
        act = o.get("activa", -1)
        c.tw(f'tl.fromTo("#{gid} .t3", {{opacity: 0, y: 80}}, {{opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power3.out"}}, {st});')
        if act >= 0:
            c.tw(f'tl.to("#{gid} .t3:not(:nth-child({act + 1}))", {{opacity: 0.3, scale: 0.92, duration: 0.5}}, {st + 0.8});')
            c.tw(f'tl.to("#{gid} .t3:nth-child({act + 1})", {{scale: 1.12, boxShadow: "0 0 80px rgba(201,162,39,0.8), inset 0 0 0 8px #c9a227", duration: 0.5}}, {st + 0.8});')

def g_balanza(c, o, a, b):
    cards = "".join(f'<div class="bz-c">{t}</div>' for t in ["TEXTO", "TRADICIÓN", "ESTUDIOS"])
    gid, st, d = capa(c, "centro", a, b, f'<div class="bz"><div class="bz-brazo">{cards}</div><div class="bz-pie"></div></div><div class="g-sub abajo2">no todo tiene el mismo peso</div>')
    c.tw(f'tl.fromTo("#{gid} .bz", {{opacity: 0, y: 40}}, {{opacity: 1, y: 0, duration: 0.6}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .bz-brazo", {{rotation: 0}}, {{rotation: -7, duration: 1.6, ease: "elastic.out(1, 0.5)"}}, {st + 1.4});')
    t2 = palabra_t("peso", a, b) or a + 3; sube(c, f"#{gid} .g-sub", c.L(t2) - 0.6, 0.6, 20)

def g_tarjeta4(c, o, a, b):
    lines = "".join(f'<div class="t4-l"><b>6:{k}</b><i style="width:{w}%"></i></div>' for k, w in zip(range(1, 5), [88, 72, 80, 94]))
    gid, st, d = capa(c, "centro", a, b, f'<div class="t4"><div class="t4-t">Génesis 6 : 1–4</div>{lines}</div>')
    c.tw(f'tl.fromTo("#{gid} .t4", {{opacity: 0, rotationY: 80, scale: 0.8}}, {{opacity: 1, rotationY: 0, scale: 1, duration: 0.9, ease: "power3.out"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .t4-l", {{opacity: 0, x: -20}}, {{opacity: 1, x: 0, duration: 0.3, stagger: 0.25}}, {st + 0.7});')

def g_ventanas(c, o, a, b):
    vs = "".join(f'<div class="vn" style="left:{180 + (k % 4) * 390 + (k // 4) * 40}px; top:{140 + (k // 4) * 250 + (k % 2) * 30}px"><i></i><b></b><b style="width:60%"></b><b style="width:75%"></b></div>' for k in range(12))
    gid, st, d = capa(c, "", a, b, f'<div class="vn-cont">{vs}</div>')
    c.tw(f'tl.fromTo("#{gid} .vn", {{opacity: 0, y: 60, scale: 0.8}}, {{opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.18, ease: "back.out(1.5)"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .vn-cont", {{scale: 1.15}}, {{scale: 0.88, duration: {d}, ease: "none"}}, {st});')

def g_interroga(c, o, a, b):
    gid, st, d = capa(c, "centro", a, b, '<div class="interroga">?</div>')
    c.tw(f'tl.fromTo("#{gid} .interroga", {{opacity: 0, scale: 0.4}}, {{opacity: 0.9, scale: 1, duration: 0.6, ease: "back.out(1.7)"}}, {st});')

def g_silueta(c, o, a, b):
    path = "M300 30 C262 30 240 62 240 110 C240 150 255 178 270 196 C262 214 250 222 200 236 C140 254 110 300 96 380 C82 470 92 560 120 650 C140 720 160 820 175 960 L425 960 C440 820 460 720 480 650 C508 560 518 470 504 380 C490 300 460 254 400 236 C350 222 338 214 330 196 C345 178 360 150 360 110 C360 62 338 30 300 30 Z"
    svg = (f'<svg class="sil" viewBox="0 0 600 960"><defs><filter id="{c.cid}b{c.k}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter>'
           f'<linearGradient id="{c.cid}l{c.k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2e8d5" stop-opacity="0.95"/><stop offset="0.6" stop-color="#c9a227" stop-opacity="0.55"/><stop offset="1" stop-color="#c9a227" stop-opacity="0"/></linearGradient></defs>'
           f'<path d="{path}" fill="url(#{c.cid}l{c.k})" filter="url(#{c.cid}b{c.k})"/><path d="{path}" fill="url(#{c.cid}l{c.k})" opacity="0.18"/></svg>')
    nom = f'<div class="sil-n">{X(o["nombre"])}</div>' if o.get("nombre") else ""
    gid, st, d = capa(c, "", a, b, f'<div class="niebla n1"></div>{svg}<div class="niebla n2"></div><canvas class="fx s-fx" width="1920" height="1080"></canvas>{nom}')
    if o.get("crece"):
        c.tw(f'tl.fromTo("#{gid} .sil", {{opacity: 0, scale: 0.55, y: 200}}, {{opacity: 1, scale: 1.15, y: 0, duration: {d}, ease: "power2.out"}}, {st});')
    else:
        c.tw(f'tl.fromTo("#{gid} .sil", {{opacity: 0, scale: 0.9}}, {{opacity: 1, scale: 1, duration: 1.4, ease: "power2.out"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .n1", {{x: -120}}, {{x: 160, duration: {d}, ease: "none"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .n2", {{x: 140}}, {{x: -180, duration: {d}, ease: "none"}}, {st});')
    c.tw(f'particulas_el(document.querySelector("#{gid} .s-fx"), {st}, {d}, "chispas", 70, {c.k});')
    if nom: sube(c, f"#{gid} .sil-n", st + 0.6, 0.7, 30)

def g_luces(c, o, a, b):
    col = "rgba(232,200,90,1)" if o.get("color") == "oro" else "rgba(200,60,80,1)"
    gid, st, d = capa(c, "", a, b, '<div class="horizonte"></div><canvas class="fx lu-fx" width="1920" height="1080"></canvas>')
    c.tw(f'particulas_el(document.querySelector("#{gid} .lu-fx"), {st}, {d}, "luces", 60, {c.k}, "{col}");')
    c.tw(f'tl.fromTo("#{gid} .horizonte", {{opacity: 0}}, {{opacity: 1, duration: 1}}, {st});')

def g_mapa(c, o, a, b):
    from mapa_vistas import VISTAS, proy, transf
    vista, desde = VISTAS[o["vista"]], VISTAS[o.get("desde", o["vista"])]
    s1, x1, y1 = transf(vista); s0, x0, y0 = transf(desde)
    el = []
    for k, (nm, lon, lat) in enumerate(o.get("puntos", [])):
        px, py = proy(lon, lat); fs = round(40 / s1, 2)
        el.append(f'<div class="m-pt" style="left:{px:.1f}px; top:{py:.1f}px; --s:{1 / s1:.4f}"><i></i><b></b><span style="font-size:{fs}px">{X(nm)}</span></div>')
    for k, (nm, lon, lat) in enumerate(o.get("zonas", [])):
        px, py = proy(lon, lat)
        el.append(f'<div class="m-zona" style="left:{px:.1f}px; top:{py:.1f}px; --s:{1 / s1:.4f}"><i></i><span style="font-size:{round(34 / s1, 2)}px">{X(nm)}</span></div>')
    for k, (nm, lon, lat) in enumerate(o.get("etiquetas", [])):
        px, py = proy(lon, lat)
        el.append(f'<div class="m-et" style="left:{px:.1f}px; top:{py:.1f}px; font-size:{round(30 / s1, 2)}px">{X(nm)}</div>')
    ruta = ""
    if o.get("ruta"):
        pts = [proy(lo, la) for lo, la in o["ruta"]]
        dpath = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        ruta = f'<svg class="m-ruta" viewBox="0 0 3257 3800" width="3257" height="3800"><path d="{dpath}" stroke-width="{round(6 / s1, 2)}" stroke-dasharray="{round(18 / s1, 1)} {round(12 / s1, 1)}"/></svg>'
    inner = f'<div class="m-cont"><img src="assets/mapa.svg" class="m-img" alt="mapa" />{ruta}{"".join(el)}</div><div class="vig"></div>'
    gid, st, d = capa(c, "mapa-fondo", a, b, inner)
    c.tw(f'tl.fromTo("#{gid} .m-cont", {{scale: {s0}, x: {x0}, y: {y0}}}, {{scale: {s1}, x: {x1}, y: {y1}, duration: {min(2.2, d * 0.6):.2f}, ease: "power2.inOut"}}, {st});')
    t_pt = st + min(1.6, d * 0.45)
    c.tw(f'tl.fromTo("#{gid} .m-pt, #{gid} .m-zona, #{gid} .m-et", {{opacity: 0, scale: 0.4}}, {{opacity: 1, scale: 1, duration: 0.45, stagger: 0.3, ease: "back.out(2)"}}, {t_pt});')
    c.tw(f'tl.fromTo("#{gid} .m-pt b", {{scale: 1, opacity: 0.8}}, {{scale: 3.2, opacity: 0, duration: 1.2, repeat: {max(0, int(d / 1.2))}, ease: "power1.out"}}, {t_pt});')
    if ruta: c.tw(f'tl.fromTo("#{gid} .m-ruta path", {{strokeDashoffset: 400}}, {{strokeDashoffset: 0, duration: {d * 0.6:.2f}, ease: "none"}}, {t_pt});')

def g_tiempo(c, o, a, b):
    hs = o["hitos"]; n = len(hs); x0, x1 = 220, 1700
    nodes = "".join(f'<div class="ti-h" style="left:{x0 + (x1 - x0) * k / max(1, n - 1):.0f}px"><i></i><b>{X(h)}</b><span>{X(f)}</span></div>' for k, (h, f) in enumerate(hs))
    gid, st, d = capa(c, "", a, b, f'<div class="ti-linea"></div>{nodes}')
    c.tw(f'tl.fromTo("#{gid} .ti-linea", {{scaleX: 0}}, {{scaleX: 1, duration: {min(2.5, d * 0.6):.2f}, ease: "power2.inOut"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .ti-h", {{opacity: 0, y: 20}}, {{opacity: 1, y: 0, duration: 0.4, stagger: {min(2.5, d * 0.6) / n:.2f}, ease: "back.out(1.8)"}}, {st + 0.2});')

def g_escala(c, o, a, b):
    its = o["items"]; hmax = max(h for _, h, _ in its); hmin = min(h for _, h, _ in its)
    ppm = 700 / hmax; zoom = hmin * ppm < 80
    base_y, x = 960, 520; figs = []; labels = []
    person = "M50 0 C40 0 34 8 34 18 C34 28 40 36 50 36 C60 36 66 28 66 18 C66 8 60 0 50 0 Z M30 42 C38 39 62 39 70 42 C82 46 88 60 90 100 L92 160 L80 162 L76 110 L72 110 L74 300 L56 300 L52 180 L48 180 L44 300 L26 300 L28 110 L24 110 L20 162 L8 160 L10 100 C12 60 18 46 30 42 Z"
    for k, (lab, h, kind) in enumerate(its):
        H = h * ppm
        if kind == "cama":
            Wd = H; Hh = max(4, 0.9 * ppm)
            figs.append(f'<div class="es-f es-cama" style="left:{x}px; top:{base_y - Hh}px; width:{Wd}px; height:{Hh}px"></div>'); xc = x + Wd / 2; x += Wd + 160
        else:
            Wd = H * 0.33; col = "#f2e8d5" if kind == "persona" else "#c9a227"
            figs.append(f'<svg class="es-f" style="left:{x}px; top:{base_y - H}px; width:{Wd}px; height:{H}px" viewBox="0 0 100 300" preserveAspectRatio="none"><path d="{person}" fill="{col}"/></svg>'); xc = x + Wd / 2; x += max(Wd, 20) + 160
        labels.append(f'<div class="es-lab" style="--k:{k}">{X(lab)}</div>')
    nota = f'<div class="es-nota">{X(o["nota"])}</div>' if o.get("nota") else ""
    regla = f'<div class="es-regla" style="left:{x - 60}px; top:{base_y - 700}px; height:700px"></div>'
    inner = f'<div class="es-suelo"></div><div class="es-cont">{"".join(figs)}{regla}</div><div class="es-labs">{"".join(labels)}</div>{nota}'
    gid, st, d = capa(c, "", a, b, inner)
    if zoom:
        z0 = 380 / (hmin * ppm); ox = 520 + 20
        c.tw(f'gsap.set("#{gid} .es-cont", {{transformOrigin: "{ox}px {base_y}px"}});')
        c.tw(f'tl.fromTo("#{gid} .es-cont", {{scale: {z0:.2f}}}, {{scale: 1, duration: {min(d - 0.6, 3.2):.2f}, ease: "power2.inOut"}}, {st + 0.5});')
    c.tw(f'tl.fromTo("#{gid} .es-f", {{opacity: 0, scaleY: 0, transformOrigin: "50% 100%"}}, {{opacity: 1, scaleY: 1, duration: 0.6, stagger: 0.5, ease: "power3.out"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .es-lab", {{opacity: 0, x: -20}}, {{opacity: 1, x: 0, duration: 0.4, stagger: {max(0.5, (d - 1) / len(its)):.2f}}}, {st + 0.3});')
    if nota: sube(c, f"#{gid} .es-nota", st + d * 0.5, 0.5, 15)

def g_columnas(c, o, a, b):
    cols = o["cols"]; textos = o.get("textos") or [""] * len(cols)
    cs = "".join(f'<div class="co {col}"><h4>{"?" if o.get("ocultas") else X(t)}</h4><p>{X(tx)}</p></div>' for (t, col), tx in zip(cols, textos))
    pie = f'<div class="co-pie">{X(o["pie"])}</div>' if o.get("pie") else ""
    gid, st, d = capa(c, "", a, b, f'<div class="co-fila{" baja" if o.get("arriba") else ""}" style="--n:{len(cols)}">{cs}</div>{pie}')
    c.tw(f'tl.fromTo("#{gid} .co", {{opacity: 0, scaleY: 0, transformOrigin: "50% 100%"}}, {{opacity: 1, scaleY: 1, duration: 0.5, stagger: 0.2, ease: "power3.out"}}, {st});')
    act = o.get("activa")
    if act is not None and act >= 0:
        c.tw(f'tl.to("#{gid} .co:not(:nth-child({act + 1}))", {{opacity: 0.28, duration: 0.5}}, {st + 0.8});')
        c.tw(f'tl.to("#{gid} .co:nth-child({act + 1})", {{scale: 1.06, duration: 0.5}}, {st + 0.8});')
    if pie: sube(c, f"#{gid} .co-pie", st + 1.2, 0.6, 20)

def g_arbol(c, o, a, b):
    niv = o["niveles"]; filas = []
    for li, nivel in enumerate(niv):
        nodes = "".join(f'<div class="ar-n{" oro" if (o.get("oro") is not None and (k == o["oro"] or len(nivel) == 1)) else ""}{" vacio" if not t else ""}">{X(t)}</div>' for k, t in enumerate(nivel))
        filas.append(f'<div class="ar-f">{nodes}</div>')
    nota = f'<div class="ar-nota">{X(o["nota"])}</div>' if o.get("nota") else ""
    gid, st, d = capa(c, "", a, b, f'<div class="arbol">{"".join(filas)}</div>{nota}')
    paso = min(1.0, (d - 0.5) / len(niv))
    c.tw(f'tl.fromTo("#{gid} .ar-f", {{opacity: 0, y: -20}}, {{opacity: 1, y: 0, duration: 0.45, stagger: {paso:.2f}, ease: "power3.out"}}, {st});')
    if nota: sube(c, f"#{gid} .ar-nota", st + paso * len(niv), 0.6, 20)

def g_tira(c, o, a, b):
    bb = a + (b - a) * o.get("solo", 1.0)
    gid, st, d = capa(c, "", a, bb, f'<div class="tira"><img src="assets/img/{o["img"]}.jpg" alt="rollo" /></div>')
    c.tw(f'tl.fromTo("#{gid} .tira img", {{x: 0}}, {{x: -1400, duration: {d}, ease: "none"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .tira", {{opacity: 0}}, {{opacity: 1, duration: 0.5}}, {st});')

def g_expande(c, o, a, b, inverso=False):
    pg = "".join(f'<div class="pg" style="--k:{k}"><i></i><i></i><i></i><i></i></div>' for k in range(9))
    gid, st, d = capa(c, "centro", a, b, f'<div class="pg-cont">{pg}</div>')
    for k in range(9):
        dx, dy = ((k % 3) - 1) * 420, ((k // 3) - 1) * 300; r = ((k * 37) % 13) - 6
        A, B = ("{x: 0, y: 0, rotation: 0, scale: 0.9}", f"{{x: {dx}, y: {dy}, rotation: {r}, scale: 0.8}}")
        if inverso: A, B = B, A
        c.tw(f'tl.fromTo("#{gid} .pg:nth-child({k + 1})", {A}, {{...{B}, duration: 1.4, ease: "power3.inOut"}}, {st + 0.8 + k * 0.05});')

def g_candado(c, o, a, b):
    svg = '<svg class="cd" viewBox="0 0 200 260"><path class="cd-arco" d="M50 120 V70 C50 30 150 30 150 70 V120" fill="none" stroke="#c9a227" stroke-width="18" stroke-linecap="round"/><rect x="30" y="115" width="140" height="120" rx="16" fill="#c9a227"/><circle cx="100" cy="165" r="14" fill="#0f1b2d"/><rect x="94" y="170" width="12" height="34" rx="5" fill="#0f1b2d"/></svg>'
    gid, st, d = capa(c, "centro", a, b, f'{svg}<div class="g-sub abajo2">secretos prohibidos</div>')
    c.tw(f'tl.fromTo("#{gid} .cd", {{opacity: 0, scale: 0.8}}, {{opacity: 1, scale: 1, duration: 0.5}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .cd-arco", {{y: 0, rotation: 0}}, {{y: -40, rotation: -25, transformOrigin: "150px 120px", duration: 0.5, ease: "back.out(2)"}}, {st + 1.0});')
    sube(c, f"#{gid} .g-sub", st + 1.2, 0.5, 20)

def g_huecos(c, o, a, b):
    hs = "".join(f'<i style="left:{x}px; top:{y}px; width:{w}px"></i>' for x, y, w in [(420, 300, 260), (1100, 380, 320), (700, 560, 240), (1250, 640, 280), (480, 760, 300), (980, 820, 220)])
    gid, st, d = capa(c, "", a, b, f'<div class="huecos">{hs}</div>')
    c.tw(f'tl.fromTo("#{gid} .huecos i", {{opacity: 0}}, {{opacity: 1, duration: 0.3, stagger: 0.12}}, {st});')
    tm = palabra_t("llenarlos", a, b) or (a + d * 0.6)
    c.tw(f'tl.to("#{gid} .huecos i", {{backgroundColor: "#f2d27a", boxShadow: "0 0 40px rgba(242,210,122,0.9)", duration: 0.5, stagger: 0.1}}, {c.L(tm) - 0.2});')

def g_cuatro(c, o, a, b):
    qs = "".join(f'<b style="left:{(k * 397) % 1600 + 120}px; top:{(k * 263) % 760 + 120}px">?</b>' for k in range(18))
    gid, st, d = capa(c, "centro", a, b, f'<div class="cu-4">4</div><div class="cu-q">{qs}</div><div class="cu-p">·</div>')
    t1 = palabra_t("preguntas", a, b) or a + 1.2; t2 = palabra_t("ninguna", a, b) or a + 2.2
    c.tw(f'tl.fromTo("#{gid} .cu-4", {{opacity: 0, scale: 1.4}}, {{opacity: 1, scale: 1, duration: 0.5}}, {st});')
    c.tw(f'tl.to("#{gid} .cu-4", {{opacity: 0, duration: 0.3}}, {c.L(t1) - 0.2});')
    c.tw(f'tl.fromTo("#{gid} .cu-q b", {{opacity: 0, scale: 0}}, {{opacity: 1, scale: 1, duration: 0.3, stagger: 0.03, ease: "back.out(2)"}}, {c.L(t1) - 0.1});')
    c.tw(f'tl.to("#{gid} .cu-q b", {{opacity: 0, scale: 0.2, x: 0, duration: 0.4}}, {c.L(t2)});')
    c.tw(f'tl.fromTo("#{gid} .cu-p", {{opacity: 0}}, {{opacity: 1, duration: 0.4}}, {c.L(t2) + 0.3});')

def g_pulso(c, o, a, b):
    gid, st, d = capa(c, "centro", a, b, '<div class="pulso"></div>')
    c.tw(f'tl.fromTo("#{gid} .pulso", {{scale: 0.3, opacity: 0.9}}, {{scale: 2.2, opacity: 0, duration: 1.3, repeat: {max(0, int(d / 1.3))}, ease: "power2.out"}}, {st});')
    sfx(c, "impact-bass-1", a + 0.1, 0.3)

def g_cruce(c, o, a, b):
    svg = ('<svg class="cruce" viewBox="0 0 1920 1080"><path class="cr1" d="M260 900 C700 880 900 250 1660 180" stroke="#c9a227"/><path class="cr2" d="M260 180 C700 200 900 880 1660 900" stroke="#c23a4d"/></svg>'
           '<div class="cr-l l1">Set</div><div class="cr-l l2">Caín</div>')
    gid, st, d = capa(c, "", a, b, svg)
    c.tw(f'tl.fromTo("#{gid} .cruce path", {{strokeDashoffset: 2000}}, {{strokeDashoffset: 0, duration: {min(2.5, d - 0.5):.2f}, ease: "power2.inOut"}}, {st});')
    c.tw(f'tl.fromTo("#{gid} .cr-l", {{opacity: 0}}, {{opacity: 1, duration: 0.5, stagger: 0.3}}, {st + 0.3});')

def g_espias(c, o, a, b):
    dots = "".join(f'<i class="{"oro" if k in (5, 6) else "vino"}" style="top:{380 + k * 30}px"></i>' for k in range(12))
    gid, st, d = capa(c, "", a, b, f'<div class="esp">{dots}</div><div class="g-sub abajo2">10 vuelven con miedo · 2 confían</div>')
    c.tw(f'tl.fromTo("#{gid} .esp i", {{x: 0, opacity: 0}}, {{x: 900, opacity: 1, duration: 1.2, stagger: 0.04, ease: "power2.inOut"}}, {st});')
    c.tw(f'tl.to("#{gid} .esp i.vino", {{x: 80, duration: 1.0, stagger: 0.04, ease: "power2.inOut"}}, {st + 1.4});')
    sube(c, f"#{gid} .g-sub", st + 1.6, 0.5, 20)

def g_lupa(c, o, a, b):
    gid, st, d = capa(c, "centro", a, b, '<div class="t4 chica"><div class="t4-l"><i style="width:90%"></i></div><div class="t4-l"><i style="width:70%"></i></div><div class="t4-l"><i style="width:84%"></i></div></div><svg class="lupa" viewBox="0 0 100 100"><circle cx="42" cy="42" r="26" fill="rgba(242,232,213,0.15)" stroke="#c9a227" stroke-width="7"/><path d="M62 62 L90 90" stroke="#c9a227" stroke-width="10" stroke-linecap="round"/></svg><div class="g-sub abajo2">mira el contexto</div>')
    c.tw(f'tl.fromTo("#{gid} .lupa", {{x: -300, y: -60}}, {{x: 260, y: 40, duration: {d:.2f}, ease: "sine.inOut"}}, {st});')
    sube(c, f"#{gid} .g-sub", st + 0.3, 0.5, 20)

def g_esqueleto(c, o, a, b):
    svg = ('<svg class="esq" viewBox="0 0 200 420" fill="none" stroke="#f2e8d5" stroke-width="7" stroke-linecap="round">'
           '<circle cx="100" cy="40" r="28"/><path d="M100 70 V250"/><path d="M60 100 H140 M64 125 H136 M68 150 H132 M72 175 H128"/>'
           '<path d="M100 95 L50 180 L40 250 M100 95 L150 180 L160 250"/><path d="M70 250 H130 M80 250 L70 410 M120 250 L130 410"/></svg>')
    gid, st, d = capa(c, "centro", a, b, f'<div class="esq-marco">{svg}<span>«esqueletos de gigantes»</span></div>')
    c.tw(f'tl.fromTo("#{gid} .esq-marco", {{opacity: 0, scale: 0.9}}, {{opacity: 1, scale: 1, duration: 0.6}}, {st});')

def g_pincel(c, o, a, b):
    svg = '<svg class="pincel" viewBox="0 0 120 120"><path d="M20 100 C30 80 40 78 52 82 L96 24 C100 18 108 22 104 28 L60 90 C64 102 50 112 20 100 Z" fill="#c9a227"/></svg>'
    gid, st, d = capa(c, "centro", a, b, f'{svg}<div class="g-grande chico">concurso de retoque fotográfico</div><div class="g-sub">comienzos de los años 2000</div>')
    c.tw(f'tl.fromTo("#{gid} .pincel", {{opacity: 0, rotation: -30}}, {{opacity: 1, rotation: 0, duration: 0.6, ease: "back.out(2)"}}, {st});')
    sube(c, f"#{gid} .g-grande", st + 0.4, 0.6, 20); sube(c, f"#{gid} .g-sub", st + 0.9, 0.6, 20)

def g_final(c, o, a, b):
    gid, st, d = capa(c, "centro", a, b, '<div class="fin-t">Nos vemos en el próximo video</div><div class="t-linea fin-l"></div><div class="fin-s">LOS NEFILIM</div>')
    sube(c, f"#{gid} .fin-t", st + 0.2, 0.8, 30)
    c.tw(f'tl.fromTo("#{gid} .fin-l", {{scaleX: 0}}, {{scaleX: 1, duration: 0.8}}, {st + 0.6});')
    sube(c, f"#{gid} .fin-s", st + 1.0, 0.6, 15)

G = dict(rotulo=g_rotulo, grande=g_grande, cita=g_cita, palabra=g_palabra, sello=g_sello, contador=g_contador, lista=g_lista,
         fila=g_fila, flecha=g_flecha, libro=g_libro, ficha=g_ficha, gancho=g_gancho, tarjetas3=g_tarjetas3, balanza=g_balanza,
         tarjeta4=g_tarjeta4, ventanas=g_ventanas, interroga=g_interroga, silueta=g_silueta, luces=g_luces, mapa=g_mapa,
         tiempo=g_tiempo, escala=g_escala, columnas=g_columnas, arbol=g_arbol, tira=g_tira, expande=g_expande,
         comprime=lambda c, o, a, b: g_expande(c, o, a, b, True), candado=g_candado, huecos=g_huecos, cuatro=g_cuatro,
         pulso=g_pulso, cruce=g_cruce, espias=g_espias, lupa=g_lupa, esqueleto=g_esqueleto, pincel=g_pincel, final=g_final)

# ---------- armado ----------
def generar():
    usadas, clips, sfx_all = set(), set(), []
    for nm, n0, n1, t0 in SEC_T:
        idx = [s[0] for s in SEC_T].index(nm)
        t1 = SEC_T[idx + 1][3] if idx + 1 < len(SEC_T) else FIN
        c = Comp(nm, t0, t1); prev_base = None
        overlays = []
        for n in range(n0, n1 + 1):
            sp = S.get(n, {}); a, b = t_escena(n), fin_escena(n)
            if n == n0 and nm != "intro2": a = t0
            if "titulo" in sp:
                tb = a + 2.7; overlays.append(("titulo", sp, a, tb)); continue
            # si la escena anterior fue un título, esta empieza cuando el título termina
            if n > n0 and "titulo" in S.get(n - 1, {}): a = max(a, t_escena(n - 1) + 2.7) if n - 1 != n0 else t0 + 2.7
            base = sp.get("base", [("f", "noche", {})])
            if base == ["sigue"]:
                if prev_base: prev_base[2] = b
            else:
                if prev_base: c_flush(c, n - 1, prev_base); prev_base = None
                partes = repartir(base, a, b)
                for j, (p, (pa, pb)) in enumerate(zip(base, partes)):
                    item = [p, pa, pb, j]
                    if j == len(base) - 1: prev_base = item
                    else: c_flush(c, n, item)
                    if p[0] == "i": usadas.add(p[1])
                    if p[0] == "v": clips.add(p[1])
                    if p[0] == "f" and p[1] == "mapa":
                        for g in sp.get("g", []):
                            if g["t"] == "mapa": g["_a"] = pa
            for g in sp.get("g", []):
                span = g.get("span", 1); gb = fin_escena(n + span - 1)
                ga = g.get("_a") or (palabra_t(g["at"], a, b) - 0.15 if isinstance(g.get("at"), str) and palabra_t(g["at"], a, b) else a + 0.15)
                if g["t"] in ("ficha",) and any(h is not g and h["t"] == "ficha" for h in sp["g"]):
                    otros = [h for h in sp["g"] if h["t"] == "ficha"]; k = otros.index(g)
                    if k + 1 < len(otros):
                        nxt = otros[k + 1]; gb = (palabra_t(nxt["at"], a, b) or (a + b) / 2) - 0.15
                if g["t"] in ("ficha",) and g.get("img"): usadas.add(g["img"])
                if g["t"] == "tira": usadas.add(g["img"])
                overlays.append((g["t"], g, max(a, ga), gb))
            c._n = n
        if prev_base: c_flush(c, n1, prev_base)
        for t, g, ga, gb in overlays:
            if t == "titulo": g_titulo(c, g, ga, gb)
            else: G[t](c, g, ga, gb)
        escribir(c); sfx_all += c.sfx
        print(nm, round(t0, 2), round(t1, 2), len(c.els), "elementos")
    json.dump(dict(usadas=sorted(usadas), clips=sorted(clips), sfx=sfx_all, secciones=[(nm, t0) for nm, _, _, t0 in SEC_T], fin=FIN), open(f"{BASE}/gen/salida.json", "w"), indent=1)

def c_flush(c, n, item):
    p, a, b, j = item
    if b - a < 0.05: return
    if p[0] == "i": plano_imagen(c, n, j, p[1], p[2], a, b)
    elif p[0] == "v": plano_video(c, n, p[1], p[2], a, b)
    else: plano_fondo(c, n, p[1], p[2], a, b)

def escribir(c):
    d = round(c.t1 - c.t0, 3)
    out = f'''<template>
  <style>
{CSS}
  </style>
  <div id="root" data-composition-id="{c.cid}" data-width="1920" data-height="1080">
    {chr(10).join("    " + e for e in c.els)}
  </div>
  <script>
    window.__timelines = window.__timelines || {{}};
    const tl = gsap.timeline({{ paused: true }});
{JS}
{chr(10).join(c.js)}
    window.__timelines["{c.cid}"] = tl;
  </script>
</template>
'''
    open(f"{PROY}/compositions/{c.cid}.html", "w").write(out)

if __name__ == "__main__":
    generar()

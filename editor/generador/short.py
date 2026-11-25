# Short vertical (1080×1920) del gancho de Los Nefilim, recompuesto para 9:16.
import json, html
B = "/home/user/Videos-YT-/trabajo/nefilim/short"
G = json.load(open(f"{B}/subtitulos.json"))
FIN_VOZ, FIN = 42.6, 46.8
X = html.escape

subs = []
for k, g in enumerate(G):
    a = g[0][1] - 0.05; b = G[k + 1][0][1] - 0.05 if k + 1 < len(G) else FIN_VOZ
    words = "".join(f'<span class="sw">{X(w)}</span> ' for w, _, _ in g)
    subs.append((k, a, b, words, g))
sub_html = "\n".join(f'    <div id="sb{k}" class="clip sub" data-start="{a:.2f}" data-duration="{b - a:.2f}"><div class="sub-t">{w}</div></div>' for k, a, b, w, _ in subs)
sub_js = []
for k, a, b, w, g in subs:
    sub_js.append(f'tl.fromTo("#sb{k} .sub-t", {{scale: 0.85, opacity: 0}}, {{scale: 1, opacity: 1, duration: 0.18, ease: "back.out(2)"}}, {a:.2f});')
    for j, (_, s, e) in enumerate(g):
        sub_js.append(f'tl.fromTo("#sb{k} .sw:nth-child({j + 1})", {{color: "#f2e8d5"}}, {{color: "#e8c547", duration: 0.08}}, {s:.2f});')

LOGO = '<img id="fin-logo" src="assets/logo.png" alt="logo del canal" />' if __import__("os").path.exists(f"{B}/assets/logo.png") else '<div id="fin-logo" class="logo-hueco">LOGO</div>'

out = f'''<template>
  <style>
    @font-face {{ font-family: "Cinzel"; src: url("assets/fonts/cinzel.woff2") format("woff2"); font-weight: 400 900; }}
    #root {{ position: absolute; inset: 0; overflow: hidden; background: #0f1b2d; font-family: "Montserrat", sans-serif; color: #f2e8d5; }}
    #root .shot {{ position: absolute; inset: 0; overflow: hidden; background: #0f1b2d; }}
    #root .kb, #root .vid {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }}
    #root .vig {{ position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(15,27,45,0) 40%, rgba(15,27,45,0.85) 100%); }}
    #root .sombra {{ position: absolute; left: 0; right: 0; bottom: 0; height: 55%; background: linear-gradient(to top, rgba(15,27,45,0.95), rgba(15,27,45,0)); }}
    #root .fx {{ position: absolute; inset: 0; width: 1080px; height: 1920px; }}
    #root .rayos {{ position: absolute; inset: -30%; mix-blend-mode: screen; transform-origin: 30% 0%;
      background: repeating-conic-gradient(from 150deg at 30% 0%, rgba(242,232,213,0) 0deg, rgba(242,232,213,0.13) 2.5deg, rgba(242,232,213,0) 6deg, rgba(242,232,213,0) 11deg);
      -webkit-mask-image: radial-gradient(ellipse at 30% 0%, #000 0%, rgba(0,0,0,0.4) 45%, transparent 75%); mask-image: radial-gradient(ellipse at 30% 0%, #000 0%, rgba(0,0,0,0.4) 45%, transparent 75%); }}
    #root .lluvia {{ position: absolute; inset: -200px; background-image: repeating-linear-gradient(105deg, rgba(242,232,213,0) 0px, rgba(242,232,213,0) 26px, rgba(242,232,213,0.16) 27px, rgba(242,232,213,0) 29px); }}
    #root .oro {{ font-family: "Cinzel", serif; font-weight: 700; color: #c9a227; text-shadow: 0 6px 40px rgba(0,0,0,0.8); text-align: center; }}
    #root .perg {{ font-family: "Cinzel", serif; font-weight: 700; color: #f2e8d5; text-shadow: 0 6px 40px rgba(0,0,0,0.85); text-align: center; }}
    #root .alto {{ position: absolute; left: 60px; right: 60px; top: 300px; line-height: 1.1; }}
    #root .medio {{ position: absolute; left: 60px; right: 60px; top: 640px; line-height: 1.1; }}
    #root .rot {{ position: absolute; left: 0; right: 0; top: 230px; text-align: center; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 44px; letter-spacing: 0.25em; color: #f2e8d5; }}
    #root .rot b {{ color: #c9a227; }}
    #root .sub {{ position: absolute; left: 0; right: 0; top: 1060px; height: 260px; display: flex; align-items: center; justify-content: center; z-index: 40; }}
    #root .sub-t {{ max-width: 940px; padding: 18px 34px; border-radius: 18px; background: rgba(10,18,32,0.72); text-align: center;
      font-family: "Montserrat", sans-serif; font-weight: 800; font-size: 74px; line-height: 1.12; color: #f2e8d5; text-transform: uppercase; }}
    #niebla1, #niebla2 {{ position: absolute; border-radius: 50%; }}
    #niebla1 {{ width: 1600px; height: 900px; left: -300px; top: 1100px; background: radial-gradient(ellipse, rgba(242,232,213,0.24), rgba(242,232,213,0) 65%); }}
    #niebla2 {{ width: 1400px; height: 800px; left: -100px; top: 1250px; background: radial-gradient(ellipse, rgba(201,162,39,0.18), rgba(201,162,39,0) 65%); }}
    #sil {{ position: absolute; left: 190px; top: 260px; width: 700px; height: 1120px; transform-origin: 50% 100%; }}
    #root .niebla3 {{ position: absolute; left: -300px; width: 1700px; top: 900px; height: 1000px; border-radius: 50%; background: radial-gradient(ellipse, rgba(220,225,235,0.28), rgba(220,225,235,0) 65%); }}
    #flash {{ position: absolute; inset: 0; background: #f2e8d5; opacity: 0; }}
    #cont {{ position: absolute; left: 0; right: 0; top: 330px; }}
    #num {{ font-size: 260px; line-height: 1; }}
    #estante {{ position: absolute; left: 140px; top: 330px; width: 800px; height: 620px; }}
    #root .lomo {{ position: absolute; bottom: 0; width: 110px; height: 560px; border-radius: 6px; background: linear-gradient(90deg, #4a1219, #7a1f2b 30%, #5a1520); box-shadow: inset 0 0 0 3px rgba(201,162,39,0.35); }}
    #root .lomo span {{ position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%) rotate(-90deg); white-space: nowrap; font-family: "Cinzel", serif; font-weight: 700; font-size: 34px; color: #c9a227; letter-spacing: 0.15em; }}
    #enoc {{ background: linear-gradient(90deg, #8a6d12, #c9a227 35%, #9b7a17) !important; box-shadow: 0 0 40px rgba(201,162,39,0.5) !important; }}
    #enoc span {{ color: #0f1b2d; }}
    #repisa {{ position: absolute; left: -40px; right: -40px; bottom: -24px; height: 24px; background: #2a3a52; border-radius: 4px; }}
    #root .tarjeta {{ position: absolute; left: 290px; width: 500px; height: 250px; border-radius: 18px; background: #f2e8d5; box-shadow: 0 30px 80px rgba(0,0,0,0.55), inset 0 0 0 6px #c9a227; display: flex; align-items: center; justify-content: center; gap: 30px; }}
    #root .tarjeta svg {{ width: 120px; height: 120px; }}
    #root .tarjeta h3 {{ font-family: "Cinzel", serif; font-weight: 700; font-size: 46px; color: #0f1b2d; }}
    #t1 {{ top: 220px; }} #t2 {{ top: 490px; }} #t3 {{ top: 760px; }}
    #titulo {{ position: absolute; left: 0; right: 0; top: 600px; font-size: 140px; line-height: 1.05; letter-spacing: 0.08em; }}
    #linea {{ position: absolute; left: 240px; width: 600px; top: 940px; height: 5px; background: #c9a227; }}
    #fondo-fin {{ position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, #1e3150, #0f1b2d 70%); }}
    #fin-logo {{ position: absolute; left: 340px; top: 300px; width: 400px; height: 400px; object-fit: contain; }}
    #root .logo-hueco {{ border: 4px dashed rgba(201,162,39,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: "Cinzel", serif; font-size: 50px; color: rgba(201,162,39,0.7); }}
    #fin-canal {{ position: absolute; left: 40px; right: 40px; top: 760px; font-size: 104px; }}
    #fin-txt {{ position: absolute; left: 80px; right: 80px; top: 960px; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 60px; line-height: 1.2; text-align: center; color: #f2e8d5; }}
  </style>
  <div id="root" data-composition-id="short" data-width="1080" data-height="1920">
    <video id="v-pag" class="clip vid" src="assets/clips/V09_mixkit-25185.mp4" data-start="0" data-duration="2.4" data-media-start="1.5" muted playsinline></video>
    <div id="s1" class="clip shot" data-start="2.4" data-duration="2.2" data-layout-allow-overflow style="perspective: 1400px;">
      <img id="s1-i" class="kb" src="assets/img/I06.jpg" style="object-position: 40% 30%;" alt="Códice de Leningrado" />
      <div id="s1-r" class="rayos"></div><canvas id="s1-fx" class="fx" width="1080" height="1920"></canvas><div class="vig"></div>
    </div>
    <div id="s1t" class="clip shot" data-start="0" data-duration="4.6" style="background: transparent;">
      <div class="sombra" style="top:0; bottom:auto; height:45%; background: linear-gradient(to bottom, rgba(15,27,45,0.9), rgba(15,27,45,0));"></div>
      <div id="s1-rot" class="rot">GÉNESIS <b>6</b></div>
      <div id="s1-txt" class="oro alto" style="top:330px; font-size:130px;">4 versículos</div>
    </div>
    <div id="s2" class="clip shot" data-start="4.6" data-duration="2.1">
      <img id="s2-i" class="kb" src="assets/img/I08.jpg" style="object-position: 50% 30%;" alt="William Blake" /><div class="vig"></div>
    </div>
    <video id="v-est" class="clip vid" src="assets/clips/V07_mixkit-46119.mp4" data-start="6.7" data-duration="1.7" data-media-start="2" muted playsinline style="object-position: 40% 50%;"></video>
    <div id="s2t" class="clip shot" data-start="6.7" data-duration="1.7" style="background: transparent;"><div id="s2-txt" class="oro alto" style="font-size:120px;">«hijos de Dios»</div></div>
    <div id="s3" class="clip shot" data-start="8.4" data-duration="2.1">
      <div id="s3-i" class="kb" style="background: radial-gradient(ellipse at 50% 35%, #2a3f62, #0f1b2d 70%);"></div><div id="s3-n" class="niebla3"></div><canvas id="s3-fx" class="fx" width="1080" height="1920"></canvas><div class="vig"></div>
      <div id="s3-txt" class="perg alto" style="font-size:104px;">«hijas de los hombres»</div>
    </div>
    <div id="s4" class="clip shot" data-start="10.5" data-duration="4.7" data-layout-allow-overflow>
      <div id="niebla1"></div>
      <svg id="sil" viewBox="0 0 600 960" aria-hidden="true">
        <defs><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter>
          <linearGradient id="lz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2e8d5" stop-opacity="0.95"/><stop offset="0.6" stop-color="#c9a227" stop-opacity="0.55"/><stop offset="1" stop-color="#c9a227" stop-opacity="0"/></linearGradient></defs>
        <path id="silp" d="M300 30 C262 30 240 62 240 110 C240 150 255 178 270 196 C262 214 250 222 200 236 C140 254 110 300 96 380 C82 470 92 560 120 650 C140 720 160 820 175 960 L425 960 C440 820 460 720 480 650 C508 560 518 470 504 380 C490 300 460 254 400 236 C350 222 338 214 330 196 C345 178 360 150 360 110 C360 62 338 30 300 30 Z" fill="url(#lz)" filter="url(#bl)"/>
      </svg>
      <canvas id="s4-fx" class="fx" width="1080" height="1920"></canvas>
      <div id="niebla2"></div>
      <div id="s4-txt" class="oro alto" style="top:240px; font-size:150px; letter-spacing:0.12em;">NEFILIM</div>
    </div>
    <video id="v-humo" class="clip vid" src="assets/clips/V10_mixkit-50951.mp4" data-start="10.5" data-duration="4.7" data-media-start="3" muted playsinline style="mix-blend-mode: screen; opacity: 0.35;"></video>
    <video id="v-rayo" class="clip vid" src="assets/clips/V01_mixkit-47948.mp4" data-start="15.2" data-duration="1.4" data-media-start="1.6" muted playsinline></video>
    <div id="s5" class="clip shot" data-start="16.6" data-duration="1.6" data-layout-allow-overflow>
      <img id="s5-f" class="kb" src="assets/img/I01-fondo.jpg" style="object-position: 45% 40%;" alt="" />
      <img id="s5-i" class="kb" src="assets/img/I01-figura.webp" style="object-position: 45% 40%;" alt="Doré, El diluvio" />
      <div id="s5-ll" class="lluvia"></div><div id="flash"></div><div class="vig"></div>
    </div>
    <div id="s6a" class="clip shot" data-start="18.2" data-duration="1.6"><div id="s6a-t" class="perg medio" style="font-size:140px;">¿Quiénes eran?</div></div>
    <div id="s6b" class="clip shot" data-start="19.8" data-duration="1.3">
      <img id="s6b-i" class="kb" src="assets/img/I12.jpg" style="object-position: 62% 30%;" alt="Bruegel" /><div class="vig"></div>
      <div id="s6b-t" class="oro alto" style="font-size:130px;">¿Ángeles?</div>
    </div>
    <div id="s6c" class="clip shot" data-start="21.1" data-duration="1.1">
      <img id="s6c-i" class="kb" src="assets/img/I48.jpg" style="object-position: 9% 80%;" alt="David y Goliat" /><div class="vig"></div>
      <div id="s6c-t" class="oro alto" style="font-size:130px;">¿Gigantes?</div>
    </div>
    <div id="s6d" class="clip shot" data-start="22.2" data-duration="1.9">
      <img id="s6d-i" class="kb" src="assets/img/I15.jpg" style="object-position: 50% 30%; transform-origin: 50% 20%;" alt="Flavio Josefo" /><div class="vig"></div>
      <div id="s6d-t" class="oro alto" style="font-size:110px;">¿Hombres poderosos?</div>
    </div>
    <div id="s7" class="clip shot" data-start="24.1" data-duration="4.3" data-layout-allow-overflow>
      <img id="s7-f" class="kb" src="assets/img/I09-fondo.jpg" style="object-position: 62% 50%;" alt="" />
      <img id="s7-i" class="kb" src="assets/img/I09-figura.webp" style="object-position: 62% 50%;" alt="Libro de Enoc" />
      <div id="s7-r" class="rayos"></div><canvas id="s7-fx" class="fx" width="1080" height="1920"></canvas>
      <div class="sombra" style="top:0; bottom:auto; height:50%; background: linear-gradient(to bottom, rgba(15,27,45,0.92), rgba(15,27,45,0));"></div>
      <div id="cont"><div class="perg" style="font-size:46px; letter-spacing:0.2em;">HACE MÁS DE</div><div id="num" class="oro">0</div><div class="perg" style="font-size:50px; letter-spacing:0.25em;">AÑOS</div></div>
    </div>
    <div id="s8" class="clip shot" data-start="28.4" data-duration="1.55" data-layout-allow-overflow>
      <img id="s8-f" class="kb" src="assets/img/I10-fondo.jpg" style="object-position: 48% 50%;" alt="" />
      <img id="s8-i" class="kb" src="assets/img/I10-figura.webp" style="object-position: 48% 50%;" alt="Monte Hermón" />
      <canvas id="s8-fx" class="fx" width="1080" height="1920"></canvas><div class="vig"></div>
    </div>
    <video id="v-mont" class="clip vid" src="assets/clips/V04_mixkit-46203.mp4" data-start="29.95" data-duration="1.4" data-media-start="3" muted playsinline style="object-position: 62% 50%;"></video>
    <div id="s8t" class="clip shot" data-start="28.4" data-duration="2.95" style="background: transparent;">
      <div class="sombra" style="top:0; bottom:auto; height:55%; background: linear-gradient(to bottom, rgba(15,27,45,0.9), rgba(15,27,45,0));"></div>
      <div id="p1" class="perg" style="position:absolute; left:0; right:0; top:260px; font-size:96px;">nombres</div>
      <div id="p2" class="perg" style="position:absolute; left:0; right:0; top:420px; font-size:96px;">un juramento</div>
      <div id="p3" class="oro" style="position:absolute; left:0; right:0; top:580px; font-size:96px;">una montaña</div>
    </div>
    <div id="s9" class="clip shot" data-start="31.35" data-duration="3.3" data-layout-allow-overflow>
      <div id="estante"><div id="todos" style="position:absolute; inset:0;">
        <div class="lomo" style="left:0px;"><span>BIBLIA</span></div><div class="lomo" style="left:140px;"><span>BIBLIA</span></div>
        <div id="enoc" class="lomo" style="left:280px;"><span>1 ENOC</span></div>
        <div id="b4" class="lomo" style="left:420px;"><span>BIBLIA</span></div><div id="b5" class="lomo" style="left:560px;"><span>BIBLIA</span></div>
      </div><div id="repisa"></div></div>
      <canvas id="s9-fx" class="fx" width="1080" height="1920"></canvas>
    </div>
    <div id="s10" class="clip shot" data-start="34.65" data-duration="7">
      <canvas id="s10-fx" class="fx" width="1080" height="1920"></canvas>
      <div id="t1" class="tarjeta"><svg viewBox="0 0 100 100"><path d="M50 22 C38 14 22 14 10 18 V80 C22 76 38 76 50 84 C62 76 78 76 90 80 V18 C78 14 62 14 50 22 Z M50 22 V84" fill="none" stroke="#0f1b2d" stroke-width="5" stroke-linejoin="round"/></svg><h3>TEXTO</h3></div>
      <div id="t2" class="tarjeta"><svg viewBox="0 0 100 100"><path d="M24 16 H78 C84 16 88 20 88 26 C88 32 84 36 78 36 H72 V78 C72 84 68 88 62 88 H20 C14 88 10 84 10 78 C10 72 14 68 20 68 H26 V26 Z M36 34 H62 M36 46 H62 M36 58 H56" fill="none" stroke="#0f1b2d" stroke-width="5" stroke-linecap="round"/></svg><h3>TRADICIÓN</h3></div>
      <div id="t3" class="tarjeta"><svg viewBox="0 0 100 100"><circle cx="42" cy="42" r="24" fill="none" stroke="#0f1b2d" stroke-width="6"/><path d="M60 60 L86 86" stroke="#0f1b2d" stroke-width="9" stroke-linecap="round"/></svg><h3>ESTUDIOS</h3></div>
    </div>
    <div id="s11" class="clip shot" data-start="41.65" data-duration="1.0" data-layout-allow-overflow>
      <div id="s11-r" class="rayos"></div>
      <div id="titulo" class="oro">LOS<br/>NEFILIM</div><div id="linea"></div>
    </div>
    <div id="fin" class="clip shot" data-start="{FIN_VOZ}" data-duration="{FIN - FIN_VOZ:.2f}" data-layout-allow-overflow>
      <div id="fondo-fin"></div><div id="fin-r" class="rayos"></div><canvas id="fin-fx" class="fx" width="1080" height="1920"></canvas>
      {LOGO}
      <div id="fin-canal" class="oro">Raíces de la Fe</div>
      <div id="fin-txt">Mira el video completo<br/>en mi canal</div>
    </div>
{sub_html}
  </div>
  <script>
    window.__timelines = window.__timelines || {{}};
    const tl = gsap.timeline({{ paused: true }});
    const sube = (sel, t, d = 0.5, y = 40) => tl.fromTo(sel, {{ opacity: 0, y }}, {{ opacity: 1, y: 0, duration: d, ease: "power3.out" }}, t);
    const kb = (sel, t, d, a, b) => tl.fromTo(sel, a, {{ ...b, duration: d, ease: "none" }}, t);
    const semilla = (s) => () => {{ s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }};
    const sprite = (color) => {{ const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, color); r.addColorStop(0.25, color.replace(/[\\d.]+\\)$/, "0.55)")); r.addColorStop(1, color.replace(/[\\d.]+\\)$/, "0)")); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c; }};
    const TIPOS = {{ polvo: {{ col: "rgba(242,232,213,0.9)", v: [6, 22], s: [3, 9], a: [0.15, 0.5], dir: -0.3, osc: 40 }},
      chispas: {{ col: "rgba(232,200,90,1)", v: [90, 220], s: [4, 10], a: [0.4, 1], dir: -1, osc: 30 }},
      nieve: {{ col: "rgba(255,255,255,0.95)", v: [50, 120], s: [5, 12], a: [0.4, 0.9], dir: 1, osc: 50 }} }};
    const particulas = (id, t0, dur, tipo, n, seed) => {{
      const cv = document.getElementById(id); const ctx = cv.getContext("2d"); const rnd = semilla(seed); const cfg = TIPOS[tipo];
      const P = Array.from({{ length: n }}, () => ({{ x: rnd() * 1080, y: rnd() * 1920, v: cfg.v[0] + rnd() * (cfg.v[1] - cfg.v[0]), s: cfg.s[0] + rnd() * (cfg.s[1] - cfg.s[0]), a: cfg.a[0] + rnd() * (cfg.a[1] - cfg.a[0]), f: rnd() * 6.28, w: 0.3 + rnd() * 0.9 }}));
      const img = sprite(cfg.col); const reloj = {{ t: 0 }};
      tl.fromTo(reloj, {{ t: 0 }}, {{ t: dur, duration: dur, ease: "none", onUpdate: () => {{
        const u = reloj.t; ctx.clearRect(0, 0, 1080, 1920);
        for (const p of P) {{ const y = ((p.y + cfg.dir * p.v * u) % 2020 + 2020) % 2020 - 50; const x = p.x + Math.sin(p.f + u * p.w) * cfg.osc;
          ctx.globalAlpha = p.a * (tipo === "chispas" ? 0.55 + 0.45 * Math.sin(p.f * 3 + u * 5 * p.w) : 1); const d = p.s * 2.4; ctx.drawImage(img, x - d / 2, y - d / 2, d, d); }}
      }} }}, t0);
    }};
    const prof = (f, g, t, d, s0, sf, sg) => {{ tl.fromTo(f, {{ scale: s0 }}, {{ scale: sf, duration: d, ease: "none" }}, t); tl.fromTo(g, {{ scale: s0 }}, {{ scale: sg, duration: d, ease: "none" }}, t); }};

    sube("#s1-rot", 0.3, 0.5, 20); sube("#s1-txt", 0.9, 0.6);
    tl.fromTo("#s1-i", {{ scale: 1.15, rotationX: 14 }}, {{ scale: 1.3, rotationX: 2, duration: 2.2, ease: "none" }}, 2.4);
    tl.fromTo("#s1-r", {{ opacity: 0.4 }}, {{ opacity: 0.9, duration: 2.2 }}, 2.4); particulas("s1-fx", 2.4, 2.2, "polvo", 70, 11);
    kb("#s2-i", 4.6, 2.1, {{ scale: 1.1, yPercent: 3 }}, {{ scale: 1.2, yPercent: -2 }});
    sube("#s2-txt", 6.8, 0.6);
    kb("#s3-i", 8.4, 2.1, {{ scale: 1.0 }}, {{ scale: 1.1 }}); tl.fromTo("#s3-n", {{ x: -150 }}, {{ x: 150, duration: 2.1, ease: "none" }}, 8.4); particulas("s3-fx", 8.4, 2.1, "polvo", 70, 31); sube("#s3-txt", 8.6, 0.5);
    tl.fromTo("#sil", {{ opacity: 0, scale: 0.7, y: 150 }}, {{ opacity: 1, scale: 1.05, y: 0, duration: 4.6, ease: "power2.out" }}, 10.5);
    tl.fromTo("#niebla1", {{ x: -120 }}, {{ x: 160, duration: 4.7, ease: "none" }}, 10.5); tl.fromTo("#niebla2", {{ x: 140 }}, {{ x: -200, duration: 4.7, ease: "none" }}, 10.5);
    particulas("s4-fx", 10.5, 4.7, "chispas", 70, 41);
    tl.fromTo("#s4-txt", {{ opacity: 0, scale: 1.25 }}, {{ opacity: 1, scale: 1, duration: 1.0, ease: "power3.out" }}, 13.7);
    prof("#s5-f", "#s5-i", 16.6, 1.6, 1.0, 1.04, 1.14);
    tl.fromTo("#s5-ll", {{ backgroundPosition: "0px 0px" }}, {{ backgroundPosition: "-160px 900px", duration: 1.6, ease: "none" }}, 16.6);
    tl.fromTo("#flash", {{ opacity: 0 }}, {{ opacity: 0.85, duration: 0.06 }}, 17.45); tl.to("#flash", {{ opacity: 0, duration: 0.5 }}, 17.51);
    tl.fromTo("#s5-i", {{ x: 0 }}, {{ x: 14, duration: 0.05, repeat: 7, yoyo: true, ease: "none" }}, 17.45);
    tl.fromTo("#s6a-t", {{ opacity: 0, scale: 0.9 }}, {{ opacity: 1, scale: 1, duration: 0.4 }}, 18.25);
    kb("#s6b-i", 19.8, 1.3, {{ scale: 1.1 }}, {{ scale: 1.2 }}); sube("#s6b-t", 19.85, 0.3, 30);
    kb("#s6c-i", 21.1, 1.1, {{ scale: 1.1 }}, {{ scale: 1.2 }}); sube("#s6c-t", 21.15, 0.3, 30);
    kb("#s6d-i", 22.2, 1.9, {{ scale: 1.3 }}, {{ scale: 1.4 }}); sube("#s6d-t", 22.25, 0.35, 30);
    prof("#s7-f", "#s7-i", 24.1, 4.3, 1.05, 1.1, 1.24); particulas("s7-fx", 24.1, 4.3, "polvo", 80, 71);
    tl.fromTo("#s7-r", {{ opacity: 0.3 }}, {{ opacity: 0.8, duration: 4.3 }}, 24.1); sube("#cont", 24.2, 0.6);
    const c = {{ v: 0 }}; tl.fromTo(c, {{ v: 0 }}, {{ v: 2000, duration: 1.4, ease: "power2.out", onUpdate: () => {{ document.querySelector("#num").textContent = (Math.round(c.v / 10) * 10).toLocaleString("es-ES").replace(",", "."); }} }}, 24.9);
    prof("#s8-f", "#s8-i", 28.4, 1.55, 1.05, 1.07, 1.18); particulas("s8-fx", 28.4, 1.55, "nieve", 110, 81);
    sube("#p1", 28.6, 0.4, 30); sube("#p2", 29.4, 0.4, 30); sube("#p3", 30.6, 0.4, 30);
    tl.fromTo("#estante", {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.4 }}, 31.35);
    tl.fromTo("#enoc", {{ y: 0, opacity: 1, rotation: 0 }}, {{ y: -800, opacity: 0, rotation: -8, duration: 1.0, ease: "power2.in" }}, 31.7);
    tl.fromTo(["#b4", "#b5"], {{ x: 0 }}, {{ x: -140, duration: 0.5, ease: "power3.out" }}, 32.7);
    tl.fromTo("#todos", {{ x: 0 }}, {{ x: 70, duration: 0.5, ease: "power3.out" }}, 32.7); particulas("s9-fx", 31.35, 3.3, "polvo", 50, 91);
    particulas("s10-fx", 34.65, 7, "polvo", 60, 101);
    tl.fromTo("#t1", {{ opacity: 0, x: -200 }}, {{ opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.4)" }}, 36.6);
    tl.fromTo("#t2", {{ opacity: 0, x: 200 }}, {{ opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.4)" }}, 38.4);
    tl.fromTo("#t3", {{ opacity: 0, x: -200 }}, {{ opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.4)" }}, 40.65);
    tl.fromTo("#titulo", {{ opacity: 0, scale: 1.15 }}, {{ opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }}, 41.7);
    tl.fromTo("#linea", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.6 }}, 41.9); tl.fromTo("#s11-r", {{ opacity: 0 }}, {{ opacity: 0.9, duration: 1 }}, 41.65);
    tl.fromTo("#fin-logo", {{ opacity: 0, scale: 0.8 }}, {{ opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }}, {FIN_VOZ + 0.1});
    sube("#fin-canal", {FIN_VOZ + 0.4}, 0.6, 30); sube("#fin-txt", {FIN_VOZ + 0.8}, 0.6, 20);
    tl.fromTo("#fin-r", {{ opacity: 0 }}, {{ opacity: 0.8, duration: 2 }}, {FIN_VOZ}); particulas("fin-fx", {FIN_VOZ}, {FIN - FIN_VOZ:.2f}, "chispas", 60, 121);
    {chr(10).join("    " + s for s in sub_js)}
    window.__timelines["short"] = tl;
  </script>
</template>
'''
open(f"{B}/compositions/short.html", "w").write(out)

idx = f'''<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Los Nefilim · Short</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>* {{ margin: 0; padding: 0; box-sizing: border-box; }} html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #0f1b2d; }}
      #cortina {{ position: absolute; inset: 0; background: #000; opacity: 0; z-index: 50; }}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{FIN}" data-width="1080" data-height="1920">
      <div id="short" data-composition-id="short" data-composition-src="compositions/short.html" data-start="0" data-duration="{FIN}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="cortina" class="clip" data-start="{FIN - 0.6:.2f}" data-duration="0.6" data-track-index="5"></div>
      <audio id="voz" class="clip" src="assets/audio/voz-gancho.mp3" data-start="0" data-duration="42.7" data-volume="1" data-track-index="10"></audio>
      <!-- Música: «Lightless Dawn», Kevin MacLeod (incompetech.com), CC BY 4.0 -->
      <audio id="musica" class="clip" src="assets/musica/lightless-dawn.mp3" data-start="0" data-duration="{FIN}" data-volume="0.55" data-fade-in="1" data-fade-out="1.5" data-track-index="9"></audio>
      <audio id="sfx1" class="clip" src="assets/sfx/whoosh-cinematic.mp3" data-start="10.3" data-duration="4" data-volume="0.3" data-track-index="11"></audio>
      <audio id="sfx2" class="clip" src="assets/sfx/impact-bass-2.mp3" data-start="15.75" data-duration="2.5" data-volume="0.35" data-track-index="12"></audio>
      <audio id="sfx3" class="clip" src="assets/sfx/impact-bass-1.mp3" data-start="17.45" data-duration="2.1" data-volume="0.45" data-track-index="13"></audio>
      <audio id="sfx4" class="clip" src="assets/sfx/whoosh-short.mp3" data-start="19.7" data-duration="0.57" data-volume="0.25" data-track-index="11"></audio>
      <audio id="sfx5" class="clip" src="assets/sfx/whoosh.mp3" data-start="21.0" data-duration="0.57" data-volume="0.25" data-track-index="12"></audio>
      <audio id="sfx6" class="clip" src="assets/sfx/whoosh-short.mp3" data-start="22.1" data-duration="0.57" data-volume="0.25" data-track-index="13"></audio>
      <audio id="sfx7" class="clip" src="assets/sfx/whoosh.mp3" data-start="31.5" data-duration="0.57" data-volume="0.3" data-track-index="11"></audio>
      <audio id="sfx8" class="clip" src="assets/sfx/impact-bass-2.mp3" data-start="41.7" data-duration="2.5" data-volume="0.4" data-track-index="12"></audio>
      <audio id="sfx9" class="clip" src="assets/sfx/whoosh-cinematic.mp3" data-start="{FIN_VOZ - 0.2}" data-duration="4" data-volume="0.25" data-track-index="13"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      tl.fromTo("#cortina", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.55 }}, {FIN - 0.6:.2f});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
'''
open(f"{B}/index.html", "w").write(idx)
print("ok", len(subs), "subtítulos, duración", FIN)

# Short vertical (1080×1920) del gancho de Los Nefilim, recompuesto para 9:16.
import json, html
B = "/home/user/Videos-YT-/trabajo/nostradamus/short"
G = json.load(open(f"{B}/subtitulos.json"))
FIN_VOZ, FIN = 38.2, 42.4
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
    #root .tit2 {{ position: absolute; width: 900px; padding: 24px 28px; background: #eef0f3; border-radius: 10px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }}
    #root .tit2 i {{ display: block; width: 110px; height: 12px; border-radius: 6px; background: #7a1f2b; margin-bottom: 12px; }}
    #root .tit2 b {{ font-family: "Montserrat", sans-serif; font-weight: 800; font-size: 46px; line-height: 1.15; color: #10161f; }}
    #root .busq {{ position: absolute; left: 240px; right: 240px; top: 1060px; height: 0; }}
    #root .busq span {{ display: block; width: 600px; margin: -440px auto 0; padding: 18px 0; border-radius: 60px; background: #f2e8d5; text-align: center; font-family: "Montserrat", sans-serif; font-weight: 800; font-size: 80px; color: #0f1b2d; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }}
    #linea {{ position: absolute; left: 240px; width: 600px; top: 940px; height: 5px; background: #c9a227; }}
    #fondo-fin {{ position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, #1e3150, #0f1b2d 70%); }}
    #fin-logo {{ position: absolute; left: 340px; top: 300px; width: 400px; height: 400px; object-fit: contain; }}
    #root .logo-hueco {{ border: 4px dashed rgba(201,162,39,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: "Cinzel", serif; font-size: 50px; color: rgba(201,162,39,0.7); }}
    #fin-canal {{ position: absolute; left: 40px; right: 40px; top: 760px; font-size: 104px; }}
    #fin-txt {{ position: absolute; left: 80px; right: 80px; top: 960px; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 60px; line-height: 1.2; text-align: center; color: #f2e8d5; }}
  </style>
  <div id="root" data-composition-id="short" data-width="1080" data-height="1920">
    <video id="v-nubes" class="clip vid" src="assets/clips/C07_mixkit-9624.mp4" data-start="0" data-duration="2.4" data-media-start="4" muted playsinline></video>
    <div id="s0t" class="clip shot" data-start="0" data-duration="2.4" style="background: transparent;">
      <div id="s0-f" class="oro alto" style="top:300px; font-size:120px;">12 · 08 · 2026</div>
      <div id="s0-p" class="rot" style="top:470px;">ESPAÑA</div>
    </div>
    <div id="s1" class="clip shot" data-start="2.4" data-duration="3.9" data-layout-allow-overflow style="background:#0b1626;">
      <div id="mapa" style="position:absolute; left:0; top:0; width:3111px; height:2300px; transform-origin:0 0;">
        <img src="assets/mapa.svg" style="position:absolute; left:0; top:0; width:3111px; height:2300px;" alt="mapa" />
        <svg style="position:absolute; left:0; top:0;" viewBox="0 0 3111 2300" width="3111" height="2300"><path id="banda" d="M247.5,1005.0 L565.7,1165.0 L813.2,1315.0 L1025.3,1435.0 L1308.1,1575.0 L1308.1,1785.0 L1025.3,1645.0 L813.2,1525.0 L565.7,1375.0 L247.5,1215.0 Z" fill="rgba(232,197,71,0.36)" stroke="#e8c547" stroke-width="2"/><path d="M247.5,1110.0 L565.7,1270.0 L813.2,1420.0 L1025.3,1540.0 L1308.1,1680.0" stroke="#e8c547" stroke-width="3" stroke-dasharray="14 10" fill="none"/></svg>
      </div>
      <div class="sombra" style="top:0; bottom:auto; height:30%; background: linear-gradient(to bottom, rgba(11,22,38,0.95), rgba(11,22,38,0));"></div>
      <div id="s1-t" class="oro alto" style="top:240px; font-size:92px;">el día se volvió noche</div>
      <div id="s1-n" class="rot" style="top:1700px; font-size:30px; letter-spacing:0.1em;">franja aproximada de la totalidad</div>
    </div>
    <video id="v-nasa" class="clip vid" src="assets/clips/C01_nasa-eclipse.mp4" data-start="6.3" data-duration="2.6" data-media-start="17" muted playsinline></video>
    <div id="s2t" class="clip shot" data-start="6.3" data-duration="2.6" style="background: transparent;"><div class="rot" style="top:220px; font-size:30px; letter-spacing:0.1em;">eclipse total · imagen de 2024 (NASA)</div></div>
    <div id="s3" class="clip shot" data-start="8.9" data-duration="5.4">
      <img id="s3-i" class="kb" src="assets/img/N18.jpg" style="object-position: 50% 50%;" alt="Corona del eclipse, Luc Viatour" /><div class="vig"></div>
      <div id="s3-a" class="perg alto" style="top:240px; font-size:110px;">1905</div>
      <div id="s3-b" class="oro alto" style="top:400px; font-size:150px;">2026</div>
    </div>
    <video id="v-via" class="clip vid" src="assets/clips/C08_mixkit-4148.mp4" data-start="14.3" data-duration="2.9" data-media-start="3" muted playsinline></video>
    <div id="s5" class="clip shot" data-start="17.2" data-duration="5.2" data-layout-allow-overflow>
      <img id="s5-f" class="kb" src="assets/img/N03-fondo.jpg" style="object-position: 50% 40%;" alt="" />
      <img id="s5-i" class="kb" src="assets/img/N03-figura.webp" style="object-position: 50% 40%;" alt="Retrato de Nostradamus" />
      <div class="vig"></div>
      <div id="tit1" class="tit2" style="top:250px; left:90px;"><i></i><b>¿Nostradamus predijo el eclipse de 2026?</b></div>
      <div id="tit2" class="tit2" style="top:470px; left:150px;"><i></i><b>Las 10 profecías de Nostradamus para este año</b></div>
      <div id="tit3" class="tit2" style="top:690px; left:70px;"><i></i><b>El eclipse que «anunció» Nostradamus</b></div>
      <div class="rot" style="top:1700px; font-size:24px; letter-spacing:0.05em; font-weight:500; font-style:italic;">titulares de ejemplo, creados para este video</div>
    </div>
    <video id="v-vela" class="clip vid" src="assets/clips/C05_mixkit-48919.mp4" data-start="22.4" data-duration="3.9" data-media-start="3" muted playsinline></video>
    <div id="s6t" class="clip shot" data-start="22.4" data-duration="3.9" style="background: transparent;"><div id="s6-t" class="perg alto" style="top:280px; font-size:96px;">¿Alguien leyó lo que escribió?</div></div>
    <div id="s7" class="clip shot" data-start="26.3" data-duration="6.0" data-layout-allow-overflow>
      <img class="kb" src="assets/img/N01-fondo.jpg" style="object-position: 50% 50%;" alt="" /><div class="vig"></div>
      <img id="s7-libro" src="assets/img/N01.jpg" alt="Les Prophéties, 1568" style="position:absolute; left:190px; top:230px; width:700px; height:1050px; object-fit:contain; border:6px solid #c9a227; background:#0f1b2d;" />
      <svg id="lupa" viewBox="0 0 100 100" style="position:absolute; left:380px; top:520px; width:320px; height:320px;"><circle cx="42" cy="42" r="26" fill="rgba(242,232,213,0.18)" stroke="#e8c547" stroke-width="7"/><path d="M62 62 L90 90" stroke="#e8c547" stroke-width="10" stroke-linecap="round"/></svg>
      <div id="s7-q" class="busq"><span>2026</span></div>
      <div class="rot" style="top:1310px; font-size:30px;">LES PROPHÉTIES · LYON 1568</div>
    </div>
    <video id="v-pag" class="clip vid" src="assets/clips/C06_mixkit-25185.mp4" data-start="32.3" data-duration="5.9" data-media-start="2" muted playsinline></video>
    <div id="s11" class="clip shot" data-start="32.9" data-duration="5.3" data-layout-allow-overflow style="background: rgba(15,27,45,0.82);">
      <div id="s11-r" class="rayos"></div>
      <div id="titulo" class="oro" style="top:540px; font-size:96px; letter-spacing:0.04em;">NOSTRADAMUS<br/>Y 2026</div><div id="linea" style="top:860px;"></div>
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

    sube("#s0-f", 0.2, 0.6); sube("#s0-p", 0.6, 0.5, 20);
    tl.fromTo("#mapa", {{ scale: 0.5754, x: 137.3, y: 113.2 }}, {{ scale: 1.0461, x: -295.9, y: -703.3, duration: 1.4, ease: "power2.inOut" }}, 2.4);
    tl.fromTo("#banda", {{ opacity: 0 }}, {{ opacity: 1, duration: 1.0 }}, 3.4);
    sube("#s1-t", 2.6, 0.5); sube("#s1-n", 4.0, 0.5, 10);
    kb("#s3-i", 8.9, 5.4, {{ scale: 1.15 }}, {{ scale: 1.3 }}); sube("#s3-a", 9.0, 0.5); sube("#s3-b", 13.6, 0.5);
    tl.fromTo("#s5-f", {{ scale: 1.05 }}, {{ scale: 1.1, duration: 5.2, ease: "none" }}, 17.2); tl.fromTo("#s5-i", {{ scale: 1.05 }}, {{ scale: 1.22, duration: 5.2, ease: "none" }}, 17.2);
    tl.fromTo(["#tit1", "#tit2", "#tit3"], {{ opacity: 0, y: 60 }}, {{ opacity: 1, y: 0, rotation: (i) => [-3, 2, -2][i], duration: 0.35, stagger: 0.5, ease: "back.out(1.6)" }}, 19.6);
    sube("#s6-t", 22.6, 0.6);
    tl.fromTo("#s7-libro", {{ opacity: 0, scale: 0.92 }}, {{ opacity: 1, scale: 1, duration: 0.5 }}, 26.3);
    tl.fromTo("#lupa", {{ x: -200, y: -150, opacity: 0 }}, {{ x: 120, y: 260, opacity: 1, duration: 2.5, ease: "sine.inOut" }}, 27.4);
    tl.to("#lupa", {{ x: -60, y: 120, duration: 1.4, ease: "sine.inOut" }}, 29.9);
    tl.fromTo("#s7-q", {{ opacity: 0, scale: 0.8 }}, {{ opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }}, 31.2);
    tl.fromTo("#s11", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.5 }}, 32.9);
    tl.fromTo("#titulo", {{ opacity: 0, scale: 1.15 }}, {{ opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }}, 33.0);
    tl.fromTo("#linea", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.6 }}, 33.4); tl.fromTo("#s11-r", {{ opacity: 0 }}, {{ opacity: 0.9, duration: 1.5 }}, 32.9);
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
    <title>Nostradamus · Short</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>* {{ margin: 0; padding: 0; box-sizing: border-box; }} html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #0f1b2d; }}
      #cortina {{ position: absolute; inset: 0; background: #000; opacity: 0; z-index: 50; }}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{FIN}" data-width="1080" data-height="1920">
      <div id="short" data-composition-id="short" data-composition-src="compositions/short.html" data-start="0" data-duration="{FIN}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="cortina" class="clip" data-start="{FIN - 0.6:.2f}" data-duration="0.6" data-track-index="5"></div>
      <audio id="voz" class="clip" src="assets/audio/voz-gancho.mp3" data-start="0" data-duration="38.3" data-volume="1" data-track-index="10"></audio>
      <!-- Música: «Lightless Dawn», Kevin MacLeod (incompetech.com), CC BY 4.0 -->
      <audio id="musica" class="clip" src="assets/musica/lightless-dawn.mp3" data-start="0" data-duration="{FIN}" data-volume="0.55" data-fade-in="1" data-fade-out="1.5" data-track-index="9"></audio>
      <audio id="sfx1" class="clip" src="assets/sfx/whoosh-cinematic.mp3" data-start="2.2" data-duration="4" data-volume="0.3" data-track-index="11"></audio>
      <audio id="sfx2" class="clip" src="assets/sfx/impact-bass-2.mp3" data-start="6.3" data-duration="2.5" data-volume="0.35" data-track-index="12"></audio>
      <audio id="sfx3" class="clip" src="assets/sfx/whoosh-short.mp3" data-start="19.6" data-duration="0.57" data-volume="0.25" data-track-index="13"></audio>
      <audio id="sfx4" class="clip" src="assets/sfx/whoosh.mp3" data-start="27.4" data-duration="0.57" data-volume="0.25" data-track-index="11"></audio>
      <audio id="sfx5" class="clip" src="assets/sfx/impact-bass-2.mp3" data-start="32.9" data-duration="2.5" data-volume="0.4" data-track-index="12"></audio>
      <audio id="sfx6" class="clip" src="assets/sfx/whoosh-cinematic.mp3" data-start="{FIN_VOZ - 0.2}" data-duration="4" data-volume="0.25" data-track-index="13"></audio>
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

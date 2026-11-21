import json
B = "/home/user/Videos-YT-/trabajo/nefilim"
o = json.load(open(f"{B}/gen/salida.json")); FIN = round(o["fin"], 2)
secs = o["secciones"]
hosts = [('gancho', 0, 44.6), ('intro', 44.6, round(secs[0][1] - 44.6, 3))]
for k, (nm, t0) in enumerate(secs):
    t1 = secs[k + 1][1] if k + 1 < len(secs) else FIN
    hosts.append((nm, round(t0, 3), round(t1 - t0, 3)))
H = "\n".join(f'''      <div id="{nm}" data-composition-id="{nm}" data-composition-src="compositions/{nm}.html"
        data-start="{a}" data-duration="{d}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>''' for nm, a, d in hosts)
fijos = [("whoosh-cinematic", 10.3, 0.3, 4), ("impact-bass-2", 15.75, 0.35, 2.5), ("impact-bass-1", 17.45, 0.45, 2.1), ("whoosh-short", 19.7, 0.25, 0.57),
         ("whoosh", 21.0, 0.25, 0.57), ("whoosh-short", 22.1, 0.25, 0.57), ("whoosh", 31.5, 0.3, 0.57), ("impact-bass-2", 41.7, 0.4, 2.5),
         ("whoosh-short", 46.2, 0.25, 0.57), ("impact-bass-1", 58.65, 0.35, 2.1)]
DUR = {"whoosh-cinematic": 4, "impact-bass-1": 2.1, "impact-bass-2": 2.5, "whoosh-short": 0.57, "whoosh": 0.57}
sf = fijos + [(k, round(t, 2), v, DUR[k]) for k, t, v in o["sfx"]]
A = "\n".join(f'      <audio id="sfx{n}" class="clip" src="assets/sfx/{k}.mp3" data-start="{t}" data-duration="{d}" data-volume="{v}" data-track-index="{11 + n % 3}"></audio>' for n, (k, t, v, d) in enumerate(sf))
html = f'''<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Los Nefilim</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0f1b2d; }}
      #fondo {{ position: absolute; inset: 0; background: #0f1b2d; }}
      #cortina {{ position: absolute; inset: 0; background: #000; opacity: 0; z-index: 50; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{FIN}" data-width="1920" data-height="1080">
      <div id="fondo"></div>
{H}
      <div id="cortina" class="clip" data-start="{FIN - 1.2:.2f}" data-duration="1.2" data-track-index="5"></div>

      <!-- Voz en off completa: 8 bloques unidos con 0,6 s de silencio -->
      <audio id="voz" class="clip" src="assets/audio/voz.mp3" data-start="0" data-duration="894.25" data-volume="1" data-track-index="10"></audio>

      <!-- Música: «Lightless Dawn», Kevin MacLeod (incompetech.com), CC BY 4.0 · tres pasadas con fundido -->
      <audio id="musica1" class="clip" src="assets/musica/lightless-dawn.mp3" data-start="0" data-duration="379.8" data-volume="0.55" data-fade-in="1.5" data-fade-out="4" data-track-index="9"></audio>
      <audio id="musica2" class="clip" src="assets/musica/lightless-dawn.mp3" data-start="376" data-duration="379.8" data-volume="0.55" data-fade-in="4" data-fade-out="4" data-track-index="8"></audio>
      <audio id="musica3" class="clip" src="assets/musica/lightless-dawn.mp3" data-start="752" data-duration="{FIN - 752:.2f}" data-volume="0.55" data-fade-in="4" data-fade-out="3" data-track-index="9"></audio>

      <!-- Efectos (Pixabay, sin derechos, librería de HyperFrames) -->
{A}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      tl.fromTo("#cortina", {{ opacity: 0 }}, {{ opacity: 1, duration: 1.1, ease: "power1.in" }}, {FIN - 1.2:.2f});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
'''
open(f"{B}/proyecto/index.html", "w").write(html)
print(len(hosts), "escenas-host,", len(sf), "efectos, fin", FIN)

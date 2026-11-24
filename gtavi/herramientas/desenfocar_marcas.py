"""Desenfoca el arte oficial y los textos de marca en la grabación de la ruleta.

Qué se desenfoca (todo lo que no se protege):
  * Mientras gira (antes de T_RESULTADO): todo lo que está fuera de la ruleta (fondo con los personajes, logo de
    GTA VI, botón "UNLOCK MORE ATTEMPTS") y las imágenes de premio que giran con la ruleta (portadas y PayPal).
    Su posición se calcula con el mismo giro que usa la ruleta: ángulo = A0 + E * (1 - (1 - p)^4).
  * En la pantalla del premio (desde T_RESULTADO): todo menos los rectángulos de "proteger_premio"
    (el cartel SUPER WIN), así la portada, CLAIM y UNLOCK MORE ATTEMPTS quedan borrosos.
  * Mientras gira quedan nítidos los rectángulos de "proteger_giro" (la flecha) y siempre los de "proteger"
    (la línea "Giveaway rules at the link…").

Uso:
  python3 -I desenfocar_marcas.py video  CONFIG.json ENTRADA.mp4 SALIDA.mp4
  python3 -I desenfocar_marcas.py cuadro CONFIG.json ENTRADA.png SALIDA.png   (pantalla del premio, para el fondo)
  python3 -I desenfocar_marcas.py ajustar CONFIG.json ENTRADA.mp4             (busca T0, DUR y E con las imágenes)

CONFIG.json (coordenadas en el video ya vertical 1080x1920):
  {"centro": [537, 1263], "radio_ruleta": 400, "radio_premios": 255, "radio_mancha": 112,
   "angulos_premios": [-68.7, 21.3, 156.3, -113.0],   # grados en el cuadro 0, 0 = derecha, sentido horario
   "t0": 0.60, "dur": 5.65, "e_grados": 2998, "t_resultado": 6.267,
   "proteger_giro": [[495, 840, 585, 935]], "proteger": [[0, 1835, 1080, 1900]],
   "proteger_premio": [[195, 1160, 885, 1470]],
   "fuerza": 28}
"""
import json, math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS = 1080, 1920, 30


def giro(c, t):
    p = min(1.0, max(0.0, (t - c["t0"]) / c["dur"]))
    rot = c["e_grados"] * (1 - (1 - p) ** 4)
    vel = c["e_grados"] * 4 * (1 - p) ** 3 / c["dur"] if 0 < p < 1 else 0.0  # grados por segundo
    return rot, vel


def mascara(c, t):
    """Blanco = se desenfoca."""
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    cx, cy = c["centro"]
    if t < c["t_resultado"]:
        d.rectangle((0, 0, W, H), fill=255)
        r = c["radio_ruleta"]
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=0)
        rot, vel = giro(c, t)
        margen = 6 + 0.6 * vel / FPS  # cubre el desplazamiento de un cuadro cuando gira rápido
        rp, rm = c["radio_premios"], c["radio_mancha"]
        for x0, y0, x1, y1 in c.get("proteger_giro", []):
            d.rectangle((x0, y0, x1, y1), fill=0)
        for a0 in c["angulos_premios"]:
            a = a0 + rot - margen
            while a <= a0 + rot + margen:
                x, y = cx + rp * math.cos(math.radians(a)), cy + rp * math.sin(math.radians(a))
                d.ellipse((x - rm, y - rm, x + rm, y + rm), fill=255)
                a += 3
    else:
        d.rectangle((0, 0, W, H), fill=255)
        for x0, y0, x1, y1 in c["proteger_premio"]:
            d.rectangle((x0, y0, x1, y1), fill=0)
    for x0, y0, x1, y1 in c["proteger"]:
        d.rectangle((x0, y0, x1, y1), fill=0)
    return m.filter(ImageFilter.GaussianBlur(6))


def aplicar(c, img, t):
    borroso = img.filter(ImageFilter.GaussianBlur(c["fuerza"]))
    return Image.composite(borroso, img, mascara(c, t))


def video(c, entrada, salida):
    lee = subprocess.Popen(["ffmpeg", "-v", "error", "-i", entrada, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                           stdout=subprocess.PIPE)
    escribe = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                                "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "17", "-preset", "medium",
                                "-g", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart", salida],
                               stdin=subprocess.PIPE)
    n, tam = 0, W * H * 3
    while True:
        buf = lee.stdout.read(tam)
        if len(buf) < tam:
            break
        img = Image.frombytes("RGB", (W, H), buf)
        escribe.stdin.write(aplicar(c, img, n / FPS).tobytes())
        n += 1
    escribe.stdin.close(); escribe.wait(); lee.wait()
    print(f"Listo: {salida} ({n} cuadros)")


def ajustar(c, entrada):
    """Busca t0, dur y e_grados: las imágenes de premio tienen más bordes que las casillas lisas."""
    cx, cy, rp = c["centro"][0], c["centro"][1], c["radio_premios"]
    x0, y0 = cx - 400, cy - 400
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", entrada, "-vf", f"crop=800:800:{x0}:{y0},scale=200:200,format=gray",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    f = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 200, 200).astype(np.float32)
    g = np.abs(np.diff(f, axis=1))[:, :, :-1] + np.abs(np.diff(f, axis=2))[:, :-1, :]
    cuadros = [i for i in range(len(f)) if c["t0"] + 0.9 <= i / FPS <= c["t_resultado"] - 0.05]
    def nota(t0, dur, e):
        s = 0.0
        for i in cuadros:
            p = min(1, max(0, (i / FPS - t0) / dur)); rot = e * (1 - (1 - p) ** 4)
            for a in c["angulos_premios"]:
                x = int(round(100 + rp / 4 * math.cos(math.radians(a + rot))))
                y = int(round(100 + rp / 4 * math.sin(math.radians(a + rot))))
                s += g[i][y - 8:y + 9, x - 8:x + 9].mean()
        return s
    mejores = []
    base = c["e_grados"]
    for de in range(-8, 9, 2):
        for t0 in np.arange(c["t0"] - 0.08, c["t0"] + 0.09, 0.02):
            for dur in np.arange(5.45, 5.81, 0.05):
                mejores.append((nota(t0, dur, base + de), base + de, round(float(t0), 2), round(float(dur), 2)))
    mejores.sort(reverse=True)
    for m in mejores[:5]:
        print(f"nota={m[0]:.0f}  e_grados={m[1]}  t0={m[2]}  dur={m[3]}")


if __name__ == "__main__":
    modo, cfg = sys.argv[1], json.load(open(sys.argv[2]))
    if modo == "video":
        video(cfg, sys.argv[3], sys.argv[4])
    elif modo == "cuadro":
        aplicar(cfg, Image.open(sys.argv[3]).convert("RGB"), cfg["t_resultado"] + 1).save(sys.argv[4])
        print("Listo:", sys.argv[4])
    elif modo == "ajustar":
        ajustar(cfg, sys.argv[3])

"""Pega la carátula de GTA VI y el nombre dentro de cada cuadro del inicio de Roblox,
siguiendo la casilla "99 noches en el bosque" con precisión de subpíxel."""
import subprocess, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ENT, SAL, ICONO = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1080, 1920
lee = subprocess.run(["ffmpeg","-v","error","-i",ENT,"-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True).stdout
F = np.frombuffer(lee, np.uint8).reshape(-1, H, W, 3)
N = len(F); print("cuadros", N)
G = F.astype(np.float32).mean(axis=3)
# plantilla: imagen del ciervo a los 2,0 s (cuadro 60), x 62..310, y 666..914
T = G[60][666:914, 62:310]
def sad(f, y):
    h = min(248, H - y)
    if h < 80: return 1e9
    return np.abs(f[y:y+h, 62:310] - T[:h]).mean()
pos = {}
prev = None
for i in range(0, 70):                     # hasta 2,3 s (antes de que suba la hoja)
    f = G[i]
    rng = range(500, H - 80, 4) if prev is None else range(max(0, prev - 140), min(H - 80, prev + 140), 2)
    y0 = min(rng, key=lambda y: sad(f, y))
    best = min(range(max(0, y0 - 4), y0 + 5), key=lambda y: sad(f, y))
    a, b, c = sad(f, best - 1), sad(f, best), sad(f, best + 1)
    den = a - 2*b + c
    sub = 0.5 * (a - c) / den if den > 1e-6 else 0.0
    pos[i] = best + max(-.5, min(.5, sub)) - 11   # 666 -> 655 (tope de la imagen)
    prev = best
    print(f"{i/30:.3f} y={pos[i]:.2f} err={b:.2f}")
for i in range(70, N): pos[i] = 655.0
# casilla nueva (carátula + nombre) en un lienzo; se pega con desplazamiento subpíxel
CW, CH = 310, 420
tile = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
ic = Image.open(ICONO).convert("RGB").resize((275, 276), Image.LANCZOS)
m = Image.new("L", (275*4, 276*4), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 275*4-1, 276*4-1), radius=23*4, fill=255)
m = m.resize((275, 276), Image.LANCZOS)
tile.paste(ic, (5, 4), m)                                   # icono en x 49..324, y 654..930
lab = Image.new("RGBA", (300, 110), (255, 255, 255, 255)); d = ImageDraw.Draw(lab)
fnt = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 35)
d.text((6, 6), "Grand Theft", font=fnt, fill=(24, 24, 28)); d.text((6, 50), "Auto VI", font=fnt, fill=(24, 24, 28))
tile.paste(lab, (0, 293))                                   # tapa el nombre viejo (y 948..1058)
OX = 44                                                     # x del lienzo en el video
def hoja_tope(i):  # tope de la hoja (px del video) mientras sube, medido antes
    return {70:1230, 71:1060, 72:861, 73:742, 74:674}.get(i, 0 if i >= 75 else H)
out = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r","30","-i","-",
    "-c:v","libx264","-crf","17","-preset","medium","-g","15","-pix_fmt","yuv420p","-movflags","+faststart",SAL], stdin=subprocess.PIPE)
for i in range(N):
    fr = Image.fromarray(F[i]).convert("RGBA")
    if i < 75:
        y = pos[i] - 4; iy = int(np.floor(y)); fy = y - iy
        t = tile.transform(tile.size, Image.AFFINE, (1, 0, 0, 0, 1, -fy), resample=Image.BILINEAR) if fy > 1e-3 else tile
        if i >= 70:   # oscurecido de la hoja (medido sobre el blanco junto a la casilla)
            k = {70: 160/255, 71: 123/255}.get(i, 123/255)   # brillo del blanco del inicio medido en la grabación
            arr = np.array(t).astype(np.float32); arr[..., :3] *= k; t = Image.fromarray(arr.astype(np.uint8), "RGBA")
            top = hoja_tope(i) - iy
            if top < CH:
                arr = np.array(t); arr[max(0, top):, :, 3] = 0; t = Image.fromarray(arr, "RGBA")
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); lay.paste(t, (OX, iy)); fr = Image.alpha_composite(fr, lay)
    out.stdin.write(fr.convert("RGB").tobytes())
out.stdin.close(); out.wait(); print("listo", SAL)

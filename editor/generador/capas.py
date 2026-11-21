# Separa una pintura en dos capas para el efecto de profundidad:
#   <id>-fondo.jpg  copia desenfocada y algo más oscura (va detrás y se mueve lento)
#   <id>-figura.png la figura recortada con bordes suaves (va delante y se mueve más)
import json, sys
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
src, outdir, ident, shapes = sys.argv[1], sys.argv[2], sys.argv[3], json.loads(sys.argv[4])
im = Image.open(src).convert("RGB")
im.thumbnail((2600, 2600), Image.LANCZOS)
w, h = im.size
mask = Image.new("L", (w, h), 0); d = ImageDraw.Draw(mask)
for s in shapes:
    d.polygon([(x * w, y * h) for x, y in s], fill=255)
feather = max(w, h) / 160
mask = mask.filter(ImageFilter.GaussianBlur(feather))
fig = im.copy(); fig.putalpha(mask)
fig.save(f"{outdir}/{ident}-figura.png", optimize=True)
fondo = im.filter(ImageFilter.GaussianBlur(max(w, h) / 220))
fondo = ImageEnhance.Brightness(fondo).enhance(0.78)
fondo.save(f"{outdir}/{ident}-fondo.jpg", quality=86)
print(ident, w, h)

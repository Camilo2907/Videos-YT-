# Mapa base (Natural Earth, dominio público) en proyección equirectangular simple.
import json, math, sys
D = sys.argv[1]; OUT = sys.argv[2]
LON0, LON1, LAT0, LAT1 = 24, 62, 4, 42
K = 100; C = math.cos(math.radians(31))
W, H = round((LON1-LON0)*K*C), (LAT1-LAT0)*K
def P(lon, lat): return ((lon-LON0)*K*C, (LAT1-lat)*K)
def inside(coords):
    return any(LON0-3 <= x <= LON1+3 and LAT0-3 <= y <= LAT1+3 for x, y in coords)
def ring_path(r):
    pts = [P(x, y) for x, y in r]
    return "M" + "L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + "Z"
def line_path(r):
    pts = [P(x, y) for x, y in r]
    return "M" + "L".join(f"{a:.1f},{b:.1f}" for a, b in pts)
def polys(fname, filt=None):
    out = []
    for f in json.load(open(f"{D}/{fname}"))["features"]:
        if filt and not filt(f["properties"]): continue
        g = f["geometry"]; gs = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        for poly in gs:
            if inside(poly[0]): out.append("".join(ring_path(r) for r in poly))
    return out
def lines(fname, names):
    out = []
    for f in json.load(open(f"{D}/{fname}"))["features"]:
        n = (f["properties"].get("name") or "")
        if n not in names: continue
        g = f["geometry"]; gs = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
        for l in gs:
            if inside(l): out.append(line_path(l))
    return out
land = polys("ne_50m_land.geojson")
lakes = polys("ne_10m_lakes.geojson", lambda p: (p.get("name") or "") in ("Dead Sea", "Sea of Galilee", "Lake Tana", "Lake Van", "Lake Urmia"))
rivers = lines("ne_50m_rivers_lake_centerlines.geojson", {"Euphrates", "Tigris", "Nile", "Jordan", "Blue Nile", "Shatt al Arab"})
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<rect width="{W}" height="{H}" fill="#0b1626"/>
<g fill="#1d3050" stroke="#c9a227" stroke-opacity="0.55" stroke-width="2.2" stroke-linejoin="round">{"".join(f'<path d="{d}"/>' for d in land)}</g>
<g fill="none" stroke="#5f86b8" stroke-opacity="0.7" stroke-width="2.4" stroke-linecap="round">{"".join(f'<path d="{d}"/>' for d in rivers)}</g>
<g fill="#0b1626" stroke="#5f86b8" stroke-opacity="0.8" stroke-width="1.6">{"".join(f'<path d="{d}"/>' for d in lakes)}</g>
</svg>'''
open(OUT, "w").write(svg)
print(W, H, len(land), len(lakes), len(rivers), round(len(svg)/1024), "KB")

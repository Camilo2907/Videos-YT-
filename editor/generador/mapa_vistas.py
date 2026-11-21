import math
LON0, LAT1, K = 24, 42, 100
C = math.cos(math.radians(31))
def proy(lon, lat): return ((lon - LON0) * K * C, (LAT1 - lat) * K)
VISTAS = {
    "levante": (33.6, 37.6, 29.9, 34.2),
    "golan":   (34.9, 37.0, 31.9, 33.6),
    "qumran":  (34.7, 36.3, 31.0, 32.5),
    "sinai":   (32.2, 37.0, 28.8, 33.2),
    "region":  (29.0, 50.0, 25.0, 38.5),
    "amplio":  (28.0, 58.0, 5.0, 38.0),
}
def transf(v):
    lo0, lo1, la0, la1 = v
    x0, y0 = proy(lo0, la1); x1, y1 = proy(lo1, la0)
    s = min(1920 / (x1 - x0), 1080 / (y1 - y0))
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return round(s, 4), round(960 - cx * s, 1), round(540 - cy * s, 1)

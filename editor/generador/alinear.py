# Lee el guion visual y la transcripción con tiempos; devuelve el inicio real de cada escena.
import json, re, unicodedata, sys
BASE = "/home/user/Videos-YT-/trabajo/nostradamus"
BLOQUES = ["01-gancho","02-capitulo-1","03-capitulo-2","04-capitulo-3","05-capitulo-4","06-giro","07-cierre"]
DUR = [38.217143,98.298776,111.151020,136.228571,119.040000,94.615510,62.354286]
OFF = []; t = 0
for d in DUR: OFF.append(t); t += d + 0.6
NUM = {"0":"cero","1":"uno","2":"dos","3":"tres","4":"cuatro","5":"cinco","6":"seis","7":"siete","8":"ocho","9":"nueve","10":"diez","11":"once","12":"doce","120":"ciento","1503":"mil","1555":"mil","1566":"mil","1568":"mil","1999":"mil","2026":"dos","1905":"mil","353":"trescientas","942":"novecientas","1559":"mil"}
def norm(w):
    w = unicodedata.normalize("NFD", w.lower()); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    w = re.sub(r"[^a-z0-9ñ]", "", w); return NUM.get(w, w)
def palabras():
    out = []
    for i, b in enumerate(BLOQUES):
        for line in open(f"{BASE}/tiempos/{b}.jsonl"):
            try: d = json.loads(line)
            except: continue
            if d.get("type") == "words":
                for w in d["words"]:
                    n = norm(w["text"])
                    if n: out.append({"w": n, "raw": w["text"], "s": w["start"] + OFF[i], "e": w["end"] + OFF[i], "b": i})
    return out
def escenas():
    out = []; sec = None
    for line in open(f"{BASE}/gen/guion-visual.md"):
        if line.startswith("## "): sec = line[3:].strip()
        m = re.match(r"\|\s*(\d+)\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|", line)
        if m:
            n, tiempo, narr, clip, img, mg, mov = [x.strip() for x in m.groups()]
            out.append(dict(n=int(n), sec=sec, narr=narr, clip=clip.strip("* "), img=img, mg=mg, mov=mov))
    return out
def parecido(a, b):
    return a == b or (len(a) >= 4 and len(b) >= 4 and a[:4] == b[:4])
def alinear():
    import difflib
    W = palabras(); E = escenas()
    flat, owner = [], []
    for k, e in enumerate(E):
        toks = [norm(x) for x in re.sub(r"\*.*?\*", "", e["narr"]).split()]
        toks = [x for x in toks if x]; e["toks"] = toks
        for t in toks: flat.append(t); owner.append(k)
    vw = [w["w"] for w in W]
    sm = difflib.SequenceMatcher(None, flat, vw, autojunk=False)
    mapa = {}
    for a, b, size in sm.get_matching_blocks():
        for q in range(size): mapa[a + q] = b + q
    pos = 0
    for k, e in enumerate(E):
        n = len(e["toks"])
        if not n: e["t"] = None; e["score"] = None; continue
        idxs = list(range(pos, pos + n)); pos += n
        hits = [(q - idxs[0], mapa[q]) for q in idxs if q in mapa]
        e["score"] = len(hits)
        if hits:
            off, wi = hits[0]
            # retrocede las palabras previas no encontradas (~0,35 s cada una)
            e["t"] = max(0.0, W[wi]["s"] - 0.35 * off); e["wi"] = wi
        else:
            e["t"] = None
    # escenas sin coincidencias: se interpolan entre vecinas
    for k, e in enumerate(E):
        if e["t"] is None and e["toks"]:
            prev = next((E[q]["t"] for q in range(k - 1, -1, -1) if E[q]["t"] is not None), 0.0)
            nxt = next((E[q]["t"] for q in range(k + 1, len(E)) if E[q]["t"] is not None), prev + 4)
            e["t"] = (prev + nxt) / 2
    return E, W
if __name__ == "__main__":
    E, W = alinear()
    for e in E:
        flag = "" if e["t"] is None or (e["score"] or 0) >= 2 else "  <-- REVISAR"
        print(e["n"], e["t"] and round(e["t"], 2), e.get("score"), e["narr"][:50], flag)

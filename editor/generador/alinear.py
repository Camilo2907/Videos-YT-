# Lee el guion visual y la transcripción con tiempos; devuelve el inicio real de cada escena.
import json, re, unicodedata, sys
BASE = "/home/user/Videos-YT-/trabajo/nefilim"
BLOQUES = ["01-gancho","02-intro","03-capitulo-1","04-capitulo-2","05-capitulo-3","06-capitulo-4","07-giro","08-cierre"]
DUR = [42.475102,69.198367,155.036735,184.999184,147.356735,121.861224,104.124082,65.253878]
OFF = []; t = 0
for d in DUR: OFF.append(t); t += d + 0.6
NUM = {"0":"cero","1":"uno","2":"dos","3":"tres","4":"cuatro","5":"cinco","6":"seis","7":"siete","8":"ocho","9":"nueve","10":"diez","11":"once","12":"doce","120":"ciento"}
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
    W = palabras(); E = escenas(); p = 0
    for e in E:
        toks = [norm(x) for x in re.sub(r"\*.*?\*", "", e["narr"]).split()]
        toks = [x for x in toks if x]
        e["toks"] = toks
        if not toks: e["t"] = None; continue
        best = None
        for i in range(p, min(len(W), p + 80)):
            k = sum(1 for j, tk in enumerate(toks[:5]) if i + j < len(W) and parecido(W[i + j]["w"], tk))
            if best is None or k > best[0] or (k == best[0] and False): best = (k, i)
            if k >= min(4, len(toks)): best = (k, i); break
        if best is None: e['t'] = None; e['score'] = 0; continue
        k, i = best
        e["t"] = W[i]["s"]; e["wi"] = i; e["score"] = k
        p = i + max(1, len(toks) // 2)
    return E, W
if __name__ == "__main__":
    E, W = alinear()
    for e in E:
        flag = "" if e["t"] is None or e["score"] >= 3 else "  <-- REVISAR"
        print(e["n"], e["t"] and round(e["t"], 2), e.get("score"), e["narr"][:50], flag)

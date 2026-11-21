    const sube = (sel, t, d = 0.6, y = 40) => tl.fromTo(sel, { opacity: 0, y }, { opacity: 1, y: 0, duration: d, ease: "power3.out" }, t);
    // ---- partículas deterministas: dependen solo del tiempo del timeline ----
    const semilla = (s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const sprites = {};
    const sprite = (color) => {
      if (sprites[color]) return sprites[color];
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, color); r.addColorStop(0.25, color.replace(/[\d.]+\)$/, "0.55)")); r.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
      g.fillStyle = r; g.fillRect(0, 0, 64, 64); return (sprites[color] = c);
    };
    const TIPOS = {
      polvo:   { col: "rgba(242,232,213,0.9)", v: [6, 22],   s: [3, 9],   a: [0.15, 0.5], dir: -0.3, osc: 40 },
      brasas:  { col: "rgba(255,170,70,1)",    v: [60, 160], s: [5, 14],  a: [0.4, 0.95], dir: -1, osc: 60 },
      nieve:   { col: "rgba(255,255,255,0.95)",v: [50, 120], s: [5, 12],  a: [0.4, 0.9], dir: 1, osc: 50 },
      chispas: { col: "rgba(232,200,90,1)",    v: [90, 220], s: [4, 10],  a: [0.4, 1], dir: -1, osc: 30 },
      luces:   { col: "rgba(232,200,90,1)",    v: [40, 110], s: [8, 18],  a: [0.4, 0.95], dir: 1, osc: 25 },
    };
    const particulas_el = (cv, t0, dur, tipo, n = 90, seed = 7, color = null) => {
      if (!cv) return;
      const ctx = cv.getContext("2d"); const rnd = semilla(seed); const cfg = TIPOS[tipo];
      const P = Array.from({ length: n }, () => ({
        x: rnd() * 1920, y: rnd() * 1080, v: cfg.v[0] + rnd() * (cfg.v[1] - cfg.v[0]),
        s: cfg.s[0] + rnd() * (cfg.s[1] - cfg.s[0]), a: cfg.a[0] + rnd() * (cfg.a[1] - cfg.a[0]), f: rnd() * 6.28, w: 0.3 + rnd() * 0.9,
      }));
      const img = sprite(color || cfg.col); const reloj = { t: 0 };
      tl.fromTo(reloj, { t: 0 }, { t: dur, duration: dur, ease: "none", onUpdate: () => {
        const u = reloj.t; ctx.clearRect(0, 0, 1920, 1080);
        for (const p of P) {
          const y = ((p.y + cfg.dir * p.v * u) % 1180 + 1180) % 1180 - 50;
          const x = p.x + Math.sin(p.f + u * p.w) * cfg.osc + (tipo === "polvo" ? u * 8 : 0);
          const parpadeo = tipo === "brasas" || tipo === "chispas" || tipo === "luces" ? 0.55 + 0.45 * Math.sin(p.f * 3 + u * 5 * p.w) : 1;
          ctx.globalAlpha = p.a * parpadeo; const d = p.s * 2.4; ctx.drawImage(img, x - d / 2, y - d / 2, d, d);
        }
      } }, t0);
    };
    const particulas = (id, t0, dur, tipo, n, seed) => particulas_el(document.getElementById(id), t0, dur, tipo, n, seed);
    // capas con profundidad: el fondo desenfocado se mueve poco, la figura se acerca más
    const profundidad = (fondo, figura, t, d, o = {}) => {
      const s0 = o.s0 ?? 1.06, sf = o.sf ?? 1.12, sg = o.sg ?? 1.26, dx = o.dx ?? 0, dy = o.dy ?? 0;
      tl.fromTo(fondo, { scale: s0, xPercent: 0, yPercent: 0 }, { scale: sf, xPercent: -dx * 0.4, yPercent: -dy * 0.4, duration: d, ease: "none" }, t);
      tl.fromTo(figura, { scale: s0, xPercent: 0, yPercent: 0 }, { scale: sg, xPercent: dx, yPercent: dy, duration: d, ease: "none" }, t);
    };
    const contador = (sel, t, d, n) => {
      const o = { v: 0 }; const el = document.querySelector(sel);
      tl.fromTo(o, { v: 0 }, { v: n, duration: d, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("es-ES").replace(",", "."); } }, t);
    };
    const puntosLuz = (cv, t0, dur, n) => {
      if (!cv) return; const ctx = cv.getContext("2d"); const rnd = semilla(n); const img = sprite("rgba(232,200,90,1)");
      const P = Array.from({ length: n }, () => ({ x: 140 + rnd() * 1640, y: 90 + rnd() * 900, s: 6 + rnd() * 10, f: rnd() * 6.28 }));
      const reloj = { t: 0 };
      tl.fromTo(reloj, { t: 0 }, { t: dur, duration: dur, ease: "none", onUpdate: () => {
        ctx.clearRect(0, 0, 1920, 1080); const vis = Math.min(n, Math.floor(n * reloj.t / 1.6));
        for (let k = 0; k < vis; k++) { const p = P[k]; ctx.globalAlpha = 0.45 + 0.35 * Math.sin(p.f + reloj.t * 3); const d = p.s * 2.4; ctx.drawImage(img, p.x - d / 2, p.y - d / 2, d, d); }
      } }, t0);
    };

// Figura humana paramétrica de perfil (mira hacia la derecha).
// Cada segmento se orienta con el ángulo medido, así la ilustración cambia en vivo.
import type { ColorRiesgo, Segmento } from '../methods/common';

export interface Postura {
  tronco: number; // flexión (+) / extensión (−) respecto a la vertical
  cuello: number; // flexión (+) / extensión (−) respecto al tronco
  brazo: number; // flexión (+) / extensión (−) respecto al tronco
  antebrazo: number; // flexión del codo
  muneca: number; // flexión (+) / extensión (−)
  rodilla: number; // flexión de rodillas
  sentado?: boolean;
}

type P = [number, number];
const rad = (g: number) => (g * Math.PI) / 180;
/** Dirección con ángulo absoluto medido desde «hacia abajo», positivo hacia delante. */
const dir = (a: number): P => [Math.sin(rad(a)), Math.cos(rad(a))];
const mas = (p: P, a: number, l: number): P => {
  const d = dir(a);
  return [p[0] + d[0] * l, p[1] + d[1] * l];
};

export function Figura({
  postura,
  resaltar,
  colores = {},
  tamano = 120,
  titulo,
}: {
  postura: Postura;
  resaltar?: Segmento;
  colores?: Partial<Record<Segmento, ColorRiesgo>>;
  tamano?: number;
  titulo?: string;
}) {
  const { tronco: t, cuello: c, brazo: a, antebrazo: e, muneca: w, rodilla: k, sentado } = postura;
  const cadera: P = [0, 0];
  const hombro = mas(cadera, 180 - t, 62);
  const cuelloSup = mas(hombro, 180 - (t + c), 10);
  const cabeza = mas(cuelloSup, 180 - (t + c), 14);
  const absBrazo = -t + a;
  const codo = mas(hombro, absBrazo, 40);
  const absAnte = absBrazo + e;
  const munecaP = mas(codo, absAnte, 36);
  const mano = mas(munecaP, absAnte + w, 12);
  const absMuslo = sentado ? 90 : k / 2;
  const absPierna = sentado ? 0 : k / 2 - k;
  const rodillaP = mas(cadera, absMuslo, 48);
  const tobillo = mas(rodillaP, absPierna, 46);
  const pie = mas(tobillo, 90, 16);

  const pts = [cadera, hombro, cuelloSup, codo, munecaP, mano, rodillaP, tobillo, pie];
  const xs = [...pts.map((p) => p[0]), cabeza[0] - 14, cabeza[0] + 14];
  const ys = [...pts.map((p) => p[1]), cabeza[1] - 14, cabeza[1] + 14];
  const pad = 12;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w0 = Math.max(...xs) - minX + pad;
  const h0 = Math.max(...ys) - minY + pad;
  const lado = Math.max(w0, h0);
  const vb = `${minX - (lado - w0) / 2} ${minY - (lado - h0) / 2} ${lado} ${lado}`;

  const color = (s: Segmento) => (resaltar === s ? 'var(--acento)' : colores[s] ? `var(--r-${colores[s]})` : 'var(--tenue)');
  const grosor = (s: Segmento) => (resaltar === s ? 9 : 7);
  const linea = (p1: P, p2: P, s: Segmento) => (
    <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={color(s)} strokeWidth={grosor(s)} strokeLinecap="round" />
  );

  return (
    <svg viewBox={vb} width={tamano} height={tamano} role="img" aria-label={titulo ?? 'Figura de la postura evaluada'}>
      <line x1={minX - lado} y1={tobillo[1] + 5} x2={minX + 2 * lado} y2={tobillo[1] + 5} stroke="var(--linea)" strokeWidth={2} />
      {sentado && <rect x={cadera[0] - 22} y={cadera[1] + 4} width={46} height={6} rx={2} fill="var(--linea)" />}
      {linea(cadera, rodillaP, 'piernas')}
      {linea(rodillaP, tobillo, 'piernas')}
      {linea(tobillo, pie, 'piernas')}
      {linea(cadera, hombro, 'tronco')}
      {linea(hombro, cuelloSup, 'cuello')}
      <circle cx={cabeza[0]} cy={cabeza[1]} r={13} fill="var(--superficie)" stroke={color('cuello')} strokeWidth={resaltar === 'cuello' ? 5 : 4} />
      {linea(hombro, codo, 'brazo')}
      {linea(codo, munecaP, 'antebrazo')}
      {linea(munecaP, mano, 'muneca')}
      {[hombro, codo, munecaP, cadera, rodillaP].map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--superficie)" />
      ))}
    </svg>
  );
}

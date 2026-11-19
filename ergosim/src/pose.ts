// Detección de pose en el navegador con MediaPipe Pose Landmarker (gratuito, sin clave).
// Se usa cuando la página NO está dentro de claude.ai (por ejemplo, el archivo HTML descargado).
// Mide en el plano de la imagen (2D) los ángulos de tronco, cuello, brazo, antebrazo, muñeca y rodillas.
// Lo que no se ve en una foto (carga, agarre, giros, frecuencia) se deja como estaba para que el evaluador lo complete.
import type { Metodo } from './store';
import type { Punto, ResultadoIA } from './ia';
import { validarRespuesta } from './ia';

const VERSION = '0.10.14';
const BUNDLE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/vision_bundle.mjs`;
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODELO = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

interface Lm {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}
type Detector = { detect: (img: HTMLImageElement) => { landmarks: Lm[][] } };

let cargando: Promise<Detector> | null = null;

export function cargarDetector(): Promise<Detector> {
  if (!cargando) {
    cargando = (async () => {
      const mod = await import(/* @vite-ignore */ BUNDLE);
      const vision = await mod.FilesetResolver.forVisionTasks(WASM);
      return mod.PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODELO, delegate: 'CPU' },
        runningMode: 'IMAGE',
        numPoses: 1,
      }) as Promise<Detector>;
    })();
    cargando.catch(() => {
      cargando = null;
    });
  }
  return cargando;
}

// Índices del modelo de 33 puntos (izquierda/derecha de la PERSONA)
const I = {
  nariz: 0,
  oreja: { izq: 7, der: 8 },
  hombro: { izq: 11, der: 12 },
  codo: { izq: 13, der: 14 },
  muneca: { izq: 15, der: 16 },
  indice: { izq: 19, der: 20 },
  cadera: { izq: 23, der: 24 },
  rodilla: { izq: 25, der: 26 },
  tobillo: { izq: 27, der: 28 },
};

type V = [number, number];
const grados = (r: number) => (r * 180) / Math.PI;
/** Ángulo de un vector respecto a la vertical hacia arriba; positivo = hacia delante. */
const desdeArriba = (v: V, adelante: number) => grados(Math.atan2(v[0] * adelante, -v[1]));
/** Ángulo de un vector respecto a la vertical hacia abajo; positivo = hacia delante. */
const desdeAbajo = (v: V, adelante: number) => grados(Math.atan2(v[0] * adelante, v[1]));
const resta = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const norm180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
/** Ángulo interior en el vértice b (0–180). */
function interior(a: V, b: V, c: V) {
  const u = resta(a, b);
  const w = resta(c, b);
  const cos = (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w) || 1);
  return grados(Math.acos(Math.max(-1, Math.min(1, cos))));
}
const r = (n: number) => Math.round(n);

export interface Medidas {
  tronco: number;
  cuello: number;
  brazo: number;
  antebrazo: number;
  muneca: number;
  rodilla: number;
  sentado: boolean;
  visibilidad: number;
}

function medirLado(lm: Lm[], lado: 'izq' | 'der', W: number, H: number, adelante: number): Medidas {
  const p = (i: number): V => [lm[i].x * W, lm[i].y * H];
  const hombro = p(I.hombro[lado]);
  const cadera = p(I.cadera[lado]);
  const codo = p(I.codo[lado]);
  const muneca = p(I.muneca[lado]);
  const indice = p(I.indice[lado]);
  const rodilla = p(I.rodilla[lado]);
  const tobillo = p(I.tobillo[lado]);
  const oreja = p(I.oreja[lado]);
  const troncoV = resta(hombro, cadera);
  const tronco = desdeArriba(troncoV, adelante);
  const cuello = norm180(desdeArriba(resta(oreja, hombro), adelante) - tronco);
  const brazo = norm180(desdeAbajo(resta(codo, hombro), adelante) - desdeAbajo(resta(cadera, hombro), adelante));
  const antebrazo = 180 - interior(hombro, codo, muneca);
  const muneca2 = norm180(desdeAbajo(resta(indice, muneca), adelante) - desdeAbajo(resta(muneca, codo), adelante));
  const rodillaFlex = 180 - interior(cadera, rodilla, tobillo);
  const muslo = Math.abs(desdeAbajo(resta(rodilla, cadera), adelante));
  const ids = [I.hombro[lado], I.codo[lado], I.muneca[lado], I.cadera[lado], I.rodilla[lado]];
  const visibilidad = ids.reduce((s, i) => s + (lm[i].visibility ?? 0), 0) / ids.length;
  return { tronco, cuello, brazo, antebrazo, muneca: muneca2, rodilla: rodillaFlex, sentado: muslo > 55, visibilidad };
}

export async function analizarConMediapipe(m: Metodo, img: HTMLImageElement, actual: Record<string, unknown>): Promise<ResultadoIA> {
  const det = await cargarDetector();
  const res = det.detect(img);
  const lm = res.landmarks?.[0];
  if (!lm) throw { code: 'sin_persona' };
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const hombroMedio = (lm[11].x + lm[12].x) / 2;
  const adelante = lm[I.nariz].x >= hombroMedio ? 1 : -1; // hacia dónde mira la persona en la foto
  const izq = medirLado(lm, 'izq', W, H, adelante);
  const der = medirLado(lm, 'der', W, H, adelante);
  const visible: 'izq' | 'der' = izq.visibilidad > der.visibilidad ? 'izq' : 'der';
  const v = visible === 'izq' ? izq : der;
  const otro = visible === 'izq' ? der : izq;
  const otroUsable = otro.visibilidad > 0.6;
  const ladoVisible = otroUsable ? 'ambos' : visible;
  const sentado = v.sentado;
  const tronco = sentado ? Math.max(0, r(v.tronco)) : r(v.tronco);

  const puntos: Partial<Record<Punto, [number, number]>> = {};
  const mapa: [Punto, number][] = [
    ['cabeza', I.oreja[visible]],
    ['hombro', I.hombro[visible]],
    ['codo', I.codo[visible]],
    ['muneca', I.muneca[visible]],
    ['cadera', I.cadera[visible]],
    ['rodilla', I.rodilla[visible]],
    ['tobillo', I.tobillo[visible]],
  ];
  for (const [k, i] of mapa) if ((lm[i].visibility ?? 1) > 0.3) puntos[k] = [Math.min(1, Math.max(0, lm[i].x)), Math.min(1, Math.max(0, lm[i].y))];

  const brazos = (x: Medidas) => ({ brazoAngulo: r(x.brazo), antebrazoAngulo: r(x.antebrazo), munecaAngulo: r(x.muneca) });
  const ladoA = brazos(v);
  const ladoB = otroUsable ? brazos(otro) : ladoA;
  const confianza: ResultadoIA['confianza'] = v.visibilidad > 0.8 ? 'alta' : v.visibilidad > 0.55 ? 'media' : 'baja';
  const observaciones = [
    `Postura detectada con MediaPipe (lado ${visible === 'izq' ? 'izquierdo' : 'derecho'} más visible${otroUsable ? '; el otro lado también se midió' : '; el otro lado se copió del visible'}).`,
    'Ángulos medidos en el plano de la foto (2D): si la persona no está de perfil, pueden diferir de los reales.',
  ];

  let bruto: Record<string, unknown>;
  let detectados: string[];
  if (m === 'rosa') {
    // Ángulo interior de la rodilla: < 90° asiento bajo, > 90° asiento alto (NTP 1173, tabla A-1)
    const rodInterior = 180 - r(v.rodilla);
    const alturaAsiento = rodInterior < 75 ? 'bajo' : rodInterior > 105 ? 'alto' : 'rodillas90';
    const cuello = r(v.cuello);
    const pantalla = cuello > 20 ? 'baja' : cuello < -5 ? 'alta' : 'correcta';
    const teclado = Math.abs(v.muneca) > 15 ? 'extendido' : 'recto';
    bruto = { valores: { alturaAsiento, pantalla, teclado, ...(v.tronco < -20 ? { respaldo: 'inclinacion' } : {}) } };
    detectados = ['alturaAsiento', 'pantalla', 'teclado', ...(v.tronco < -20 ? ['respaldo'] : [])];
    observaciones.push(`Se dedujo: altura del asiento (ángulo de rodilla ${rodInterior}°), altura de la pantalla (cuello ${cuello}°) y posición de las muñecas al teclear. El resto de elementos del puesto debe marcarse a mano.`);
  } else if (m === 'rula') {
    bruto = { comun: { cuelloAngulo: r(v.cuello), troncoAngulo: tronco }, der: visible === 'der' ? ladoA : ladoB, izq: visible === 'izq' ? ladoA : ladoB };
    detectados = ['C.cuelloAngulo', 'C.troncoAngulo', 'L.brazoAngulo', 'L.antebrazoAngulo', 'L.munecaAngulo'];
    observaciones.push('No se pueden ver en una foto: carga, actividad, giros, hombro elevado, desviaciones ni apoyo de piernas. Revíselos en el formulario.');
  } else {
    bruto = {
      comun: { cuelloAngulo: r(v.cuello), troncoAngulo: tronco, sentado, rodillaFlexion: sentado ? 0 : Math.max(0, r(otroUsable ? Math.max(v.rodilla, otro.rodilla) : v.rodilla)) },
      der: visible === 'der' ? ladoA : ladoB,
      izq: visible === 'izq' ? ladoA : ladoB,
    };
    detectados = ['C.cuelloAngulo', 'C.troncoAngulo', 'C.sentado', 'C.rodillaFlexion', 'L.brazoAngulo', 'L.antebrazoAngulo', 'L.munecaAngulo'];
    observaciones.push('No se pueden ver en una foto: carga, agarre, actividad, giros ni hombro elevado. Revíselos en el formulario.');
  }
  const res2 = validarRespuesta(m, { ...bruto, ladoVisible, puntos, observaciones, confianza }, actual);
  return { ...res2, motor: 'mediapipe', detectados };
}

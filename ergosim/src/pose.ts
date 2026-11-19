// Detección de pose en el navegador con MediaPipe Pose Landmarker (gratuito, sin clave).
// Se usa cuando la página NO está dentro de claude.ai (por ejemplo, el archivo HTML descargado).
// Usa las coordenadas 3D estimadas por el modelo (en metros, centradas en la cadera) para medir ángulos,
// giros, inclinaciones y abducción con independencia del punto de vista. Umbrales propios de esta
// herramienta (no de los métodos) están marcados con «UMBRAL»; el evaluador puede corregir todo.
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
type Detector = { detect: (img: HTMLImageElement) => { landmarks: Lm[][]; worldLandmarks: Lm[][] } };

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
  menique: { izq: 17, der: 18 },
  indice: { izq: 19, der: 20 },
  cadera: { izq: 23, der: 24 },
  rodilla: { izq: 25, der: 26 },
  tobillo: { izq: 27, der: 28 },
};

type V = [number, number, number];
const v3 = (l: Lm): V => [l.x, l.y, l.z];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]) || 1e-9;
const unit = (a: V): V => mul(a, 1 / len(a));
const mid = (a: V, b: V): V => mul(add(a, b), 0.5);
const deg = (r: number) => (r * 180) / Math.PI;
const angulo = (a: V, b: V) => deg(Math.acos(Math.max(-1, Math.min(1, dot(unit(a), unit(b))))));
/** Quita a `a` su componente sobre el eje `n` (proyección en el plano perpendicular). */
const plano = (a: V, n: V): V => sub(a, mul(n, dot(a, n)));
const r = (n: number) => Math.round(n);

export interface MedLado {
  brazo: number; // flexión (+) / extensión (−) respecto al tronco
  abduccion: number; // separación lateral del brazo respecto al plano sagital
  hombroElevado: boolean;
  antebrazo: number;
  fueraLinea: boolean;
  muneca: number;
  desviacion: number;
  rodilla: number;
  vis: number;
}

export interface AnalisisPose {
  lados: { izq: MedLado; der: MedLado };
  visible: 'izq' | 'der';
  otroUsable: boolean;
  tronco: { flexion: number; lateral: number; rotacion: number };
  cuello: { flexion: number; lateral: number; rotacion: number };
  sentado: boolean;
  pieLevantado: boolean;
  puntos: Partial<Record<Punto, [number, number]>>;
  confianza: ResultadoIA['confianza'];
}

const cache = new Map<string, AnalisisPose>();

/** Detecta la pose y calcula todas las medidas (se reutiliza para los tres métodos). */
export async function analizarPose(img: HTMLImageElement): Promise<AnalisisPose> {
  const clave = img.src.slice(0, 64) + img.src.length;
  const previo = cache.get(clave);
  if (previo) return previo;
  const det = await cargarDetector();
  const res = det.detect(img);
  const im = res.landmarks?.[0];
  const w = res.worldLandmarks?.[0];
  if (!im || !w) throw { code: 'sin_persona' };
  const P = (i: number) => v3(w[i]);

  // Marco del cuerpo: vertical global (y del modelo apunta hacia abajo), eje lateral (hacia la derecha de la persona) y adelante.
  const arriba: V = [0, -1, 0];
  const caderaM = mid(P(I.cadera.izq), P(I.cadera.der));
  const hombroM = mid(P(I.hombro.izq), P(I.hombro.der));
  let lateral = unit(plano(sub(P(I.cadera.der), P(I.cadera.izq)), arriba));
  let adelante = unit(cross(lateral, arriba));
  const orejaM = mid(P(I.oreja.izq), P(I.oreja.der));
  if (dot(sub(P(I.nariz), orejaM), adelante) < 0) {
    adelante = mul(adelante, -1);
    lateral = mul(lateral, -1);
  }
  // Tronco
  const T = sub(hombroM, caderaM);
  const tronco = {
    flexion: deg(Math.atan2(dot(T, adelante), dot(T, arriba))),
    lateral: deg(Math.atan2(dot(T, lateral), dot(T, arriba))),
    rotacion: angulo(plano(sub(P(I.hombro.der), P(I.hombro.izq)), arriba), plano(sub(P(I.cadera.der), P(I.cadera.izq)), arriba)),
  };
  // Marco del tronco (para brazos y cuello)
  const ut = unit(T);
  const lt = unit(plano(lateral, ut));
  let ft = unit(cross(lt, ut));
  if (dot(ft, adelante) < 0) ft = mul(ft, -1);
  // Cuello: línea hombros-orejas respecto al tronco; giro: nariz respecto al frente del tronco
  const H = sub(orejaM, hombroM);
  const nariz = plano(sub(P(I.nariz), orejaM), ut);
  const cuello = {
    flexion: deg(Math.atan2(dot(H, ft), dot(H, ut))),
    lateral: deg(Math.atan2(dot(H, lt), dot(H, ut))),
    rotacion: angulo(nariz, ft),
  };

  const anchoHombros = len(sub(P(I.hombro.der), P(I.hombro.izq)));
  const medir = (lado: 'izq' | 'der'): MedLado => {
    const fuera = lado === 'der' ? 1 : -1; // hacia fuera del cuerpo en el eje lateral
    const hombro = P(I.hombro[lado]);
    const A = sub(P(I.codo[lado]), hombro);
    const abajo = dot(A, mul(ut, -1));
    const elev = angulo(A, mul(ut, -1));
    const abduccion = deg(Math.asin(Math.max(-1, Math.min(1, (dot(A, lt) * fuera) / len(A)))));
    const hacia = dot(A, ft);
    const brazo = hacia < 0 && abduccion < 30 ? -deg(Math.atan2(-hacia, abajo)) : elev;
    const Fa = sub(P(I.muneca[lado]), P(I.codo[lado]));
    const antebrazo = angulo(A, Fa);
    const mano = sub(mid(P(I.indice[lado]), P(I.menique[lado])), P(I.muneca[lado]));
    const normal = unit(cross(sub(P(I.indice[lado]), P(I.muneca[lado])), sub(P(I.menique[lado]), P(I.muneca[lado]))));
    const fa = unit(Fa);
    const enPalma = unit(cross(fa, normal));
    const muneca = deg(Math.atan2(dot(mano, normal), dot(mano, fa)));
    const desviacion = deg(Math.atan2(dot(mano, enPalma), dot(mano, fa)));
    const munecaLat = dot(sub(P(I.muneca[lado]), caderaM), lt) * fuera;
    const otro = lado === 'der' ? 'izq' : 'der';
    // UMBRAL: hombro 3 cm más alto que el otro (sin inclinación lateral del tronco) = hombro elevado
    const difAltura = dot(sub(hombro, P(I.hombro[otro])), ut);
    const rod = 180 - angulo(sub(P(I.cadera[lado]), P(I.rodilla[lado])), sub(P(I.tobillo[lado]), P(I.rodilla[lado])));
    const ids = [I.hombro[lado], I.codo[lado], I.muneca[lado], I.cadera[lado], I.rodilla[lado]];
    return {
      brazo,
      abduccion,
      hombroElevado: difAltura > 0.03 && Math.abs(tronco.lateral) < 8,
      antebrazo,
      // UMBRAL: muñeca al otro lado de la línea media, o 10 cm más afuera que el hombro
      fueraLinea: munecaLat < -0.02 || munecaLat > anchoHombros / 2 + 0.1,
      muneca: Math.abs(muneca) < 3 ? 0 : muneca,
      desviacion,
      rodilla: rod,
      vis: ids.reduce((s, i) => s + (im[i].visibility ?? 0), 0) / ids.length,
    };
  };
  const izq = medir('izq');
  const der = medir('der');
  const visible: 'izq' | 'der' = izq.vis > der.vis ? 'izq' : 'der';
  const otroUsable = (visible === 'izq' ? der : izq).vis > 0.6;
  const muslo = (l: 'izq' | 'der') => angulo(sub(P(I.rodilla[l]), P(I.cadera[l])), mul(arriba, -1));
  const sentado = Math.min(muslo('izq'), muslo('der')) > 50; // UMBRAL: ambos muslos a más de 50° de la vertical
  const pieLevantado = Math.abs(P(I.tobillo.izq)[1] - P(I.tobillo.der)[1]) > 0.1; // UMBRAL: 10 cm

  const puntos: AnalisisPose['puntos'] = {};
  const mapa: [Punto, number][] = [
    ['cabeza', I.oreja[visible]],
    ['hombro', I.hombro[visible]],
    ['codo', I.codo[visible]],
    ['muneca', I.muneca[visible]],
    ['cadera', I.cadera[visible]],
    ['rodilla', I.rodilla[visible]],
    ['tobillo', I.tobillo[visible]],
  ];
  for (const [k, i] of mapa) if ((im[i].visibility ?? 1) > 0.3) puntos[k] = [Math.min(1, Math.max(0, im[i].x)), Math.min(1, Math.max(0, im[i].y))];
  const vis = (visible === 'izq' ? izq : der).vis;
  const resultado: AnalisisPose = {
    lados: { izq, der },
    visible,
    otroUsable,
    tronco,
    cuello,
    sentado,
    pieLevantado,
    puntos,
    confianza: vis > 0.8 ? 'alta' : vis > 0.55 ? 'media' : 'baja',
  };
  cache.set(clave, resultado);
  return resultado;
}

/** Convierte las medidas en las respuestas de un método (lo no observable conserva su valor actual). */
export function poseAMetodo(m: Metodo, a: AnalisisPose, actual: Record<string, unknown>): ResultadoIA {
  const v = a.lados[a.visible];
  const lado = (l: 'izq' | 'der') => (a.otroUsable ? a.lados[l] : v);
  const troncoRotado = a.tronco.rotacion > 15; // UMBRAL
  const troncoInclinado = Math.abs(a.tronco.lateral) > 10; // UMBRAL
  const cuelloRotado = a.cuello.rotacion > 25; // UMBRAL
  const cuelloInclinado = Math.abs(a.cuello.lateral) > 10; // UMBRAL
  const troncoFlex = a.sentado ? Math.max(0, r(a.tronco.flexion)) : r(a.tronco.flexion);
  const obs = [
    `Postura detectada con MediaPipe en 3D (lado ${a.visible === 'izq' ? 'izquierdo' : 'derecho'} más visible${a.otroUsable ? '; el otro lado también se midió' : '; el otro lado se copió del visible'}).`,
    `Tronco ${r(a.tronco.flexion)}° ${troncoRotado ? 'con giro' : 'sin giro'}${troncoInclinado ? ' e inclinación lateral' : ''}; cuello ${r(a.cuello.flexion)}°${cuelloRotado ? ', cabeza girada' : ''}${cuelloInclinado ? ', cabeza inclinada' : ''}; ${a.sentado ? 'persona sentada' : 'persona de pie'}.`,
  ];
  let bruto: Record<string, unknown>;
  let detectados: string[];
  if (m === 'rula') {
    const brazos = (x: MedLado) => ({
      brazoAngulo: r(x.brazo),
      hombroElevado: x.hombroElevado,
      brazoAbducido: x.abduccion > 30, // UMBRAL
      antebrazoAngulo: r(x.antebrazo),
      antebrazoFueraLinea: x.fueraLinea,
      munecaAngulo: r(x.muneca),
      munecaDesviada: Math.abs(x.desviacion) > 15, // UMBRAL
    });
    bruto = {
      comun: { cuelloAngulo: r(a.cuello.flexion), cuelloRotado, cuelloInclinado, troncoAngulo: troncoFlex, troncoRotado, troncoInclinado, piernasApoyadas: !a.pieLevantado },
      izq: brazos(lado('izq')),
      der: brazos(lado('der')),
    };
    detectados = ['C.cuelloAngulo', 'C.cuelloRotado', 'C.cuelloInclinado', 'C.troncoAngulo', 'C.troncoRotado', 'C.troncoInclinado', 'C.piernasApoyadas', 'L.brazoAngulo', 'L.hombroElevado', 'L.brazoAbducido', 'L.antebrazoAngulo', 'L.antebrazoFueraLinea', 'L.munecaAngulo', 'L.munecaDesviada'];
    obs.push('No se pueden ver en una foto: el giro extremo de la muñeca ni si el brazo descansa sobre un apoyo. Revíselos.');
  } else if (m === 'reba') {
    const rod = a.otroUsable ? Math.max(a.lados.izq.rodilla, a.lados.der.rodilla) : v.rodilla;
    const brazos = (x: MedLado) => ({
      brazoAngulo: r(x.brazo),
      brazoAbducidoRotado: x.abduccion > 30, // UMBRAL
      hombroElevado: x.hombroElevado,
      antebrazoAngulo: r(x.antebrazo),
      munecaAngulo: r(x.muneca),
      munecaTorsionDesviacion: Math.abs(x.desviacion) > 15, // UMBRAL
    });
    bruto = {
      comun: {
        troncoAngulo: troncoFlex,
        troncoTorsionInclinacion: troncoRotado || troncoInclinado,
        cuelloAngulo: r(a.cuello.flexion),
        cuelloTorsionInclinacion: cuelloRotado || cuelloInclinado,
        piernasApoyo: a.pieLevantado ? 'unilateral' : 'bilateral',
        sentado: a.sentado,
        rodillaFlexion: a.sentado ? 0 : Math.max(0, r(rod)),
        actCambios: a.pieLevantado,
      },
      izq: brazos(lado('izq')),
      der: brazos(lado('der')),
    };
    detectados = ['C.troncoAngulo', 'C.troncoTorsionInclinacion', 'C.cuelloAngulo', 'C.cuelloTorsionInclinacion', 'C.piernasApoyo', 'C.sentado', 'C.rodillaFlexion', 'L.brazoAngulo', 'L.brazoAbducidoRotado', 'L.hombroElevado', 'L.antebrazoAngulo', 'L.munecaAngulo', 'L.munecaTorsionDesviacion'];
    obs.push('No se puede ver en una foto si el brazo descansa sobre un apoyo. Revíselo.');
  } else {
    // ROSA: se deduce lo que la postura revela del puesto
    const rodInterior = 180 - r(v.rodilla); // NTP 1173, A-1: < 90° asiento bajo; > 90° asiento alto
    const valores: Record<string, unknown> = {
      alturaAsiento: a.pieLevantado ? 'sinContacto' : rodInterior < 75 ? 'bajo' : rodInterior > 105 ? 'alto' : 'rodillas90',
      pantalla: a.cuello.flexion > 20 ? 'baja' : a.cuello.flexion < -5 ? 'alta' : 'correcta',
      pantallaGiroCuello: cuelloRotado,
      teclado: Math.abs(v.muneca) > 15 ? 'extendido' : 'recto',
      tecladoDesviacion: Math.abs(v.desviacion) > 15,
      tecladoAlto: v.hombroElevado,
      raton: v.abduccion > 30 || v.brazo > 35 ? 'noAlineado' : 'alineado', // UMBRAL: alcance
      respaldo: a.tronco.flexion < -20 ? 'inclinacion' : a.tronco.flexion > 10 ? 'sinRespaldo' : 'correcto',
      telefonoCuelloHombro: cuelloInclinado && v.hombroElevado,
    };
    bruto = { valores };
    detectados = Object.keys(valores);
    obs.push(`Se dedujo de la postura: altura del asiento (rodilla ${rodInterior}°), altura y posición de la pantalla, uso del respaldo, alcance al ratón y muñecas al teclear. Los elementos que no dependen de la postura (regulaciones, reposabrazos, reflejos, atril) se dejan como estaban: revíselos.`);
    if (!a.sentado) obs.push('La persona parece estar de pie: ROSA está pensado para puestos de oficina sentados.');
  }
  return { ...validarRespuesta(m, { ...bruto, ladoVisible: a.otroUsable ? 'ambos' : a.visible, puntos: a.puntos, observaciones: obs, confianza: a.confianza }, actual), motor: 'mediapipe', detectados };
}

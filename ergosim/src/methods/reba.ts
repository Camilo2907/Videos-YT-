// Método REBA (Hignett y McAtamney, 2000).
// Fuente de cada valor: docs/fuentes.md, sección 2. Decisiones D4 y D7.
import { Celda, Factor, NivelRiesgo, factor, fmtGrados, limitar, mod } from './common';

/** Tabla A: fila = tronco-1; columna = (cuello-1)*4 + (piernas-1). [ERG-REBA] Tabla 12 = [NTP601] Fig. 3. */
export const REBA_TABLA_A: number[][] = [
  [1, 2, 3, 4, 1, 2, 3, 4, 3, 3, 5, 6],
  [2, 3, 4, 5, 3, 4, 5, 6, 4, 5, 6, 7],
  [2, 4, 5, 6, 4, 5, 6, 7, 5, 6, 7, 8],
  [3, 5, 6, 7, 5, 6, 7, 8, 6, 7, 8, 9],
  [4, 6, 7, 8, 6, 7, 8, 9, 7, 8, 9, 9],
];

/** Tabla B: fila = brazo-1; columna = (antebrazo-1)*3 + (muñeca-1). [ERG-REBA] Tabla 13 = [NTP601] Fig. 4. */
export const REBA_TABLA_B: number[][] = [
  [1, 2, 2, 1, 2, 3],
  [1, 2, 3, 2, 3, 4],
  [3, 4, 5, 4, 5, 5],
  [4, 5, 5, 5, 6, 7],
  [6, 7, 8, 7, 8, 8],
  [7, 8, 8, 8, 9, 9],
];

/** Tabla C: fila = Puntuación A (1..12), columna = Puntuación B (1..12). [ERG-REBA] Tabla 18. */
export const REBA_TABLA_C: number[][] = [
  [1, 1, 1, 2, 3, 3, 4, 5, 6, 7, 7, 7],
  [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 7, 8],
  [2, 3, 3, 3, 4, 5, 6, 7, 7, 8, 8, 8],
  [3, 4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9],
  [4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9],
  [6, 6, 6, 7, 8, 8, 9, 9, 10, 10, 10, 10],
  [7, 7, 7, 8, 9, 9, 9, 10, 10, 11, 11, 11],
  [8, 8, 8, 9, 10, 10, 10, 10, 10, 11, 11, 11],
  [9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12],
  [10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12],
  [11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12],
  [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
];

export type RebaCarga = 'menos5' | '5a10' | 'mas10';
export type RebaAgarre = 'bueno' | 'regular' | 'malo' | 'inaceptable';

export const REBA_CARGAS: { valor: RebaCarga; texto: string; puntos: number }[] = [
  { valor: 'menos5', texto: 'Menos de 5 kg', puntos: 0 },
  { valor: '5a10', texto: 'Entre 5 y 10 kg', puntos: 1 },
  { valor: 'mas10', texto: 'Más de 10 kg', puntos: 2 },
];

export const REBA_AGARRES: { valor: RebaAgarre; texto: string; detalle: string; puntos: number }[] = [
  { valor: 'bueno', texto: 'Bueno', detalle: 'Buen agarre y fuerza de agarre de rango medio', puntos: 0 },
  { valor: 'regular', texto: 'Regular', detalle: 'Aceptable pero no ideal, o con otras partes del cuerpo', puntos: 1 },
  { valor: 'malo', texto: 'Malo', detalle: 'Posible pero no aceptable', puntos: 2 },
  { valor: 'inaceptable', texto: 'Inaceptable', detalle: 'Torpe, inseguro o sin agarre manual', puntos: 3 },
];

// ---- Puntuación base a partir del ángulo medido ----

/** Tronco: positivo = flexión, negativo = extensión, 0 = erguido. */
export function rebaTroncoBase(a: number): number {
  if (a === 0) return 1;
  if (Math.abs(a) <= 20) return 2;
  if (a < 0) return 3; // extensión > 20°
  if (a <= 60) return 3;
  return 4;
}
/** Cuello: 0–20° de flexión = 1; > 20° de flexión o extensión = 2. */
export const rebaCuelloBase = (a: number) => (a >= 0 && a <= 20 ? 1 : 2);
/** Brazo: positivo = flexión, negativo = extensión. */
export function rebaBrazoBase(a: number): number {
  if (a < -20) return 2;
  if (a <= 20) return 1;
  if (a <= 45) return 2;
  if (a <= 90) return 3;
  return 4;
}
export const rebaAntebrazoBase = (a: number) => (a >= 60 && a <= 100 ? 1 : 2);
export const rebaMunecaBase = (a: number) => (Math.abs(a) <= 15 ? 1 : 2);
/** Incremento por flexión de rodillas (no aplica sentado). */
export function rebaRodillaIncremento(flexion: number, sentado: boolean): number {
  if (sentado) return 0;
  if (flexion > 60) return 2;
  if (flexion >= 30) return 1;
  return 0;
}

// ---- Cálculo a partir de puntuaciones ----

export interface RebaPuntuaciones {
  tronco: number; // 1..5
  cuello: number; // 1..3
  piernas: number; // 1..4
  carga: number; // 0..3
  brazo: number; // 1..6
  antebrazo: number; // 1..2
  muneca: number; // 1..3
  agarre: number; // 0..3
  actividad: number; // 0..3
}

export interface RebaIntermedio {
  tablaA: number;
  tablaB: number;
  puntuacionA: number;
  puntuacionB: number;
  C: number;
  final: number;
  celdas: { A: Celda; B: Celda; C: Celda };
}

export function rebaDesdePuntuaciones(p: RebaPuntuaciones): RebaIntermedio {
  const filaA = limitar(p.tronco, 1, 5) - 1;
  const colA = (limitar(p.cuello, 1, 3) - 1) * 4 + (limitar(p.piernas, 1, 4) - 1);
  const tablaA = REBA_TABLA_A[filaA][colA];
  const filaB = limitar(p.brazo, 1, 6) - 1;
  const colB = (limitar(p.antebrazo, 1, 2) - 1) * 3 + (limitar(p.muneca, 1, 3) - 1);
  const tablaB = REBA_TABLA_B[filaB][colB];
  const puntuacionA = tablaA + p.carga;
  const puntuacionB = tablaB + p.agarre;
  const fC = limitar(puntuacionA, 1, 12) - 1;
  const cC = limitar(puntuacionB, 1, 12) - 1;
  const C = REBA_TABLA_C[fC][cC];
  return {
    tablaA,
    tablaB,
    puntuacionA,
    puntuacionB,
    C,
    final: C + p.actividad,
    celdas: {
      A: { tabla: 'A', fila: filaA, columna: colA, valor: tablaA },
      B: { tabla: 'B', fila: filaB, columna: colB, valor: tablaB },
      C: { tabla: 'C', fila: fC, columna: cC, valor: C },
    },
  };
}

export function rebaNivel(p: number): NivelRiesgo {
  if (p <= 1) return { puntuacion: p, nivel: 0, riesgo: 'Inapreciable', actuacion: 'No es necesaria la actuación.', color: 'verde' };
  if (p <= 3) return { puntuacion: p, nivel: 1, riesgo: 'Bajo', actuacion: 'Puede ser necesaria la actuación.', color: 'verde' };
  if (p <= 7) return { puntuacion: p, nivel: 2, riesgo: 'Medio', actuacion: 'Es necesaria la actuación.', color: 'amarillo' };
  if (p <= 10) return { puntuacion: p, nivel: 3, riesgo: 'Alto', actuacion: 'Es necesaria la actuación cuanto antes.', color: 'naranja' };
  return { puntuacion: p, nivel: 4, riesgo: 'Muy alto', actuacion: 'Es necesaria la actuación de inmediato.', color: 'rojo' };
}

// ---- Entradas por ángulos ----

export interface RebaComun {
  troncoAngulo: number;
  troncoTorsionInclinacion: boolean;
  cuelloAngulo: number;
  cuelloTorsionInclinacion: boolean;
  piernasApoyo: 'bilateral' | 'unilateral';
  sentado: boolean;
  rodillaFlexion: number;
  carga: RebaCarga;
  cargaBrusca: boolean;
  actEstatica: boolean;
  actRepetitiva: boolean;
  actCambios: boolean;
}

export interface RebaLado {
  brazoAngulo: number;
  brazoAbducidoRotado: boolean;
  hombroElevado: boolean;
  brazoApoyoGravedad: boolean;
  antebrazoAngulo: number;
  munecaAngulo: number;
  munecaTorsionDesviacion: boolean;
  agarre: RebaAgarre;
}

export interface RebaResultado extends RebaIntermedio {
  factores: Factor[];
  nivel: NivelRiesgo;
  extras: { carga: number; agarre: number; actividad: number };
}

export function calcularReba(lado: RebaLado, comun: RebaComun): RebaResultado {
  const tronco = factor({
    clave: 'tronco',
    nombre: 'Tronco',
    segmento: 'tronco',
    medida: fmtGrados(comun.troncoAngulo) + (comun.troncoAngulo < 0 ? ' (extensión)' : comun.troncoAngulo === 0 ? ' (erguido)' : ' (flexión)'),
    base: rebaTroncoBase(comun.troncoAngulo),
    modificadores: mod(comun.troncoTorsionInclinacion, 'Torsión o inclinación lateral', 1),
    maximo: 5,
  });
  const cuello = factor({
    clave: 'cuello',
    nombre: 'Cuello',
    segmento: 'cuello',
    medida: fmtGrados(comun.cuelloAngulo) + (comun.cuelloAngulo < 0 ? ' (extensión)' : ' (flexión)'),
    base: rebaCuelloBase(comun.cuelloAngulo),
    modificadores: mod(comun.cuelloTorsionInclinacion, 'Torsión o inclinación lateral', 1),
    maximo: 3,
  });
  const rod = rebaRodillaIncremento(comun.rodillaFlexion, comun.sentado);
  const piernas = factor({
    clave: 'piernas',
    nombre: 'Piernas',
    segmento: 'piernas',
    medida: `${comun.piernasApoyo === 'bilateral' ? 'Apoyo bilateral' : 'Apoyo unilateral o inestable'}${
      comun.sentado ? ', sentado' : `, rodillas ${fmtGrados(comun.rodillaFlexion)}`
    }`,
    base: comun.piernasApoyo === 'bilateral' ? 1 : 2,
    modificadores: mod(rod > 0, rod === 2 ? 'Rodillas flexionadas más de 60°' : 'Rodillas flexionadas 30°–60°', rod),
    maximo: 4,
  });
  const brazo = factor({
    clave: 'brazo',
    nombre: 'Brazo',
    segmento: 'brazo',
    medida: fmtGrados(lado.brazoAngulo) + (lado.brazoAngulo < 0 ? ' (extensión)' : ' (flexión)'),
    base: rebaBrazoBase(lado.brazoAngulo),
    modificadores: [
      ...mod(lado.brazoAbducidoRotado, 'Brazo abducido o rotado', 1),
      ...mod(lado.hombroElevado, 'Hombro elevado', 1),
      ...mod(lado.brazoApoyoGravedad, 'Apoyo o postura a favor de la gravedad', -1),
    ],
    maximo: 6,
  });
  const antebrazo = factor({
    clave: 'antebrazo',
    nombre: 'Antebrazo',
    segmento: 'antebrazo',
    medida: fmtGrados(lado.antebrazoAngulo),
    base: rebaAntebrazoBase(lado.antebrazoAngulo),
    modificadores: [],
    maximo: 2,
  });
  const muneca = factor({
    clave: 'muneca',
    nombre: 'Muñeca',
    segmento: 'muneca',
    medida: fmtGrados(Math.abs(lado.munecaAngulo)),
    base: rebaMunecaBase(lado.munecaAngulo),
    modificadores: mod(lado.munecaTorsionDesviacion, 'Torsión o desviación lateral', 1),
    maximo: 3,
  });
  const extras = {
    carga: REBA_CARGAS.find((c) => c.valor === comun.carga)!.puntos + (comun.cargaBrusca ? 1 : 0),
    agarre: REBA_AGARRES.find((g) => g.valor === lado.agarre)!.puntos,
    actividad: (comun.actEstatica ? 1 : 0) + (comun.actRepetitiva ? 1 : 0) + (comun.actCambios ? 1 : 0),
  };
  const inter = rebaDesdePuntuaciones({
    tronco: tronco.total,
    cuello: cuello.total,
    piernas: piernas.total,
    brazo: brazo.total,
    antebrazo: antebrazo.total,
    muneca: muneca.total,
    ...extras,
  });
  return {
    ...inter,
    factores: [tronco, cuello, piernas, brazo, antebrazo, muneca],
    nivel: rebaNivel(inter.final),
    extras,
  };
}

export const REBA_MAX = 15;

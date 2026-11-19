// Método RULA (McAtamney y Corlett, 1993).
// Fuente de cada valor: docs/fuentes.md, sección 1. Decisiones D1, D3, D7 y D8.
import { Celda, Factor, NivelRiesgo, factor, fmtGrados, limitar, mod } from './common';

/** Tabla A: fila = (brazo-1)*3 + (antebrazo-1); columna = (muñeca-1)*2 + (giro-1). [ERG-RULA] Tabla 13. */
export const RULA_TABLA_A: number[][] = [
  [1, 2, 2, 2, 2, 3, 3, 3],
  [2, 2, 2, 2, 3, 3, 3, 3],
  [2, 3, 3, 3, 3, 3, 4, 4],
  [2, 3, 3, 3, 3, 4, 4, 4],
  [3, 3, 3, 3, 3, 4, 4, 4],
  [3, 4, 4, 4, 4, 4, 5, 5],
  [3, 3, 4, 4, 4, 4, 5, 5],
  [3, 4, 4, 4, 4, 4, 5, 5],
  [4, 4, 4, 4, 4, 5, 5, 5],
  [4, 4, 4, 4, 4, 5, 5, 5],
  [4, 4, 4, 4, 4, 5, 5, 5],
  [4, 4, 4, 5, 5, 5, 6, 6],
  [5, 5, 5, 5, 5, 6, 6, 7],
  [5, 6, 6, 6, 6, 7, 7, 7],
  [6, 6, 6, 7, 7, 7, 7, 8],
  [7, 7, 7, 7, 7, 8, 8, 9],
  [8, 8, 8, 8, 8, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9],
];

/** Tabla B: fila = cuello-1; columna = (tronco-1)*2 + (piernas-1). [ERG-RULA] Tabla 14. */
export const RULA_TABLA_B: number[][] = [
  [1, 3, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7],
  [2, 3, 2, 3, 4, 5, 5, 5, 6, 7, 7, 7],
  [3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7],
  [5, 5, 5, 6, 6, 7, 7, 7, 7, 7, 8, 8],
  [7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8],
  [8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9],
];

/** Tabla C: fila = C (1..8+), columna = D (1..7+). [ERG-RULA] Tabla 17. */
export const RULA_TABLA_C: number[][] = [
  [1, 2, 3, 3, 4, 5, 5],
  [2, 2, 3, 4, 4, 5, 5],
  [3, 3, 3, 4, 4, 5, 6],
  [3, 3, 3, 4, 5, 6, 6],
  [4, 4, 4, 5, 6, 7, 7],
  [4, 4, 5, 6, 6, 7, 7],
  [5, 5, 6, 6, 7, 7, 7],
  [5, 5, 6, 7, 7, 7, 7],
];

export type RulaCarga = 'menos2' | '2a10int' | '2a10est' | 'mas10int' | 'mas10est' | 'golpes';

export const RULA_CARGAS: { valor: RulaCarga; texto: string; puntos: number }[] = [
  { valor: 'menos2', texto: 'Menos de 2 kg, intermitente', puntos: 0 },
  { valor: '2a10int', texto: 'Entre 2 y 10 kg, intermitente', puntos: 1 },
  { valor: '2a10est', texto: 'Entre 2 y 10 kg, estática o repetitiva', puntos: 2 },
  { valor: 'mas10int', texto: 'Más de 10 kg, intermitente', puntos: 2 },
  { valor: 'mas10est', texto: 'Más de 10 kg, estática o repetitiva', puntos: 3 },
  { valor: 'golpes', texto: 'Golpes o fuerzas bruscas', puntos: 3 },
];

export const rulaPuntosCarga = (c: RulaCarga) => RULA_CARGAS.find((x) => x.valor === c)!.puntos;

// ---- Puntuación base a partir del ángulo medido ----

/** Brazo: ángulo con el tronco; positivo = flexión, negativo = extensión. */
export function rulaBrazoBase(a: number): number {
  if (a < -20) return 2;
  if (a <= 20) return 1;
  if (a <= 45) return 2;
  if (a <= 90) return 3;
  return 4;
}
/** Antebrazo: flexión respecto al brazo. */
export const rulaAntebrazoBase = (a: number) => (a >= 60 && a <= 100 ? 1 : 2);
/** Muñeca: flexión o extensión desde la posición neutra (se usa el valor absoluto). */
export function rulaMunecaBase(a: number): number {
  const v = Math.abs(a);
  if (v === 0) return 1;
  if (v < 15) return 2;
  return 3;
}
/** Cuello: positivo = flexión, negativo = extensión. */
export function rulaCuelloBase(a: number): number {
  if (a < 0) return 4;
  if (a <= 10) return 1;
  if (a <= 20) return 2;
  return 3;
}
/** Tronco: flexión respecto a la vertical (0 = erguido o sentado bien apoyado). */
export function rulaTroncoBase(a: number): number {
  if (a <= 0) return 1;
  if (a <= 20) return 2;
  if (a <= 60) return 3;
  return 4;
}

// ---- Cálculo a partir de puntuaciones (lo usan las pruebas y el cálculo por ángulos) ----

export interface RulaPuntuaciones {
  brazo: number; // 1..6
  antebrazo: number; // 1..3
  muneca: number; // 1..4
  giro: number; // 1..2
  cuello: number; // 1..6
  tronco: number; // 1..6
  piernas: number; // 1..2
  actividadA: number; // 0..1
  cargaA: number; // 0..3
  actividadB: number;
  cargaB: number;
}

export interface RulaIntermedio {
  grupoA: number;
  grupoB: number;
  C: number;
  D: number;
  final: number;
  celdas: { A: Celda; B: Celda; C: Celda };
}

export function rulaDesdePuntuaciones(p: RulaPuntuaciones): RulaIntermedio {
  const filaA = (limitar(p.brazo, 1, 6) - 1) * 3 + (limitar(p.antebrazo, 1, 3) - 1);
  const colA = (limitar(p.muneca, 1, 4) - 1) * 2 + (limitar(p.giro, 1, 2) - 1);
  const grupoA = RULA_TABLA_A[filaA][colA];
  const filaB = limitar(p.cuello, 1, 6) - 1;
  const colB = (limitar(p.tronco, 1, 6) - 1) * 2 + (limitar(p.piernas, 1, 2) - 1);
  const grupoB = RULA_TABLA_B[filaB][colB];
  const C = grupoA + p.actividadA + p.cargaA;
  const D = grupoB + p.actividadB + p.cargaB;
  const fC = limitar(C, 1, 8) - 1;
  const cD = limitar(D, 1, 7) - 1;
  const final = RULA_TABLA_C[fC][cD];
  return {
    grupoA,
    grupoB,
    C,
    D,
    final,
    celdas: {
      A: { tabla: 'A', fila: filaA, columna: colA, valor: grupoA },
      B: { tabla: 'B', fila: filaB, columna: colB, valor: grupoB },
      C: { tabla: 'C', fila: fC, columna: cD, valor: final },
    },
  };
}

export function rulaNivel(p: number): NivelRiesgo {
  if (p <= 2) return { puntuacion: p, nivel: 1, riesgo: 'Aceptable', actuacion: 'No son precisos cambios.', color: 'verde' };
  if (p <= 4)
    return {
      puntuacion: p,
      nivel: 2,
      riesgo: 'Bajo',
      actuacion: 'Pueden requerirse cambios en la tarea; conviene profundizar en el estudio.',
      color: 'amarillo',
    };
  if (p <= 6) return { puntuacion: p, nivel: 3, riesgo: 'Alto', actuacion: 'Se requiere el rediseño de la tarea.', color: 'naranja' };
  return { puntuacion: p, nivel: 4, riesgo: 'Muy alto', actuacion: 'Se requieren cambios urgentes en la tarea.', color: 'rojo' };
}

// ---- Entradas por ángulos (lo que llena el evaluador o la IA) ----

export interface RulaLado {
  brazoAngulo: number;
  hombroElevado: boolean;
  brazoAbducido: boolean;
  brazoApoyado: boolean;
  antebrazoAngulo: number;
  antebrazoFueraLinea: boolean;
  munecaAngulo: number;
  munecaDesviada: boolean;
  giroExtremo: boolean;
  actividadA: boolean;
  cargaA: RulaCarga;
}

export interface RulaComun {
  cuelloAngulo: number;
  cuelloRotado: boolean;
  cuelloInclinado: boolean;
  troncoAngulo: number;
  troncoRotado: boolean;
  troncoInclinado: boolean;
  piernasApoyadas: boolean;
  actividadB: boolean;
  cargaB: RulaCarga;
}

export interface RulaResultado extends RulaIntermedio {
  factores: Factor[];
  nivel: NivelRiesgo;
  extras: { actividadA: number; cargaA: number; actividadB: number; cargaB: number };
}

export function calcularRula(lado: RulaLado, comun: RulaComun): RulaResultado {
  const brazo = factor({
    clave: 'brazo',
    nombre: 'Brazo',
    segmento: 'brazo',
    medida: fmtGrados(lado.brazoAngulo) + (lado.brazoAngulo < 0 ? ' (extensión)' : ' (flexión)'),
    base: rulaBrazoBase(lado.brazoAngulo),
    modificadores: [
      ...mod(lado.hombroElevado, 'Hombro elevado', 1),
      ...mod(lado.brazoAbducido, 'Brazo abducido', 1),
      ...mod(lado.brazoApoyado, 'Brazo apoyado', -1),
    ],
    maximo: 6,
  });
  const antebrazo = factor({
    clave: 'antebrazo',
    nombre: 'Antebrazo',
    segmento: 'antebrazo',
    medida: fmtGrados(lado.antebrazoAngulo),
    base: rulaAntebrazoBase(lado.antebrazoAngulo),
    modificadores: mod(lado.antebrazoFueraLinea, 'A un lado del cuerpo o cruza la línea media', 1),
    maximo: 3,
  });
  const muneca = factor({
    clave: 'muneca',
    nombre: 'Muñeca',
    segmento: 'muneca',
    medida: fmtGrados(Math.abs(lado.munecaAngulo)),
    base: rulaMunecaBase(lado.munecaAngulo),
    modificadores: mod(lado.munecaDesviada, 'Desviación radial o cubital', 1),
    maximo: 4,
  });
  const giro = factor({
    clave: 'giro',
    nombre: 'Giro de muñeca',
    segmento: 'muneca',
    medida: lado.giroExtremo ? 'Extremo' : 'Medio',
    base: lado.giroExtremo ? 2 : 1,
    modificadores: [],
    maximo: 2,
  });
  const cuello = factor({
    clave: 'cuello',
    nombre: 'Cuello',
    segmento: 'cuello',
    medida: fmtGrados(comun.cuelloAngulo) + (comun.cuelloAngulo < 0 ? ' (extensión)' : ' (flexión)'),
    base: rulaCuelloBase(comun.cuelloAngulo),
    modificadores: [...mod(comun.cuelloRotado, 'Cabeza rotada', 1), ...mod(comun.cuelloInclinado, 'Inclinación lateral', 1)],
    maximo: 6,
  });
  const tronco = factor({
    clave: 'tronco',
    nombre: 'Tronco',
    segmento: 'tronco',
    medida: fmtGrados(comun.troncoAngulo),
    base: rulaTroncoBase(comun.troncoAngulo),
    modificadores: [...mod(comun.troncoRotado, 'Tronco rotado', 1), ...mod(comun.troncoInclinado, 'Inclinación lateral', 1)],
    maximo: 6,
  });
  const piernas = factor({
    clave: 'piernas',
    nombre: 'Piernas',
    segmento: 'piernas',
    medida: comun.piernasApoyadas ? 'Apoyadas, peso simétrico' : 'Sin apoyo o peso asimétrico',
    base: comun.piernasApoyadas ? 1 : 2,
    modificadores: [],
    maximo: 2,
  });

  const extras = {
    actividadA: lado.actividadA ? 1 : 0,
    cargaA: rulaPuntosCarga(lado.cargaA),
    actividadB: comun.actividadB ? 1 : 0,
    cargaB: rulaPuntosCarga(comun.cargaB),
  };
  const inter = rulaDesdePuntuaciones({
    brazo: brazo.total,
    antebrazo: antebrazo.total,
    muneca: muneca.total,
    giro: giro.total,
    cuello: cuello.total,
    tronco: tronco.total,
    piernas: piernas.total,
    ...extras,
  });
  return {
    ...inter,
    factores: [brazo, antebrazo, muneca, giro, cuello, tronco, piernas],
    nivel: rulaNivel(inter.final),
    extras,
  };
}

export const RULA_MAX = 7;

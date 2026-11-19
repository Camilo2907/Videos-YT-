// Método ROSA (Sonne, Villalta y Andrews, 2012).
// Fuente de cada valor: docs/fuentes.md, sección 3. Decisiones D5 y D6.
import { Celda, Factor, NivelRiesgo, factor, limitar, mod } from './common';

/** Tabla A (silla): fila = altura+profundidad (2..8), columna = reposabrazos+respaldo (2..9). */
export const ROSA_TABLA_A: number[][] = [
  [2, 2, 3, 4, 5, 6, 7, 8],
  [2, 2, 3, 4, 5, 6, 7, 8],
  [3, 3, 3, 4, 5, 6, 7, 8],
  [4, 4, 4, 4, 5, 6, 7, 8],
  [5, 5, 5, 5, 6, 7, 8, 9],
  [6, 6, 6, 7, 7, 8, 8, 9],
  [7, 7, 7, 8, 8, 9, 9, 9],
];

/** Tabla B: fila = teléfono (0..6), columna = pantalla (0..7). */
export const ROSA_TABLA_B: number[][] = [
  [1, 1, 1, 2, 3, 4, 5, 6],
  [1, 1, 2, 2, 3, 4, 5, 6],
  [1, 2, 2, 3, 3, 4, 6, 7],
  [2, 2, 3, 3, 4, 5, 6, 8],
  [3, 3, 4, 4, 5, 6, 7, 8],
  [4, 4, 5, 5, 6, 7, 8, 9],
  [5, 5, 6, 7, 8, 8, 9, 9],
];

/** Tabla C: fila = ratón (0..7), columna = teclado (0..7). */
export const ROSA_TABLA_C: number[][] = [
  [1, 1, 1, 2, 3, 4, 5, 6],
  [1, 1, 2, 3, 4, 5, 6, 7],
  [1, 2, 2, 3, 4, 5, 6, 7],
  [2, 3, 3, 3, 5, 6, 7, 8],
  [3, 4, 4, 5, 5, 6, 7, 8],
  [4, 5, 5, 6, 6, 7, 8, 9],
  [5, 6, 6, 7, 7, 8, 8, 9],
  [6, 7, 7, 8, 8, 9, 9, 9],
];

/** Tabla D: fila = Tabla B (1..9), columna = Tabla C (1..9). */
export const ROSA_TABLA_D: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [2, 2, 3, 4, 5, 6, 7, 8, 9],
  [3, 3, 3, 4, 5, 6, 7, 8, 9],
  [4, 4, 4, 4, 5, 6, 7, 8, 9],
  [5, 5, 5, 5, 5, 6, 7, 8, 9],
  [6, 6, 6, 6, 6, 6, 7, 8, 9],
  [7, 7, 7, 7, 7, 7, 7, 8, 9],
  [8, 8, 8, 8, 8, 8, 8, 8, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9],
];

/** Tabla E: fila = silla (1..10), columna = pantalla y periféricos (1..10). */
export const ROSA_TABLA_E: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [2, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [3, 3, 3, 4, 5, 6, 7, 8, 9, 10],
  [4, 4, 4, 4, 5, 6, 7, 8, 9, 10],
  [5, 5, 5, 5, 5, 6, 7, 8, 9, 10],
  [6, 6, 6, 6, 6, 6, 7, 8, 9, 10],
  [7, 7, 7, 7, 7, 7, 7, 8, 9, 10],
  [8, 8, 8, 8, 8, 8, 8, 8, 9, 10],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 10],
  [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
];

export type RosaTiempo = 'menos1' | '1a4' | 'mas4';
export const ROSA_TIEMPOS: { valor: RosaTiempo; texto: string; puntos: number }[] = [
  { valor: 'menos1', texto: 'Menos de 1 h al día o menos de 30 min seguidos', puntos: -1 },
  { valor: '1a4', texto: 'Entre 1 y 4 h al día o de 30 min a 1 h seguida', puntos: 0 },
  { valor: 'mas4', texto: 'Más de 4 h al día o más de 1 h seguida', puntos: 1 },
];
const tiempo = (t: RosaTiempo) => ROSA_TIEMPOS.find((x) => x.valor === t)!.puntos;
const modTiempo = (t: RosaTiempo) => mod(tiempo(t) !== 0, 'Tiempo de uso', tiempo(t));

export interface RosaEntrada {
  alturaAsiento: 'rodillas90' | 'bajo' | 'alto' | 'sinContacto';
  alturaEspacioInsuficiente: boolean;
  alturaNoRegulable: boolean;
  profundidad: 'correcta' | 'larga' | 'corta';
  profundidadNoRegulable: boolean;
  reposabrazos: 'correctos' | 'altos' | 'bajos' | 'sinReposabrazos';
  reposabrazosSeparados: boolean;
  reposabrazosDuros: boolean;
  reposabrazosNoRegulables: boolean;
  respaldo: 'correcto' | 'sinLumbar' | 'inclinacion' | 'sinRespaldo';
  superficieAlta: boolean;
  respaldoNoRegulable: boolean;
  tiempoSilla: RosaTiempo;
  pantalla: 'correcta' | 'baja' | 'alta';
  pantallaGiroCuello: boolean;
  pantallaLejos: boolean;
  pantallaReflejos: boolean;
  pantallaSinAtril: boolean;
  tiempoPantalla: RosaTiempo;
  telefono: 'correcto' | 'lejos';
  telefonoCuelloHombro: boolean;
  telefonoSinManosLibres: boolean;
  tiempoTelefono: RosaTiempo;
  raton: 'alineado' | 'noAlineado';
  ratonPinza: boolean;
  ratonAlturaDistinta: boolean;
  ratonReposamanosDuro: boolean;
  tiempoRaton: RosaTiempo;
  teclado: 'recto' | 'extendido';
  tecladoDesviacion: boolean;
  tecladoAlto: boolean;
  tecladoAlcanceCabeza: boolean;
  tecladoNoRegulable: boolean;
  tiempoTeclado: RosaTiempo;
}

export interface RosaPuntuaciones {
  altura: number;
  profundidad: number;
  reposabrazos: number;
  respaldo: number;
  tiempoSilla: number;
  pantalla: number; // ya incluye tiempo
  telefono: number;
  raton: number;
  teclado: number;
}

export interface RosaIntermedio {
  tablaA: number;
  silla: number;
  tablaB: number;
  tablaC: number;
  perifericos: number;
  final: number;
  celdas: { A: Celda; B: Celda; C: Celda; D: Celda; E: Celda };
}

export function rosaDesdePuntuaciones(p: RosaPuntuaciones): RosaIntermedio {
  const fA = limitar(p.altura + p.profundidad, 2, 8) - 2;
  const cA = limitar(p.reposabrazos + p.respaldo, 2, 9) - 2;
  const tablaA = ROSA_TABLA_A[fA][cA];
  const silla = limitar(tablaA + p.tiempoSilla, 1, 10);
  const fB = limitar(p.telefono, 0, 6);
  const cB = limitar(p.pantalla, 0, 7); // D5: pantalla 8 usa la columna 7
  const tablaB = ROSA_TABLA_B[fB][cB];
  const fC = limitar(p.raton, 0, 7);
  const cC = limitar(p.teclado, 0, 7);
  const tablaC = ROSA_TABLA_C[fC][cC];
  const perifericos = ROSA_TABLA_D[tablaB - 1][tablaC - 1];
  const final = ROSA_TABLA_E[silla - 1][perifericos - 1];
  return {
    tablaA,
    silla,
    tablaB,
    tablaC,
    perifericos,
    final,
    celdas: {
      A: { tabla: 'A', fila: fA, columna: cA, valor: tablaA },
      B: { tabla: 'B', fila: fB, columna: cB, valor: tablaB },
      C: { tabla: 'C', fila: fC, columna: cC, valor: tablaC },
      D: { tabla: 'D', fila: tablaB - 1, columna: tablaC - 1, valor: perifericos },
      E: { tabla: 'E', fila: silla - 1, columna: perifericos - 1, valor: final },
    },
  };
}

export function rosaNivel(p: number): NivelRiesgo {
  if (p <= 1) return { puntuacion: p, nivel: 0, riesgo: 'Inapreciable', actuacion: 'No es necesaria la actuación.', color: 'verde' };
  if (p <= 4) return { puntuacion: p, nivel: 1, riesgo: 'Mejorable', actuacion: 'Pueden mejorarse algunos elementos del puesto.', color: 'verde' };
  if (p === 5) return { puntuacion: p, nivel: 2, riesgo: 'Alto', actuacion: 'Es necesaria la actuación.', color: 'amarillo' };
  if (p <= 8) return { puntuacion: p, nivel: 3, riesgo: 'Muy alto', actuacion: 'Es necesaria la actuación cuanto antes.', color: 'naranja' };
  return { puntuacion: p, nivel: 4, riesgo: 'Extremo', actuacion: 'Es necesaria la actuación urgentemente.', color: 'rojo' };
}

export interface RosaResultado extends RosaIntermedio {
  factores: Factor[];
  nivel: NivelRiesgo;
}

export function calcularRosa(e: RosaEntrada): RosaResultado {
  const altura = factor({
    clave: 'altura',
    nombre: 'Altura del asiento',
    medida: { rodillas90: 'Rodillas a 90°', bajo: 'Muy bajo (rodilla < 90°)', alto: 'Muy alto (rodilla > 90°)', sinContacto: 'Pies sin tocar el suelo' }[e.alturaAsiento],
    base: { rodillas90: 1, bajo: 2, alto: 2, sinContacto: 3 }[e.alturaAsiento],
    modificadores: [
      ...mod(e.alturaEspacioInsuficiente, 'Espacio insuficiente para las piernas', 1),
      ...mod(e.alturaNoRegulable, 'Altura no regulable', 1),
    ],
    maximo: 5,
  });
  const profundidad = factor({
    clave: 'profundidad',
    nombre: 'Profundidad del asiento',
    medida: { correcta: '≈ 8 cm hasta la rodilla', larga: 'Muy largo (< 8 cm)', corta: 'Muy corto (> 8 cm)' }[e.profundidad],
    base: e.profundidad === 'correcta' ? 1 : 2,
    modificadores: mod(e.profundidadNoRegulable, 'Profundidad no regulable', 1),
    maximo: 3,
  });
  const reposabrazos = factor({
    clave: 'reposabrazos',
    nombre: 'Reposabrazos',
    medida: { correctos: 'Codos a 90°, hombros relajados', altos: 'Muy altos (hombros encogidos)', bajos: 'Muy bajos (codos sin apoyo)', sinReposabrazos: 'Sin reposabrazos' }[e.reposabrazos],
    base: e.reposabrazos === 'correctos' ? 1 : 2,
    modificadores: [
      ...mod(e.reposabrazosSeparados, 'Demasiado separados', 1),
      ...mod(e.reposabrazosDuros, 'Superficie dura o dañada', 1),
      ...mod(e.reposabrazosNoRegulables, 'No regulables', 1),
    ],
    maximo: 5,
  });
  const respaldo = factor({
    clave: 'respaldo',
    nombre: 'Respaldo',
    medida: { correcto: 'Apoyo lumbar, 95°–110°', sinLumbar: 'Sin apoyo lumbar', inclinacion: 'Inclinación < 95° o > 110°', sinRespaldo: 'Sin respaldo o no se usa' }[e.respaldo],
    base: e.respaldo === 'correcto' ? 1 : 2,
    modificadores: [
      ...mod(e.superficieAlta, 'Superficie de trabajo alta', 1),
      ...mod(e.respaldoNoRegulable, 'Respaldo no regulable', 1),
    ],
    maximo: 4,
  });
  const pantalla = factor({
    clave: 'pantalla',
    nombre: 'Pantalla',
    medida: { correcta: '40–75 cm, a la altura de los ojos', baja: 'Muy baja (flexión de cuello)', alta: 'Muy alta (extensión de cuello)' }[e.pantalla],
    base: { correcta: 1, baja: 2, alta: 3 }[e.pantalla],
    modificadores: [
      ...mod(e.pantallaGiroCuello, 'Hay que girar el cuello', 1),
      ...mod(e.pantallaLejos, 'Pantalla a más de 75 cm', 1),
      ...mod(e.pantallaReflejos, 'Reflejos en la pantalla', 1),
      ...mod(e.pantallaSinAtril, 'Documentos sin atril', 1),
      ...modTiempo(e.tiempoPantalla),
    ],
    min: 0,
    maximo: 8,
  });
  const telefono = factor({
    clave: 'telefono',
    nombre: 'Teléfono',
    medida: e.telefono === 'correcto' ? 'Cerca (≤ 30 cm), cuello neutro' : 'Lejos (> 30 cm)',
    base: e.telefono === 'correcto' ? 1 : 2,
    modificadores: [
      ...mod(e.telefonoCuelloHombro, 'Sujeto entre cuello y hombro', 2),
      ...mod(e.telefonoSinManosLibres, 'Sin manos libres', 1),
      ...modTiempo(e.tiempoTelefono),
    ],
    min: 0,
    maximo: 6,
  });
  const raton = factor({
    clave: 'raton',
    nombre: 'Ratón',
    medida: e.raton === 'alineado' ? 'Alineado con el hombro' : 'No alineado o lejos',
    base: e.raton === 'alineado' ? 1 : 2,
    modificadores: [
      ...mod(e.ratonPinza, 'Agarre en pinza / ratón pequeño', 1),
      ...mod(e.ratonAlturaDistinta, 'Ratón y teclado a distinta altura', 2),
      ...mod(e.ratonReposamanosDuro, 'Reposamanos duro o presión', 1),
      ...modTiempo(e.tiempoRaton),
    ],
    min: 0,
    maximo: 7,
  });
  const teclado = factor({
    clave: 'teclado',
    nombre: 'Teclado',
    medida: e.teclado === 'recto' ? 'Muñecas rectas, hombros relajados' : 'Muñecas extendidas > 15°',
    base: e.teclado === 'recto' ? 1 : 2,
    modificadores: [
      ...mod(e.tecladoDesviacion, 'Muñecas desviadas', 1),
      ...mod(e.tecladoAlto, 'Teclado alto (hombros encogidos)', 1),
      ...mod(e.tecladoAlcanceCabeza, 'Alcance por encima de la cabeza', 1),
      ...mod(e.tecladoNoRegulable, 'Plataforma no regulable', 1),
      ...modTiempo(e.tiempoTeclado),
    ],
    min: 0,
    maximo: 7,
  });
  const tSilla = tiempo(e.tiempoSilla);
  const inter = rosaDesdePuntuaciones({
    altura: altura.total,
    profundidad: profundidad.total,
    reposabrazos: reposabrazos.total,
    respaldo: respaldo.total,
    tiempoSilla: tSilla,
    pantalla: pantalla.total,
    telefono: telefono.total,
    raton: raton.total,
    teclado: teclado.total,
  });
  return { ...inter, factores: [altura, profundidad, reposabrazos, respaldo, pantalla, telefono, raton, teclado], nivel: rosaNivel(inter.final) };
}

export const ROSA_MAX = 10;

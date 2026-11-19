import type { Celda, Factor, NivelRiesgo } from './methods/common';
import { RULA_MAX, RULA_TABLA_A, RULA_TABLA_B, RULA_TABLA_C, calcularRula } from './methods/rula';
import { REBA_MAX, REBA_TABLA_A, REBA_TABLA_B, REBA_TABLA_C, calcularReba } from './methods/reba';
import { ROSA_MAX, ROSA_TABLA_A, ROSA_TABLA_B, ROSA_TABLA_C, ROSA_TABLA_D, ROSA_TABLA_E, calcularRosa } from './methods/rosa';
import { Recomendacion, generarRecomendaciones } from './recomendaciones';
import type { Metodo, useErgo } from './store';

type Estado = ReturnType<typeof useErgo.getState>;

export interface Intermedio {
  etiqueta: string;
  valor: number;
  nota?: string;
}

export type Origen = 'IA' | 'IA, corregido a mano' | 'Manual';

export interface LadoInforme {
  nombre: string;
  /** De dónde salió cada factor (clave del factor → origen). */
  origen: Record<string, Origen>;
  final: number;
  nivel: NivelRiesgo;
  factores: Factor[];
  intermedios: Intermedio[];
  celdas: Record<string, Celda>;
}

export interface TablaCombinacion {
  clave: string;
  titulo: string;
  filaTitulo: string;
  colTitulo: string;
  filas: string[];
  columnas: string[];
  datos: number[][];
}

export interface InformeModelo {
  clave: Metodo;
  metodo: 'RULA' | 'REBA' | 'ROSA';
  nombreCompleto: string;
  max: number;
  lados: LadoInforme[];
  peor: LadoInforme;
  tablas: TablaCombinacion[];
  recomendaciones: Recomendacion[];
  conclusiones: string[];
  limitaciones: string[];
  referencias: string[];
}

const CAMPOS: Record<Metodo, Record<string, string[]>> = {
  rula: {
    brazo: ['L.brazoAngulo', 'L.hombroElevado', 'L.brazoAbducido', 'L.brazoApoyado'],
    antebrazo: ['L.antebrazoAngulo', 'L.antebrazoFueraLinea'],
    muneca: ['L.munecaAngulo', 'L.munecaDesviada'],
    giro: ['L.giroExtremo'],
    cuello: ['C.cuelloAngulo', 'C.cuelloRotado', 'C.cuelloInclinado'],
    tronco: ['C.troncoAngulo', 'C.troncoRotado', 'C.troncoInclinado'],
    piernas: ['C.piernasApoyadas'],
  },
  reba: {
    tronco: ['C.troncoAngulo', 'C.troncoTorsionInclinacion'],
    cuello: ['C.cuelloAngulo', 'C.cuelloTorsionInclinacion'],
    piernas: ['C.piernasApoyo', 'C.sentado', 'C.rodillaFlexion'],
    brazo: ['L.brazoAngulo', 'L.brazoAbducidoRotado', 'L.hombroElevado', 'L.brazoApoyoGravedad'],
    antebrazo: ['L.antebrazoAngulo'],
    muneca: ['L.munecaAngulo', 'L.munecaTorsionDesviacion'],
  },
  rosa: {
    altura: ['alturaAsiento', 'alturaEspacioInsuficiente', 'alturaNoRegulable'],
    profundidad: ['profundidad', 'profundidadNoRegulable'],
    reposabrazos: ['reposabrazos', 'reposabrazosSeparados', 'reposabrazosDuros', 'reposabrazosNoRegulables'],
    respaldo: ['respaldo', 'superficieAlta', 'respaldoNoRegulable', 'tiempoSilla'],
    pantalla: ['pantalla', 'pantallaGiroCuello', 'pantallaLejos', 'pantallaReflejos', 'pantallaSinAtril', 'tiempoPantalla'],
    telefono: ['telefono', 'telefonoCuelloHombro', 'telefonoSinManosLibres', 'tiempoTelefono'],
    raton: ['raton', 'ratonPinza', 'ratonAlturaDistinta', 'ratonReposamanosDuro', 'tiempoRaton'],
    teclado: ['teclado', 'tecladoDesviacion', 'tecladoAlto', 'tecladoAlcanceCabeza', 'tecladoNoRegulable', 'tiempoTeclado'],
  },
};

/** Compara los valores actuales con los que sugirió la IA. */
function origenes(m: Metodo, s: Estado, lado?: 'izq' | 'der'): Record<string, Origen> {
  const ia = s.ia[m]?.valores as Record<string, Record<string, unknown>> | undefined;
  const leer = (fuente: 'actual' | 'ia', ruta: string): unknown => {
    if (m === 'rosa') return fuente === 'actual' ? (s.rosa as unknown as Record<string, unknown>)[ruta] : (ia as unknown as Record<string, unknown> | undefined)?.[ruta];
    const [g, k] = ruta.split('.');
    const grupo = g === 'C' ? 'comun' : lado!;
    const obj = fuente === 'actual' ? (s[m] as unknown as Record<string, Record<string, unknown>>)[grupo] : ia?.[grupo];
    return obj?.[k];
  };
  return Object.fromEntries(
    Object.entries(CAMPOS[m]).map(([clave, rutas]) => {
      if (!ia) return [clave, 'Manual' as Origen];
      const igual = rutas.every((r) => leer('actual', r) === leer('ia', r));
      return [clave, (igual ? 'IA' : 'IA, corregido a mano') as Origen];
    }),
  );
}

export const pct = (v: number, max: number) => Math.round((v / max) * 100);

/** Aporte relativo de un factor (0 = postura neutra, 100 = máximo del factor). */
export const aporte = (f: Factor) => (f.maximo > 1 ? Math.round(((f.total - 1) / (f.maximo - 1)) * 100) : 0);

const rango = (desde: number, hasta: number) => Array.from({ length: hasta - desde + 1 }, (_, i) => String(desde + i));

const REF = {
  ergRula: 'Diego-Mas, J. A. (2025). Evaluación postural mediante el método RULA. Ergonautas, Universitat Politècnica de València. https://www.ergonautas.upv.es/metodos/rula/rula-ayuda.php',
  ergReba: 'Diego-Mas, J. A. (2025). Evaluación postural mediante el método REBA. Ergonautas, Universitat Politècnica de València. https://www.ergonautas.upv.es/metodos/reba/reba-ayuda.php',
  ergRosa: 'Diego-Mas, J. A. (2025). Evaluación de puestos de oficina mediante el método ROSA. Ergonautas, Universitat Politècnica de València. https://www.ergonautas.upv.es/metodos/rosa/rosa-ayuda.php',
  mca: 'McAtamney, L., & Corlett, E. N. (1993). RULA: A survey method for the investigation of work-related upper limb disorders. Applied Ergonomics, 24(2), 91–99. https://doi.org/10.1016/0003-6870(93)90080-S',
  hig: 'Hignett, S., & McAtamney, L. (2000). Rapid Entire Body Assessment (REBA). Applied Ergonomics, 31(2), 201–205. https://doi.org/10.1016/S0003-6870(99)00039-3',
  ntp601: 'Nogareda Cuixart, S. (2001). NTP 601: Evaluación de las condiciones de trabajo: carga postural. Método REBA (Rapid Entire Body Assessment). Instituto Nacional de Seguridad e Higiene en el Trabajo.',
  sonne: 'Sonne, M., Villalta, D. L., & Andrews, D. M. (2012). Development and evaluation of an office ergonomic risk checklist: ROSA – Rapid office strain assessment. Applied Ergonomics, 43(1), 98–108. https://doi.org/10.1016/j.apergo.2011.03.008',
  ntp1173: 'Instituto Nacional de Seguridad y Salud en el Trabajo. (2022). NTP 1173: Modelo para la evaluación de puestos de trabajo en oficina: método ROSA (Rapid Office Strain Assessment). INSST.',
};

const LIMITACION_GENERAL =
  'ErgoSim es una herramienta académica de apoyo: el resultado depende de la calidad de la observación y no reemplaza la evaluación de un profesional en Seguridad y Salud en el Trabajo.';

function conclusionesDe(metodo: string, lados: LadoInforme[], peor: LadoInforme): string[] {
  const top = [...peor.factores]
    .filter((f) => aporte(f) > 0)
    .sort((a, b) => aporte(b) - aporte(a))
    .slice(0, 3)
    .map((f) => `${f.nombre.toLowerCase()} (${aporte(f)} % de su máximo)`);
  const out = [
    `La evaluación con ${metodo} obtiene una puntuación de ${peor.final}${lados.length > 1 ? ` en el ${peor.nombre.toLowerCase()}, el más desfavorable` : ''}, con riesgo ${peor.nivel.riesgo.toLowerCase()} (nivel de actuación ${peor.nivel.nivel}). ${peor.nivel.actuacion}`,
  ];
  if (lados.length > 1) {
    const [a, b] = lados;
    out.push(
      a.final === b.final
        ? `Ambos lados obtienen la misma puntuación (${a.final}).`
        : `El ${a.nombre.toLowerCase()} obtiene ${a.final} y el ${b.nombre.toLowerCase()} ${b.final}; conviene priorizar el lado con mayor puntuación.`,
    );
  }
  out.push(
    top.length
      ? `Los elementos que más se alejan de la postura de referencia son: ${top.join(', ')}.`
      : 'Ningún elemento se aleja de la postura de referencia.',
  );
  return out;
}

export function informeRula(s: Estado): InformeModelo {
  const lados: LadoInforme[] = (['izq', 'der'] as const).map((l) => {
    const r = calcularRula(s.rula[l], s.rula.comun);
    return {
      nombre: l === 'izq' ? 'Lado izquierdo' : 'Lado derecho',
      origen: origenes('rula', s, l),
      final: r.final,
      nivel: r.nivel,
      factores: r.factores,
      intermedios: [
        { etiqueta: 'Grupo A (Tabla A)', valor: r.grupoA },
        { etiqueta: 'Actividad muscular A', valor: r.extras.actividadA },
        { etiqueta: 'Carga o fuerza A', valor: r.extras.cargaA },
        { etiqueta: 'Puntuación C', valor: r.C },
        { etiqueta: 'Grupo B (Tabla B)', valor: r.grupoB },
        { etiqueta: 'Actividad muscular B', valor: r.extras.actividadB },
        { etiqueta: 'Carga o fuerza B', valor: r.extras.cargaB },
        { etiqueta: 'Puntuación D', valor: r.D },
        { etiqueta: 'Puntuación final (Tabla C)', valor: r.final },
      ],
      celdas: r.celdas,
    };
  });
  const peor = lados[0].final >= lados[1].final ? lados[0] : lados[1];
  const ladoPeor = peor === lados[0] ? s.rula.izq : s.rula.der;
  const extrasPeor = calcularRula(ladoPeor, s.rula.comun).extras;
  return {
    clave: 'rula',
    metodo: 'RULA',
    nombreCompleto: 'RULA · Rapid Upper Limb Assessment',
    max: RULA_MAX,
    lados,
    peor,
    tablas: [
      {
        clave: 'A',
        titulo: 'Tabla A · Puntuación del grupo A',
        filaTitulo: 'Brazo · Antebrazo',
        colTitulo: 'Muñeca · Giro',
        filas: RULA_TABLA_A.map((_, i) => `${Math.floor(i / 3) + 1}·${(i % 3) + 1}`),
        columnas: Array.from({ length: 8 }, (_, i) => `${Math.floor(i / 2) + 1}·${(i % 2) + 1}`),
        datos: RULA_TABLA_A,
      },
      {
        clave: 'B',
        titulo: 'Tabla B · Puntuación del grupo B',
        filaTitulo: 'Cuello',
        colTitulo: 'Tronco · Piernas',
        filas: rango(1, 6),
        columnas: Array.from({ length: 12 }, (_, i) => `${Math.floor(i / 2) + 1}·${(i % 2) + 1}`),
        datos: RULA_TABLA_B,
      },
      {
        clave: 'C',
        titulo: 'Tabla C · Puntuación final',
        filaTitulo: 'Puntuación C',
        colTitulo: 'Puntuación D',
        filas: [...rango(1, 7), '8+'],
        columnas: [...rango(1, 6), '7+'],
        datos: RULA_TABLA_C,
      },
    ],
    recomendaciones: generarRecomendaciones('RULA', peor.factores, peor.nivel.color, {
      carga: Math.max(extrasPeor.cargaA, extrasPeor.cargaB),
      cargaMax: 3,
      actividad: Math.max(extrasPeor.actividadA, extrasPeor.actividadB),
    }),
    conclusiones: conclusionesDe('RULA', lados, peor),
    limitaciones: [
      'RULA se centra en el cuello, el tronco y los miembros superiores; las piernas tienen un peso muy bajo en la puntuación.',
      'Evalúa una postura concreta (la más frecuente o la más desfavorable), no la exposición acumulada durante la jornada.',
      'No considera vibraciones, temperatura, factores psicosociales ni la duración total de la tarea.',
      'Decisión de esta herramienta: no se suma «brazo rotado» (solo aparece en Ergonautas; ver docs/fuentes.md, D1) y la puntuación del brazo nunca baja de 1 (D7).',
      LIMITACION_GENERAL,
    ],
    referencias: [REF.mca, REF.ergRula],
  };
}

export function informeReba(s: Estado): InformeModelo {
  const lados: LadoInforme[] = (['izq', 'der'] as const).map((l) => {
    const r = calcularReba(s.reba[l], s.reba.comun);
    return {
      nombre: l === 'izq' ? 'Lado izquierdo' : 'Lado derecho',
      origen: origenes('reba', s, l),
      final: r.final,
      nivel: r.nivel,
      factores: r.factores,
      intermedios: [
        { etiqueta: 'Tabla A', valor: r.tablaA },
        { etiqueta: 'Carga o fuerza', valor: r.extras.carga },
        { etiqueta: 'Puntuación A', valor: r.puntuacionA },
        { etiqueta: 'Tabla B', valor: r.tablaB },
        { etiqueta: 'Agarre', valor: r.extras.agarre },
        { etiqueta: 'Puntuación B', valor: r.puntuacionB },
        { etiqueta: 'Puntuación C (Tabla C)', valor: r.C },
        { etiqueta: 'Actividad', valor: r.extras.actividad },
        { etiqueta: 'Puntuación final', valor: r.final },
      ],
      celdas: r.celdas,
    };
  });
  const peor = lados[0].final >= lados[1].final ? lados[0] : lados[1];
  const ex = calcularReba(peor === lados[0] ? s.reba.izq : s.reba.der, s.reba.comun).extras;
  return {
    clave: 'reba',
    metodo: 'REBA',
    nombreCompleto: 'REBA · Rapid Entire Body Assessment',
    max: REBA_MAX,
    lados,
    peor,
    tablas: [
      {
        clave: 'A',
        titulo: 'Tabla A · Tronco, cuello y piernas',
        filaTitulo: 'Tronco',
        colTitulo: 'Cuello · Piernas',
        filas: rango(1, 5),
        columnas: Array.from({ length: 12 }, (_, i) => `${Math.floor(i / 4) + 1}·${(i % 4) + 1}`),
        datos: REBA_TABLA_A,
      },
      {
        clave: 'B',
        titulo: 'Tabla B · Brazo, antebrazo y muñeca',
        filaTitulo: 'Brazo',
        colTitulo: 'Antebrazo · Muñeca',
        filas: rango(1, 6),
        columnas: Array.from({ length: 6 }, (_, i) => `${Math.floor(i / 3) + 1}·${(i % 3) + 1}`),
        datos: REBA_TABLA_B,
      },
      {
        clave: 'C',
        titulo: 'Tabla C · Puntuación C',
        filaTitulo: 'Puntuación A',
        colTitulo: 'Puntuación B',
        filas: rango(1, 12),
        columnas: rango(1, 12),
        datos: REBA_TABLA_C,
      },
    ],
    recomendaciones: generarRecomendaciones('REBA', peor.factores, peor.nivel.color, {
      carga: ex.carga,
      cargaMax: 3,
      agarre: ex.agarre,
      actividad: ex.actividad,
    }),
    conclusiones: conclusionesDe('REBA', lados, peor),
    limitaciones: [
      'REBA es un método general de cuerpo entero; su sensibilidad para detalles de la extremidad superior es menor que la de RULA (NTP 601).',
      'Valora una postura puntual; si la tarea tiene varias fases conviene evaluar cada una.',
      'La carga se clasifica en tres rangos (< 5, 5–10 y > 10 kg); no sustituye métodos específicos de manipulación de cargas.',
      'Decisión de esta herramienta: torsión o inclinación de cuello y tronco suman un solo punto (docs/fuentes.md, D4).',
      LIMITACION_GENERAL,
    ],
    referencias: [REF.hig, REF.ntp601, REF.ergReba],
  };
}

export function informeRosa(s: Estado): InformeModelo {
  const r = calcularRosa(s.rosa);
  const lado: LadoInforme = {
    nombre: 'Puesto de oficina',
    origen: origenes('rosa', s),
    final: r.final,
    nivel: r.nivel,
    factores: r.factores,
    intermedios: [
      { etiqueta: 'Tabla A (silla)', valor: r.tablaA },
      { etiqueta: 'Silla + tiempo de uso', valor: r.silla },
      { etiqueta: 'Tabla B (pantalla y teléfono)', valor: r.tablaB },
      { etiqueta: 'Tabla C (ratón y teclado)', valor: r.tablaC },
      { etiqueta: 'Tabla D (pantalla y periféricos)', valor: r.perifericos },
      { etiqueta: 'Puntuación final (Tabla E)', valor: r.final },
    ],
    celdas: r.celdas,
  };
  return {
    clave: 'rosa',
    metodo: 'ROSA',
    nombreCompleto: 'ROSA · Rapid Office Strain Assessment',
    max: ROSA_MAX,
    lados: [lado],
    peor: lado,
    tablas: [
      { clave: 'A', titulo: 'Tabla A · Silla', filaTitulo: 'Altura + profundidad', colTitulo: 'Reposabrazos + respaldo', filas: rango(2, 8), columnas: rango(2, 9), datos: ROSA_TABLA_A },
      { clave: 'B', titulo: 'Tabla B · Pantalla y teléfono', filaTitulo: 'Teléfono', colTitulo: 'Pantalla', filas: rango(0, 6), columnas: rango(0, 7), datos: ROSA_TABLA_B },
      { clave: 'C', titulo: 'Tabla C · Ratón y teclado', filaTitulo: 'Ratón', colTitulo: 'Teclado', filas: rango(0, 7), columnas: rango(0, 7), datos: ROSA_TABLA_C },
      { clave: 'D', titulo: 'Tabla D · Pantalla y periféricos', filaTitulo: 'Tabla B', colTitulo: 'Tabla C', filas: rango(1, 9), columnas: rango(1, 9), datos: ROSA_TABLA_D },
      { clave: 'E', titulo: 'Tabla E · Puntuación final', filaTitulo: 'Silla', colTitulo: 'Pantalla y periféricos', filas: rango(1, 10), columnas: rango(1, 10), datos: ROSA_TABLA_E },
    ],
    recomendaciones: generarRecomendaciones('ROSA', r.factores, r.nivel.color),
    conclusiones: [
      ...conclusionesDe('ROSA', [lado], lado),
      r.final >= 5
        ? 'La puntuación alcanza el nivel de acción del método (5 o más), asociado por sus autores a un aumento significativo del malestar: se recomiendan cambios inmediatos.'
        : 'La puntuación está por debajo del nivel de acción del método (5); el riesgo es menor, pero no inexistente.',
    ],
    limitaciones: [
      'ROSA solo aplica a puestos de oficina con computador: silla, pantalla, teléfono, ratón y teclado.',
      'El nivel de acción (5) se estableció a partir del malestar declarado por 72 trabajadores administrativos (Sonne et al., 2012).',
      'La escala de cinco niveles de actuación es la propuesta por Ergonautas; el artículo original solo define el nivel 5 (docs/fuentes.md, D6).',
      LIMITACION_GENERAL,
    ],
    referencias: [REF.sonne, REF.ntp1173, REF.ergRosa],
  };
}

export const construirInforme = (m: Metodo, s: Estado) => (m === 'rula' ? informeRula(s) : m === 'reba' ? informeReba(s) : informeRosa(s));

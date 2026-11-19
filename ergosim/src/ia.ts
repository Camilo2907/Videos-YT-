// Análisis de una foto con Claude (capacidad `sample` de la página publicada).
// Claude solo ESTIMA a partir de lo que ve; cada valor se valida y el evaluador puede corregirlo.
import { RULA_CARGAS } from './methods/rula';
import { REBA_AGARRES, REBA_CARGAS } from './methods/reba';
import { ROSA_TIEMPOS } from './methods/rosa';
import type { Metodo } from './store';

type Campo =
  | { tipo: 'angulo'; min: number; max: number; desc: string }
  | { tipo: 'bool'; desc: string }
  | { tipo: 'enum'; opciones: string[]; desc: string };

const ang = (min: number, max: number, desc: string): Campo => ({ tipo: 'angulo', min, max, desc });
const bool = (desc: string): Campo => ({ tipo: 'bool', desc });
const en = (opciones: string[], desc: string): Campo => ({ tipo: 'enum', opciones, desc });

const RULA_LADO: Record<string, Campo> = {
  brazoAngulo: ang(-60, 180, 'ángulo brazo-tronco en grados; + flexión (hacia delante), − extensión (hacia atrás)'),
  hombroElevado: bool('hombro elevado o encogido'),
  brazoAbducido: bool('brazo separado lateralmente del tronco'),
  brazoApoyado: bool('el brazo descansa sobre un apoyo o la persona se inclina apoyándolo'),
  antebrazoAngulo: ang(0, 150, 'flexión del codo en grados (0 = brazo recto, 90 = ángulo recto)'),
  antebrazoFueraLinea: bool('el antebrazo cruza la línea media del cuerpo o trabaja hacia un lado'),
  munecaAngulo: ang(-80, 80, 'flexión (+) o extensión (−) de la muñeca desde la posición neutra'),
  munecaDesviada: bool('desviación radial o cubital de la muñeca'),
  giroExtremo: bool('pronación o supinación en o cerca del final del rango'),
  actividadA: bool('postura de brazo mantenida más de 1 minuto o repetida más de 4 veces por minuto (estímalo por el tipo de tarea)'),
  cargaA: en(RULA_CARGAS.map((c) => c.valor), `carga o fuerza en la mano: ${RULA_CARGAS.map((c) => `${c.valor} = ${c.texto}`).join('; ')}`),
};
const RULA_COMUN: Record<string, Campo> = {
  cuelloAngulo: ang(-40, 80, 'ángulo cabeza-tronco; + flexión, − extensión'),
  cuelloRotado: bool('cabeza girada'),
  cuelloInclinado: bool('cabeza inclinada lateralmente'),
  troncoAngulo: ang(0, 120, 'flexión del tronco respecto a la vertical (0 si está erguido o sentado bien apoyado)'),
  troncoRotado: bool('tronco girado'),
  troncoInclinado: bool('tronco inclinado lateralmente'),
  piernasApoyadas: bool('piernas y pies apoyados con el peso repartido de forma simétrica'),
  actividadB: bool('postura de cuello/tronco mantenida más de 1 minuto o repetida más de 4 veces por minuto'),
  cargaB: en(RULA_CARGAS.map((c) => c.valor), 'carga o fuerza soportada por el cuerpo (mismas opciones que cargaA)'),
};
const REBA_LADO: Record<string, Campo> = {
  brazoAngulo: ang(-60, 180, 'ángulo brazo-tronco; + flexión, − extensión'),
  brazoAbducidoRotado: bool('brazo abducido o rotado'),
  hombroElevado: bool('hombro elevado'),
  brazoApoyoGravedad: bool('brazo apoyado o colgando a favor de la gravedad'),
  antebrazoAngulo: ang(0, 150, 'flexión del codo en grados'),
  munecaAngulo: ang(-80, 80, 'flexión (+) o extensión (−) de la muñeca'),
  munecaTorsionDesviacion: bool('torsión o desviación lateral de la muñeca'),
  agarre: en(REBA_AGARRES.map((g) => g.valor), `calidad del agarre: ${REBA_AGARRES.map((g) => `${g.valor} = ${g.detalle}`).join('; ')}`),
};
const REBA_COMUN: Record<string, Campo> = {
  troncoAngulo: ang(-40, 120, 'tronco respecto a la vertical; + flexión, − extensión, 0 erguido'),
  troncoTorsionInclinacion: bool('tronco girado o inclinado lateralmente'),
  cuelloAngulo: ang(-40, 80, 'cabeza respecto al tronco; + flexión, − extensión'),
  cuelloTorsionInclinacion: bool('cabeza girada o inclinada lateralmente'),
  piernasApoyo: en(['bilateral', 'unilateral'], 'bilateral = sentado, andando o de pie sobre ambos pies; unilateral = sobre un pie, apoyo ligero o postura inestable'),
  sentado: bool('la persona está sentada'),
  rodillaFlexion: ang(0, 150, 'flexión de rodillas en grados (0 = rectas)'),
  carga: en(REBA_CARGAS.map((c) => c.valor), `peso de la carga: ${REBA_CARGAS.map((c) => `${c.valor} = ${c.texto}`).join('; ')}`),
  cargaBrusca: bool('la fuerza se aplica de forma brusca'),
  actEstatica: bool('alguna parte del cuerpo se mantiene estática más de 1 minuto'),
  actRepetitiva: bool('movimientos repetidos más de 4 veces por minuto'),
  actCambios: bool('cambios de postura importantes o postura inestable'),
};
const TIEMPO = en(ROSA_TIEMPOS.map((t) => t.valor), `tiempo de uso diario: ${ROSA_TIEMPOS.map((t) => `${t.valor} = ${t.texto}`).join('; ')} (si no se puede saber por la foto, usa "mas4" para un puesto de oficina de jornada completa)`);
const ROSA: Record<string, Campo> = {
  alturaAsiento: en(['rodillas90', 'bajo', 'alto', 'sinContacto'], 'rodillas90 = rodillas a ~90°; bajo = rodilla < 90°; alto = rodilla > 90°; sinContacto = pies sin tocar el suelo'),
  alturaEspacioInsuficiente: bool('espacio insuficiente para las piernas bajo la mesa'),
  alturaNoRegulable: bool('altura del asiento no regulable (sin palanca o mecanismo visible)'),
  profundidad: en(['correcta', 'larga', 'corta'], 'correcta ≈ 8 cm entre borde del asiento y la rodilla; larga < 8 cm; corta > 8 cm'),
  profundidadNoRegulable: bool('profundidad no regulable'),
  reposabrazos: en(['correctos', 'altos', 'bajos', 'sinReposabrazos'], 'correctos = codos apoyados a 90° y hombros relajados; altos = hombros encogidos; bajos = codos sin apoyo; sinReposabrazos = la silla no tiene'),
  reposabrazosSeparados: bool('reposabrazos demasiado separados'),
  reposabrazosDuros: bool('reposabrazos duros o dañados'),
  reposabrazosNoRegulables: bool('reposabrazos no regulables'),
  respaldo: en(['correcto', 'sinLumbar', 'inclinacion', 'sinRespaldo'], 'correcto = apoyo lumbar y 95°–110°; sinLumbar = sin apoyo lumbar; inclinacion = < 95° o > 110°; sinRespaldo = no hay o no se usa'),
  superficieAlta: bool('superficie de trabajo demasiado alta (hombros encogidos)'),
  respaldoNoRegulable: bool('respaldo no regulable'),
  tiempoSilla: TIEMPO,
  pantalla: en(['correcta', 'baja', 'alta'], 'correcta = a 40–75 cm y borde superior a la altura de los ojos; baja = obliga a flexionar el cuello; alta = obliga a extender el cuello'),
  pantallaGiroCuello: bool('hay que girar el cuello para ver la pantalla'),
  pantallaLejos: bool('pantalla a más de 75 cm'),
  pantallaReflejos: bool('brillos o reflejos en la pantalla'),
  pantallaSinAtril: bool('usa documentos en papel y no hay atril'),
  tiempoPantalla: TIEMPO,
  telefono: en(['correcto', 'lejos'], 'correcto = a 30 cm o menos y cuello neutro; lejos = a más de 30 cm'),
  telefonoCuelloHombro: bool('sujeta el teléfono entre cuello y hombro'),
  telefonoSinManosLibres: bool('sin opción de manos libres'),
  tiempoTelefono: TIEMPO,
  raton: en(['alineado', 'noAlineado'], 'alineado con el hombro, o no alineado / lejos del cuerpo'),
  ratonPinza: bool('ratón pequeño, agarre en pinza'),
  ratonAlturaDistinta: bool('ratón y teclado a distinta altura'),
  ratonReposamanosDuro: bool('reposamanos duro o puntos de presión'),
  tiempoRaton: TIEMPO,
  teclado: en(['recto', 'extendido'], 'recto = muñecas rectas; extendido = muñecas extendidas más de 15°'),
  tecladoDesviacion: bool('muñecas desviadas al escribir'),
  tecladoAlto: bool('teclado demasiado alto (hombros encogidos)'),
  tecladoAlcanceCabeza: bool('alcanza objetos por encima de la cabeza'),
  tecladoNoRegulable: bool('teclado o plataforma no regulable'),
  tiempoTeclado: TIEMPO,
};

const ESQUEMAS: Record<Metodo, { comun?: Record<string, Campo>; lado?: Record<string, Campo>; plano?: Record<string, Campo> }> = {
  rula: { comun: RULA_COMUN, lado: RULA_LADO },
  reba: { comun: REBA_COMUN, lado: REBA_LADO },
  rosa: { plano: ROSA },
};

export const PUNTOS = ['cabeza', 'hombro', 'codo', 'muneca', 'cadera', 'rodilla', 'tobillo'] as const;
export type Punto = (typeof PUNTOS)[number];

export interface ResultadoIA {
  metodo: Metodo;
  valores: Record<string, unknown>; // comun/izq/der o plano, ya validados
  ladoVisible: 'izq' | 'der' | 'ambos';
  puntos: Partial<Record<Punto, [number, number]>>;
  observaciones: string[];
  confianza: 'alta' | 'media' | 'baja';
  fecha: string;
}

const describir = (esq: Record<string, Campo>) =>
  Object.entries(esq)
    .map(([k, c]) => `    "${k}": ${c.tipo === 'angulo' ? `número entero (${c.min} a ${c.max})` : c.tipo === 'bool' ? 'true|false' : c.opciones.map((o) => `"${o}"`).join('|')}  // ${c.desc}`)
    .join('\n');

const NOMBRE: Record<Metodo, string> = {
  rula: 'RULA (McAtamney y Corlett, 1993)',
  reba: 'REBA (Hignett y McAtamney, 2000)',
  rosa: 'ROSA (Sonne, Villalta y Andrews, 2012)',
};

export function construirPrompt(m: Metodo, tarea: string): string {
  const e = ESQUEMAS[m];
  const cuerpo = e.plano
    ? `  "valores": {\n${describir(e.plano)}\n  },`
    : `  "comun": {\n${describir(e.comun!)}\n  },\n  "der": {\n${describir(e.lado!)}\n  },\n  "izq": { ...mismos campos que "der", para el lado izquierdo... },`;
  return `Eres un ergónomo que aplica el método ${NOMBRE[m]}. Observa la fotografía de un puesto de trabajo y estima, SOLO a partir de lo que se ve, los datos de entrada del método.
Descripción de la tarea dada por el evaluador: "${tarea.slice(0, 600) || 'no indicada'}".

Reglas:
- Mide los ángulos en el plano en que mejor se vean; si un dato no se ve, haz la estimación más prudente y dilo en "observaciones".
- Para el lado del cuerpo que no se ve, copia los valores del lado visible e indícalo en "ladoVisible".
- "puntos" son las coordenadas normalizadas (x, y entre 0 y 1, origen arriba a la izquierda) de las articulaciones del lado más visible; omite las que no se vean.
- No identifiques a la persona ni comentes rasgos personales.

Responde SOLO con un objeto JSON con esta forma:
{
${cuerpo}
  "ladoVisible": "izq"|"der"|"ambos",
  "puntos": { ${PUNTOS.map((p) => `"${p}": [x, y]`).join(', ')} },
  "observaciones": ["frases cortas en español sobre lo que se ve y lo que se supuso"],
  "confianza": "alta"|"media"|"baja"
}`;
}

function validarCampo(c: Campo, v: unknown, actual: unknown): unknown {
  if (c.tipo === 'angulo') {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(c.min, Math.min(c.max, n)) : actual;
  }
  if (c.tipo === 'bool') return typeof v === 'boolean' ? v : v === 'true' ? true : v === 'false' ? false : actual;
  return typeof v === 'string' && c.opciones.includes(v) ? v : actual;
}

function validarGrupo(esq: Record<string, Campo>, datos: unknown, actual: Record<string, unknown>) {
  const d = (datos && typeof datos === 'object' ? datos : {}) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(esq).map(([k, c]) => [k, validarCampo(c, d[k], actual[k])]));
}

/** Valida la respuesta de Claude contra el esquema; lo que falte o no sea válido conserva el valor actual. */
export function validarRespuesta(m: Metodo, r: unknown, actual: Record<string, unknown>): ResultadoIA {
  const o = (r && typeof r === 'object' ? r : {}) as Record<string, unknown>;
  const e = ESQUEMAS[m];
  let valores: Record<string, unknown>;
  if (e.plano) valores = validarGrupo(e.plano, o.valores, actual);
  else {
    const der = validarGrupo(e.lado!, o.der, actual.der as Record<string, unknown>);
    const izqBruto = o.izq && typeof o.izq === 'object' ? o.izq : o.der;
    valores = {
      comun: validarGrupo(e.comun!, o.comun, actual.comun as Record<string, unknown>),
      der,
      izq: validarGrupo(e.lado!, izqBruto, actual.izq as Record<string, unknown>),
    };
  }
  const puntos: ResultadoIA['puntos'] = {};
  const pb = (o.puntos && typeof o.puntos === 'object' ? o.puntos : {}) as Record<string, unknown>;
  for (const p of PUNTOS) {
    const v = pb[p];
    if (Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number' && n >= 0 && n <= 1)) puntos[p] = [v[0], v[1]];
  }
  const lv = o.ladoVisible;
  const conf = o.confianza;
  return {
    metodo: m,
    valores,
    ladoVisible: lv === 'izq' || lv === 'der' ? lv : 'ambos',
    puntos,
    observaciones: Array.isArray(o.observaciones) ? o.observaciones.filter((x): x is string => typeof x === 'string').slice(0, 8) : [],
    confianza: conf === 'alta' || conf === 'baja' ? conf : 'media',
    fecha: new Date().toISOString(),
  };
}

export const MENSAJE_ERROR: Record<string, string> = {
  not_granted: 'No se dio permiso para usar Claude en esta página. Puede seguir llenando los datos a mano.',
  sampling_disabled: 'Claude no está disponible para esta cuenta.',
  images_unavailable: 'Esta vista no puede enviar imágenes a Claude.',
  image_rejected: 'La imagen no se pudo usar (formato o tamaño). Pruebe con otra foto JPG o PNG.',
  rate_limited: 'Se alcanzó el límite de uso por ahora. Intente de nuevo en unos minutos.',
  refused: 'Claude no pudo analizar esta imagen. Pruebe con otra foto del puesto.',
  invalid_json: 'La respuesta no tuvo el formato esperado. Pulse «Analizar» de nuevo.',
  session_expired: 'La sesión expiró: vuelva a iniciar sesión en Claude.',
};

// Respuestas rápidas: lo que una foto no muestra (peso, frecuencia, agarre, horas de uso).
// Se aplican a los tres métodos con los criterios de cada uno (docs/fuentes.md).
import type { RulaCarga } from './methods/rula';
import type { RebaAgarre, RebaCarga } from './methods/reba';
import type { RosaTiempo } from './methods/rosa';
import type { Metodo } from './store';

export interface RespuestasRapidas {
  peso: 'menos2' | '2a5' | '5a10' | 'mas10';
  brusca: boolean;
  actividad: 'ocasional' | 'estatica' | 'repetitiva' | 'ambas';
  agarre: RebaAgarre;
  horasPC: RosaTiempo;
}

export const RESPUESTAS_INICIALES: RespuestasRapidas = { peso: 'menos2', brusca: false, actividad: 'ocasional', agarre: 'bueno', horasPC: '1a4' };

/** Carga RULA (Tabla 16): el tipo depende del peso y de si es estática/repetitiva o intermitente. */
export function rulaCargaDe(r: RespuestasRapidas): RulaCarga {
  if (r.brusca) return 'golpes';
  const sostenida = r.actividad !== 'ocasional';
  if (r.peso === 'menos2') return 'menos2';
  if (r.peso === 'mas10') return sostenida ? 'mas10est' : 'mas10int';
  return sostenida ? '2a10est' : '2a10int';
}

/** Carga REBA (Tabla 14): < 5 kg, 5–10 kg, > 10 kg. */
export const rebaCargaDe = (r: RespuestasRapidas): RebaCarga => (r.peso === 'mas10' ? 'mas10' : r.peso === '5a10' ? '5a10' : 'menos5');

/** Sobrescribe en los valores del método los campos que vienen de las respuestas rápidas. */
export function aplicarRespuestas(m: Metodo, valores: Record<string, unknown>, r: RespuestasRapidas): Record<string, unknown> {
  const estatica = r.actividad === 'estatica' || r.actividad === 'ambas';
  const repetitiva = r.actividad === 'repetitiva' || r.actividad === 'ambas';
  if (m === 'rosa') {
    return { ...valores, tiempoSilla: r.horasPC, tiempoPantalla: r.horasPC, tiempoRaton: r.horasPC, tiempoTeclado: r.horasPC };
  }
  const g = valores as { comun: Record<string, unknown>; izq: Record<string, unknown>; der: Record<string, unknown> };
  if (m === 'rula') {
    const carga = rulaCargaDe(r);
    const act = estatica || repetitiva;
    return {
      comun: { ...g.comun, actividadB: act, cargaB: carga },
      izq: { ...g.izq, actividadA: act, cargaA: carga },
      der: { ...g.der, actividadA: act, cargaA: carga },
    };
  }
  return {
    comun: { ...g.comun, carga: rebaCargaDe(r), cargaBrusca: r.brusca, actEstatica: estatica, actRepetitiva: repetitiva },
    izq: { ...g.izq, agarre: r.agarre },
    der: { ...g.der, agarre: r.agarre },
  };
}

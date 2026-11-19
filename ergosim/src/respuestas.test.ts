import { describe, expect, it } from 'vitest';
import { RESPUESTAS_INICIALES, aplicarRespuestas, rebaCargaDe, rulaCargaDe } from './respuestas';

describe('Respuestas rápidas → criterios de cada método', () => {
  const R = RESPUESTAS_INICIALES;
  it('carga RULA (Tabla 16)', () => {
    expect(rulaCargaDe({ ...R, peso: 'menos2' })).toBe('menos2');
    expect(rulaCargaDe({ ...R, peso: '2a5', actividad: 'ocasional' })).toBe('2a10int');
    expect(rulaCargaDe({ ...R, peso: '5a10', actividad: 'repetitiva' })).toBe('2a10est');
    expect(rulaCargaDe({ ...R, peso: 'mas10', actividad: 'ocasional' })).toBe('mas10int');
    expect(rulaCargaDe({ ...R, peso: 'mas10', actividad: 'estatica' })).toBe('mas10est');
    expect(rulaCargaDe({ ...R, peso: 'menos2', brusca: true })).toBe('golpes');
  });
  it('carga REBA (Tabla 14)', () => {
    expect(rebaCargaDe({ ...R, peso: '2a5' })).toBe('menos5');
    expect(rebaCargaDe({ ...R, peso: '5a10' })).toBe('5a10');
    expect(rebaCargaDe({ ...R, peso: 'mas10' })).toBe('mas10');
  });
  it('se aplican a ambos lados y a ROSA', () => {
    const v = aplicarRespuestas('reba', { comun: {}, izq: {}, der: {} }, { ...R, agarre: 'malo', actividad: 'ambas', brusca: true }) as Record<string, Record<string, unknown>>;
    expect(v.izq.agarre).toBe('malo');
    expect(v.der.agarre).toBe('malo');
    expect(v.comun.actEstatica).toBe(true);
    expect(v.comun.actRepetitiva).toBe(true);
    expect(v.comun.cargaBrusca).toBe(true);
    const r = aplicarRespuestas('rosa', { pantalla: 'baja' }, { ...R, horasPC: 'mas4' });
    expect(r).toMatchObject({ pantalla: 'baja', tiempoSilla: 'mas4', tiempoTeclado: 'mas4' });
  });
});

import { describe, expect, it } from 'vitest';
import { construirPrompt, validarRespuesta } from './ia';
import { RULA_COMUN_INICIAL, RULA_LADO_INICIAL, ROSA_INICIAL } from './store';

describe('IA · validación de la respuesta', () => {
  const actual = { comun: RULA_COMUN_INICIAL, izq: RULA_LADO_INICIAL, der: RULA_LADO_INICIAL } as unknown as Record<string, unknown>;
  it('acota ángulos, ignora valores inválidos y copia el lado visible', () => {
    const r = validarRespuesta('rula', {
      comun: { cuelloAngulo: 200, troncoAngulo: 'x', cargaB: 'inventado', cuelloRotado: true },
      der: { brazoAngulo: 72.4, giroExtremo: false },
      ladoVisible: 'der',
      puntos: { hombro: [0.4, 0.3], codo: [2, 0.5] },
      confianza: 'alta',
      observaciones: ['Vista lateral derecha'],
    }, actual);
    const v = r.valores as { comun: Record<string, unknown>; izq: Record<string, unknown>; der: Record<string, unknown> };
    expect(v.comun.cuelloAngulo).toBe(80);
    expect(v.comun.troncoAngulo).toBe(RULA_COMUN_INICIAL.troncoAngulo);
    expect(v.comun.cargaB).toBe(RULA_COMUN_INICIAL.cargaB);
    expect(v.comun.cuelloRotado).toBe(true);
    expect(v.der.brazoAngulo).toBe(72);
    expect(v.izq.brazoAngulo).toBe(72); // sin datos del izquierdo: se copia el visible
    expect(r.puntos.hombro).toEqual([0.4, 0.3]);
    expect(r.puntos.codo).toBeUndefined();
    expect(r.confianza).toBe('alta');
  });
  it('ROSA: solo acepta opciones válidas', () => {
    const r = validarRespuesta('rosa', { valores: { pantalla: 'baja', teclado: 'roto', tiempoSilla: 'mas4' } }, ROSA_INICIAL as unknown as Record<string, unknown>);
    const v = r.valores as Record<string, unknown>;
    expect(v.pantalla).toBe('baja');
    expect(v.teclado).toBe(ROSA_INICIAL.teclado);
    expect(r.confianza).toBe('media');
  });
  it('el prompt incluye todos los campos del método', () => {
    const t = construirPrompt('reba', 'Levantar cajas');
    for (const k of ['troncoAngulo', 'rodillaFlexion', 'agarre', 'actCambios', 'puntos']) expect(t).toContain(k);
  });
});

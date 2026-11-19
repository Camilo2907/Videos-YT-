import { describe, expect, it } from 'vitest';
import {
  RULA_TABLA_A,
  RULA_TABLA_B,
  RULA_TABLA_C,
  calcularRula,
  rulaBrazoBase,
  rulaCuelloBase,
  rulaDesdePuntuaciones,
  rulaMunecaBase,
  rulaNivel,
  rulaTroncoBase,
} from './rula';
import {
  REBA_TABLA_A,
  REBA_TABLA_B,
  REBA_TABLA_C,
  calcularReba,
  rebaDesdePuntuaciones,
  rebaNivel,
  rebaRodillaIncremento,
  rebaTroncoBase,
} from './reba';
import { ROSA_TABLA_D, ROSA_TABLA_E, RosaEntrada, calcularRosa, rosaDesdePuntuaciones, rosaNivel } from './rosa';

// ---------------- RULA ----------------
describe('RULA · tablas ([ERG-RULA] = [HEDGE-RULA])', () => {
  it('tienen las dimensiones correctas', () => {
    expect(RULA_TABLA_A).toHaveLength(18);
    RULA_TABLA_A.forEach((f) => expect(f).toHaveLength(8));
    expect(RULA_TABLA_B).toHaveLength(6);
    RULA_TABLA_B.forEach((f) => expect(f).toHaveLength(12));
    expect(RULA_TABLA_C).toHaveLength(8);
    RULA_TABLA_C.forEach((f) => expect(f).toHaveLength(7));
  });
  it('celdas de control', () => {
    expect(RULA_TABLA_A[0][0]).toBe(1);
    expect(RULA_TABLA_A[17][7]).toBe(9);
    expect(RULA_TABLA_A[14][7]).toBe(8); // brazo 5, antebrazo 3, muñeca 4, giro 2
    expect(RULA_TABLA_B[0][1]).toBe(3); // cuello 1, tronco 1, piernas 2
    expect(RULA_TABLA_B[5][11]).toBe(9);
    expect(RULA_TABLA_C[7][6]).toBe(7);
    expect(RULA_TABLA_C[0][0]).toBe(1);
  });
});

describe('RULA · rangos angulares', () => {
  it('brazo', () => {
    expect([-30, -20, 0, 20, 21, 45, 46, 90, 91].map(rulaBrazoBase)).toEqual([2, 1, 1, 1, 2, 2, 3, 3, 4]);
  });
  it('muñeca, cuello y tronco', () => {
    expect([0, 5, 14, 15, -20].map(rulaMunecaBase)).toEqual([1, 2, 2, 3, 3]);
    expect([0, 10, 11, 20, 21, -5].map(rulaCuelloBase)).toEqual([1, 1, 2, 2, 3, 4]);
    expect([0, 10, 20, 21, 60, 61].map(rulaTroncoBase)).toEqual([1, 2, 2, 3, 3, 4]);
  });
  it('niveles de actuación (Tabla 18)', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((p) => rulaNivel(p).nivel)).toEqual([1, 1, 2, 2, 3, 3, 4]);
  });
});

describe('RULA · ejemplo resuelto [EP-RULA-EJ] = 7', () => {
  it('desde puntuaciones', () => {
    const r = rulaDesdePuntuaciones({
      brazo: 3, antebrazo: 2, muneca: 4, giro: 2, actividadA: 0, cargaA: 2,
      cuello: 3, tronco: 2, piernas: 1, actividadB: 0, cargaB: 2,
    });
    expect(r.grupoA).toBe(5);
    expect(r.C).toBe(7);
    expect(r.grupoB).toBe(3);
    expect(r.D).toBe(5);
    expect(r.final).toBe(7);
  });
  it('desde ángulos', () => {
    const r = calcularRula(
      {
        brazoAngulo: 60, hombroElevado: false, brazoAbducido: false, brazoApoyado: false,
        antebrazoAngulo: 40, antebrazoFueraLinea: false,
        munecaAngulo: 30, munecaDesviada: true, giroExtremo: true,
        actividadA: false, cargaA: '2a10est',
      },
      {
        cuelloAngulo: 30, cuelloRotado: false, cuelloInclinado: false,
        troncoAngulo: 10, troncoRotado: false, troncoInclinado: false,
        piernasApoyadas: true, actividadB: false, cargaB: '2a10est',
      },
    );
    expect(r.final).toBe(7);
    expect(r.nivel.nivel).toBe(4);
  });
  it('el brazo nunca baja de 1 (decisión D7)', () => {
    const r = calcularRula(
      {
        brazoAngulo: 0, hombroElevado: false, brazoAbducido: false, brazoApoyado: true,
        antebrazoAngulo: 80, antebrazoFueraLinea: false, munecaAngulo: 0, munecaDesviada: false,
        giroExtremo: false, actividadA: false, cargaA: 'menos2',
      },
      {
        cuelloAngulo: 5, cuelloRotado: false, cuelloInclinado: false, troncoAngulo: 0,
        troncoRotado: false, troncoInclinado: false, piernasApoyadas: true, actividadB: false, cargaB: 'menos2',
      },
    );
    expect(r.factores[0].total).toBe(1);
    expect(r.final).toBe(1);
  });
});

// ---------------- REBA ----------------
describe('REBA · tablas ([ERG-REBA] = [NTP601] = [HEDGE-REBA])', () => {
  it('dimensiones y celdas de control', () => {
    expect(REBA_TABLA_A).toHaveLength(5);
    REBA_TABLA_A.forEach((f) => expect(f).toHaveLength(12));
    expect(REBA_TABLA_B).toHaveLength(6);
    REBA_TABLA_B.forEach((f) => expect(f).toHaveLength(6));
    expect(REBA_TABLA_C).toHaveLength(12);
    REBA_TABLA_C.forEach((f) => expect(f).toHaveLength(12));
    expect(REBA_TABLA_A[0][8]).toBe(3); // tronco 1, cuello 3, piernas 1
    expect(REBA_TABLA_A[4][11]).toBe(9);
    expect(REBA_TABLA_B[5][5]).toBe(9);
    expect(REBA_TABLA_C[0][11]).toBe(7);
    expect(REBA_TABLA_C[11][0]).toBe(12);
  });
  it('rangos', () => {
    expect([0, 10, -10, 20, 21, -25, 60, 61].map(rebaTroncoBase)).toEqual([1, 2, 2, 2, 3, 3, 3, 4]);
    expect(rebaRodillaIncremento(45, false)).toBe(1);
    expect(rebaRodillaIncremento(70, false)).toBe(2);
    expect(rebaRodillaIncremento(70, true)).toBe(0);
    expect([1, 2, 3, 4, 7, 8, 10, 11, 15].map((p) => rebaNivel(p).nivel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });
});

describe('REBA · ejemplo resuelto [NTP601] = 9', () => {
  it('desde puntuaciones', () => {
    const r = rebaDesdePuntuaciones({
      tronco: 3, cuello: 1, piernas: 3, carga: 3,
      brazo: 2, antebrazo: 2, muneca: 1, agarre: 1, actividad: 1,
    });
    expect(r.tablaA).toBe(5);
    expect(r.puntuacionA).toBe(8);
    expect(r.tablaB).toBe(2);
    expect(r.puntuacionB).toBe(3);
    expect(r.C).toBe(8);
    expect(r.final).toBe(9);
  });
  it('desde ángulos', () => {
    const r = calcularReba(
      {
        brazoAngulo: 70, brazoAbducidoRotado: false, hombroElevado: false, brazoApoyoGravedad: true,
        antebrazoAngulo: 40, munecaAngulo: 0, munecaTorsionDesviacion: false, agarre: 'regular',
      },
      {
        troncoAngulo: 40, troncoTorsionInclinacion: false, cuelloAngulo: 0, cuelloTorsionInclinacion: false,
        piernasApoyo: 'bilateral', sentado: false, rodillaFlexion: 70, carga: 'mas10', cargaBrusca: true,
        actEstatica: false, actRepetitiva: false, actCambios: true,
      },
    );
    expect(r.final).toBe(9);
    expect(r.nivel.riesgo).toBe('Alto');
  });
});

// ---------------- ROSA ----------------
const rosaBase: RosaEntrada = {
  alturaAsiento: 'rodillas90', alturaEspacioInsuficiente: false, alturaNoRegulable: false,
  profundidad: 'correcta', profundidadNoRegulable: false,
  reposabrazos: 'correctos', reposabrazosSeparados: false, reposabrazosDuros: false, reposabrazosNoRegulables: false,
  respaldo: 'correcto', superficieAlta: false, respaldoNoRegulable: false, tiempoSilla: '1a4',
  pantalla: 'correcta', pantallaGiroCuello: false, pantallaLejos: false, pantallaReflejos: false, pantallaSinAtril: false, tiempoPantalla: '1a4',
  telefono: 'correcto', telefonoCuelloHombro: false, telefonoSinManosLibres: false, tiempoTelefono: '1a4',
  raton: 'alineado', ratonPinza: false, ratonAlturaDistinta: false, ratonReposamanosDuro: false, tiempoRaton: '1a4',
  teclado: 'recto', tecladoDesviacion: false, tecladoAlto: false, tecladoAlcanceCabeza: false, tecladoNoRegulable: false, tiempoTeclado: '1a4',
};

describe('ROSA · tablas', () => {
  it('D y E equivalen al máximo de sus entradas ([NTP1173])', () => {
    for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) expect(ROSA_TABLA_D[b - 1][c - 1]).toBe(Math.max(b, c));
    for (let s = 1; s <= 10; s++) for (let d = 1; d <= 10; d++) expect(ROSA_TABLA_E[s - 1][d - 1]).toBe(Math.max(s, d));
  });
  it('niveles', () => {
    expect([1, 2, 4, 5, 6, 8, 9, 10].map((p) => rosaNivel(p).nivel)).toEqual([0, 1, 1, 2, 3, 3, 4, 4]);
  });
});

describe('ROSA · ejemplo resuelto [NTP1173]: silla 6, final 6', () => {
  it('desde puntuaciones', () => {
    const r = rosaDesdePuntuaciones({
      altura: 3, profundidad: 1, reposabrazos: 3, respaldo: 3, tiempoSilla: 1,
      telefono: 1, pantalla: 3, raton: 4, teclado: 1,
    });
    expect(r.tablaA).toBe(5);
    expect(r.silla).toBe(6);
    expect(r.tablaB).toBe(2);
    expect(r.tablaC).toBe(4);
    expect(r.perifericos).toBe(4);
    expect(r.final).toBe(6);
  });
  it('desde las opciones del formulario', () => {
    const r = calcularRosa({
      ...rosaBase,
      alturaAsiento: 'alto', alturaNoRegulable: true,
      reposabrazos: 'altos', reposabrazosNoRegulables: true,
      respaldo: 'sinLumbar', respaldoNoRegulable: true,
      tiempoSilla: 'mas4',
      pantallaSinAtril: true, tiempoPantalla: 'mas4',
      raton: 'noAlineado', ratonReposamanosDuro: true, tiempoRaton: 'mas4',
    });
    expect(r.silla).toBe(6);
    expect(r.final).toBe(6);
  });
});

describe('ROSA · ejemplo resuelto [SONNE] Tabla 3: silla 7, final 7', () => {
  it('desde las opciones del formulario', () => {
    const r = calcularRosa({
      ...rosaBase,
      alturaAsiento: 'alto', alturaNoRegulable: true,
      reposabrazos: 'altos', reposabrazosNoRegulables: true,
      respaldo: 'sinLumbar', superficieAlta: true, respaldoNoRegulable: true,
      tiempoSilla: 'mas4',
      pantalla: 'alta', pantallaSinAtril: true, tiempoPantalla: 'mas4',
      raton: 'noAlineado', ratonReposamanosDuro: true, tiempoRaton: 'mas4',
      tiempoTeclado: 'mas4',
    });
    expect(r.tablaA).toBe(6);
    expect(r.silla).toBe(7);
    expect(r.tablaB).toBe(4);
    expect(r.tablaC).toBe(4);
    expect(r.perifericos).toBe(4);
    expect(r.final).toBe(7);
  });
});

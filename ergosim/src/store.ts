import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { RulaComun, RulaLado } from './methods/rula';
import type { RebaComun, RebaLado } from './methods/reba';
import type { RosaEntrada } from './methods/rosa';
import type { ResultadoIA } from './ia';

export type Metodo = 'rula' | 'reba' | 'rosa';
export type Vista = Metodo | 'comparar';
export type Lado = 'izq' | 'der';

export interface DatosEvaluacion {
  empresa: string;
  area: string;
  puesto: string;
  trabajador: string;
  evaluador: string;
  fecha: string;
  tarea: string;
}

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Valores de ejemplo (marcados como tal en la interfaz) para que la herramienta abra con un caso real de uso.
export const RULA_LADO_INICIAL: RulaLado = {
  brazoAngulo: 60, hombroElevado: false, brazoAbducido: false, brazoApoyado: false,
  antebrazoAngulo: 40, antebrazoFueraLinea: false,
  munecaAngulo: 30, munecaDesviada: true, giroExtremo: true,
  actividadA: false, cargaA: '2a10est',
};
export const RULA_COMUN_INICIAL: RulaComun = {
  cuelloAngulo: 30, cuelloRotado: false, cuelloInclinado: false,
  troncoAngulo: 10, troncoRotado: false, troncoInclinado: false,
  piernasApoyadas: true, actividadB: false, cargaB: '2a10est',
};
export const REBA_LADO_INICIAL: RebaLado = {
  brazoAngulo: 70, brazoAbducidoRotado: false, hombroElevado: false, brazoApoyoGravedad: true,
  antebrazoAngulo: 40, munecaAngulo: 0, munecaTorsionDesviacion: false, agarre: 'regular',
};
export const REBA_COMUN_INICIAL: RebaComun = {
  troncoAngulo: 40, troncoTorsionInclinacion: false, cuelloAngulo: 0, cuelloTorsionInclinacion: false,
  piernasApoyo: 'bilateral', sentado: false, rodillaFlexion: 70, carga: 'mas10', cargaBrusca: true,
  actEstatica: false, actRepetitiva: false, actCambios: true,
};
export const ROSA_INICIAL: RosaEntrada = {
  alturaAsiento: 'alto', alturaEspacioInsuficiente: false, alturaNoRegulable: true,
  profundidad: 'correcta', profundidadNoRegulable: false,
  reposabrazos: 'altos', reposabrazosSeparados: false, reposabrazosDuros: false, reposabrazosNoRegulables: true,
  respaldo: 'sinLumbar', superficieAlta: false, respaldoNoRegulable: true, tiempoSilla: 'mas4',
  pantalla: 'correcta', pantallaGiroCuello: false, pantallaLejos: false, pantallaReflejos: false, pantallaSinAtril: true, tiempoPantalla: 'mas4',
  telefono: 'correcto', telefonoCuelloHombro: false, telefonoSinManosLibres: false, tiempoTelefono: '1a4',
  raton: 'noAlineado', ratonPinza: false, ratonAlturaDistinta: false, ratonReposamanosDuro: true, tiempoRaton: 'mas4',
  teclado: 'recto', tecladoDesviacion: false, tecladoAlto: false, tecladoAlcanceCabeza: false, tecladoNoRegulable: false, tiempoTeclado: '1a4',
};

interface Estado {
  vista: Vista;
  datos: DatosEvaluacion;
  rula: { comun: RulaComun; izq: RulaLado; der: RulaLado };
  reba: { comun: RebaComun; izq: RebaLado; der: RebaLado };
  rosa: RosaEntrada;
  /** Métodos con informe generado (entran en la comparación). */
  informes: Record<Metodo, boolean>;
  foto: string | null;
  /** Archivo original de la foto (para enviarlo a Claude); no se guarda. */
  fotoArchivo: File | null;
  /** Último análisis con IA por método: valores sugeridos, puntos y observaciones. */
  ia: Partial<Record<Metodo, ResultadoIA>>;
  setVista: (v: Vista) => void;
  setDatos: (d: Partial<DatosEvaluacion>) => void;
  setRulaComun: (c: Partial<RulaComun>) => void;
  setRulaLado: (l: Lado, c: Partial<RulaLado>) => void;
  setRebaComun: (c: Partial<RebaComun>) => void;
  setRebaLado: (l: Lado, c: Partial<RebaLado>) => void;
  setRosa: (c: Partial<RosaEntrada>) => void;
  marcarInforme: (m: Metodo, v: boolean) => void;
  setFoto: (f: string | null, archivo?: File | null) => void;
  aplicarIA: (r: ResultadoIA) => void;
  descartarIA: (m: Metodo) => void;
  reiniciar: (m: Metodo) => void;
}

// Almacenamiento local tolerante a fallos (ventana privada, datos bloqueados, vista previa).
const almacenSeguro = createJSONStorage(() => ({
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* sin almacenamiento */
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* sin almacenamiento */
    }
  },
}));

export const useErgo = create<Estado>()(
  persist(
    (set) => ({
      vista: 'rula',
      datos: {
        empresa: 'Empresa de ejemplo S.A.S.',
        area: 'Bodega',
        puesto: 'Auxiliar de empaque',
        trabajador: '',
        evaluador: '',
        fecha: hoy(),
        tarea: 'Ejemplo: atornillado de una tapa dentro de una caja metálica con atornillador neumático.',
      },
      rula: { comun: RULA_COMUN_INICIAL, izq: { ...RULA_LADO_INICIAL, brazoAngulo: 15, munecaAngulo: 10, munecaDesviada: false, giroExtremo: false, cargaA: 'menos2', antebrazoAngulo: 80 }, der: RULA_LADO_INICIAL },
      reba: { comun: REBA_COMUN_INICIAL, izq: { ...REBA_LADO_INICIAL, brazoAngulo: 30, brazoApoyoGravedad: false, antebrazoAngulo: 80 }, der: REBA_LADO_INICIAL },
      rosa: ROSA_INICIAL,
      informes: { rula: false, reba: false, rosa: false },
      foto: null,
      fotoArchivo: null,
      ia: {},
      setVista: (vista) => set({ vista }),
      setDatos: (d) => set((s) => ({ datos: { ...s.datos, ...d } })),
      setRulaComun: (c) => set((s) => ({ rula: { ...s.rula, comun: { ...s.rula.comun, ...c } } })),
      setRulaLado: (l, c) => set((s) => ({ rula: { ...s.rula, [l]: { ...s.rula[l], ...c } } })),
      setRebaComun: (c) => set((s) => ({ reba: { ...s.reba, comun: { ...s.reba.comun, ...c } } })),
      setRebaLado: (l, c) => set((s) => ({ reba: { ...s.reba, [l]: { ...s.reba[l], ...c } } })),
      setRosa: (c) => set((s) => ({ rosa: { ...s.rosa, ...c } })),
      marcarInforme: (m, v) => set((s) => ({ informes: { ...s.informes, [m]: v } })),
      setFoto: (foto, archivo = null) => set({ foto, fotoArchivo: archivo }),
      aplicarIA: (r) =>
        set((s) => {
          const v = r.valores as never;
          const base = { ia: { ...s.ia, [r.metodo]: r } };
          if (r.metodo === 'rosa') return { ...base, rosa: { ...s.rosa, ...(v as Partial<RosaEntrada>) } };
          const g = v as { comun: object; izq: object; der: object };
          if (r.metodo === 'rula') return { ...base, rula: { comun: { ...s.rula.comun, ...g.comun }, izq: { ...s.rula.izq, ...g.izq }, der: { ...s.rula.der, ...g.der } } };
          return { ...base, reba: { comun: { ...s.reba.comun, ...g.comun }, izq: { ...s.reba.izq, ...g.izq }, der: { ...s.reba.der, ...g.der } } };
        }),
      descartarIA: (m) => set((s) => { const ia = { ...s.ia }; delete ia[m]; return { ia }; }),
      reiniciar: (m) =>
        set((s) =>
          m === 'rula'
            ? { rula: { comun: RULA_COMUN_INICIAL, izq: RULA_LADO_INICIAL, der: RULA_LADO_INICIAL }, informes: { ...s.informes, rula: false } }
            : m === 'reba'
              ? { reba: { comun: REBA_COMUN_INICIAL, izq: REBA_LADO_INICIAL, der: REBA_LADO_INICIAL }, informes: { ...s.informes, reba: false } }
              : { rosa: ROSA_INICIAL, informes: { ...s.informes, rosa: false } },
        ),
    }),
    {
      name: 'ergosim-v2',
      storage: almacenSeguro,
      partialize: (s) => ({ datos: s.datos, rula: s.rula, reba: s.reba, rosa: s.rosa, informes: s.informes, ia: s.ia }),
    },
  ),
);

// Tipos y utilidades compartidos por los tres métodos.
// Todas las tablas y rangos están documentados en docs/fuentes.md.

export type ColorRiesgo = 'verde' | 'amarillo' | 'naranja' | 'rojo';

export interface NivelRiesgo {
  puntuacion: number;
  nivel: number;
  riesgo: string;
  actuacion: string;
  color: ColorRiesgo;
}

export type Segmento = 'cuello' | 'tronco' | 'piernas' | 'brazo' | 'antebrazo' | 'muneca';

export interface Modificador {
  nombre: string;
  valor: number;
}

/** Un factor evaluado: valor medido, puntuación base, modificadores y total. */
export interface Factor {
  clave: string;
  nombre: string;
  segmento?: Segmento;
  medida?: string;
  base: number;
  modificadores: Modificador[];
  total: number;
  /** Máximo posible del factor, para normalizar en las gráficas. */
  maximo: number;
}

/** Celda de una tabla de combinación usada en el cálculo (para resaltarla en el informe). */
export interface Celda {
  tabla: string;
  fila: number;
  columna: number;
  valor: number;
}

export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const sumaMods = (mods: Modificador[]) => mods.reduce((s, m) => s + m.valor, 0);

/** Agrega un modificador solo si la condición se cumple. */
export function mod(cond: boolean, nombre: string, valor: number): Modificador[] {
  return cond ? [{ nombre, valor }] : [];
}

export function factor(
  f: Omit<Factor, 'total'> & { min?: number; max?: number },
): Factor {
  const { min = 1, max = f.maximo, ...rest } = f;
  return { ...rest, total: limitar(rest.base + sumaMods(rest.modificadores), min, max) };
}

export const fmtGrados = (a: number) => `${Math.round(a)}°`;

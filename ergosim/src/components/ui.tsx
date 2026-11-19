import { ReactNode } from 'react';
import type { ColorRiesgo, NivelRiesgo } from '../methods/common';

const ICONO: Record<ColorRiesgo, string> = { verde: '●', amarillo: '▲', naranja: '◆', rojo: '■' };

export function RiskBadge({ nivel, grande = false }: { nivel: NivelRiesgo; grande?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${grande ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'}`}
      style={{ background: `var(--r-${nivel.color}-fondo)`, color: `var(--r-${nivel.color}-tinta)`, border: `1px solid var(--r-${nivel.color})` }}
    >
      <span aria-hidden="true" style={{ color: `var(--r-${nivel.color})` }}>
        {ICONO[nivel.color]}
      </span>
      Riesgo {nivel.riesgo.toLowerCase()} · nivel {nivel.nivel}
    </span>
  );
}

export function Toggle({ id, label, detalle, checked, onChange, puntos }: { id: string; label: string; detalle?: string; checked: boolean; onChange: (v: boolean) => void; puntos?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-hundido">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-5 w-9 rounded-full border border-linea bg-hundido transition-colors peer-checked:border-acento peer-checked:bg-acento peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-acento" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-superficie shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight">{label}</span>
        {detalle && <span className="block text-xs text-tenue">{detalle}</span>}
      </span>
      {puntos && <span className="num font-datos text-xs text-tinta2">{puntos}</span>}
    </label>
  );
}

export interface Opcion<T extends string> {
  valor: T;
  texto: string;
  detalle?: string;
  puntos: string;
  ilustracion?: ReactNode;
}

export function OptionCards<T extends string>({ name, opciones, valor, onChange, columnas = 2 }: { name: string; opciones: Opcion<T>[]; valor: T; onChange: (v: T) => void; columnas?: number }) {
  return (
    <div role="radiogroup" className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${columnas >= 3 ? 150 : 200}px, 1fr))` }}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <label
            key={o.valor}
            className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${activo ? 'border-acento bg-acento-suave' : 'border-linea bg-superficie hover:border-tenue'}`}
          >
            <input id={`${name}-${o.valor}`} type="radio" name={name} className="sr-only" checked={activo} onChange={() => onChange(o.valor)} />
            {o.ilustracion && <span className="shrink-0">{o.ilustracion}</span>}
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="font-medium leading-tight">{o.texto}</span>
                <span className={`num shrink-0 rounded px-1.5 font-datos text-xs ${activo ? 'bg-acento text-sobre-acento' : 'bg-hundido text-tinta2'}`}>{o.puntos}</span>
              </span>
              {o.detalle && <span className="mt-0.5 block text-xs text-tenue">{o.detalle}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export interface Banda {
  texto: string;
  puntos: number;
  activo: (v: number) => boolean;
}

export function AngleControl({ id, etiqueta, ayuda, valor, onChange, min, max, bandas, figura }: { id: string; etiqueta: string; ayuda?: string; valor: number; onChange: (v: number) => void; min: number; max: number; bandas: Banda[]; figura?: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[132px_1fr]">
      {figura && <div className="flex items-center justify-center rounded-lg bg-hundido p-1">{figura}</div>}
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label htmlFor={id} className="font-semibold">
            {etiqueta}
          </label>
          <span className="flex items-center gap-1">
            <input
              id={`${id}-num`}
              aria-label={`${etiqueta} en grados`}
              type="number"
              className="num w-16 rounded-md border border-linea bg-superficie px-2 py-0.5 text-right font-datos text-sm"
              value={valor}
              min={min}
              max={max}
              onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
            />
            <span className="text-sm text-tenue">°</span>
          </span>
        </div>
        {ayuda && <p className="text-xs text-tenue">{ayuda}</p>}
        <input id={id} type="range" min={min} max={max} step={1} value={valor} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" />
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {bandas.map((b) => {
            const on = b.activo(valor);
            return (
              <li
                key={b.texto}
                className={`rounded-md border px-2 py-0.5 text-xs ${on ? 'border-acento bg-acento text-sobre-acento' : 'border-linea text-tinta2'}`}
                aria-current={on ? 'true' : undefined}
              >
                {b.texto} <span className="num font-datos">· {b.puntos}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function Seccion({ titulo, paso, children, nota }: { titulo: string; paso?: string; children: ReactNode; nota?: string }) {
  return (
    <section className="tarjeta p-4 sm:p-5">
      <div className="mb-3 flex items-baseline gap-2">
        {paso && <span className="etiqueta">{paso}</span>}
        <h3 className="text-lg font-semibold">{titulo}</h3>
      </div>
      {nota && <p className="-mt-2 mb-3 text-sm text-tenue">{nota}</p>}
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function Stepper({ pasos, actual, onChange }: { pasos: string[]; actual: number; onChange: (i: number) => void }) {
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Pasos de la evaluación">
      {pasos.map((p, i) => (
        <li key={p}>
          <button
            type="button"
            onClick={() => onChange(i)}
            aria-current={i === actual ? 'step' : undefined}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
              i === actual ? 'border-acento bg-acento text-sobre-acento' : i < actual ? 'border-acento text-acento' : 'border-linea text-tinta2 hover:border-tenue'
            }`}
          >
            <span className="num font-datos text-xs">{i + 1}</span>
            {p}
          </button>
        </li>
      ))}
    </ol>
  );
}

export function NavPasos({ actual, total, onChange, onFinal }: { actual: number; total: number; onChange: (i: number) => void; onFinal: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button type="button" disabled={actual === 0} onClick={() => onChange(actual - 1)} className="rounded-lg border border-linea px-4 py-2 font-medium disabled:opacity-40">
        Anterior
      </button>
      {actual < total - 1 ? (
        <button type="button" onClick={() => onChange(actual + 1)} className="rounded-lg bg-acento px-4 py-2 font-semibold text-sobre-acento">
          Siguiente
        </button>
      ) : (
        <button type="button" onClick={onFinal} className="rounded-lg bg-acento px-4 py-2 font-semibold text-sobre-acento">
          Generar informe
        </button>
      )}
    </div>
  );
}

export function LadoTabs({ lado, onChange }: { lado: 'izq' | 'der'; onChange: (l: 'izq' | 'der') => void }) {
  return (
    <div role="tablist" aria-label="Lado evaluado" className="inline-flex rounded-lg border border-linea bg-hundido p-0.5">
      {(['izq', 'der'] as const).map((l) => (
        <button
          key={l}
          role="tab"
          type="button"
          aria-selected={lado === l}
          onClick={() => onChange(l)}
          className={`rounded-md px-3 py-1 text-sm font-medium ${lado === l ? 'bg-superficie text-tinta shadow-sm' : 'text-tinta2'}`}
        >
          {l === 'izq' ? 'Lado izquierdo' : 'Lado derecho'}
        </button>
      ))}
    </div>
  );
}

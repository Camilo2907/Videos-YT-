import { ReactNode } from 'react';
import type { NivelRiesgo } from '../methods/common';
import { RiskBadge } from './ui';

export interface LadoVivo {
  nombre: string;
  final: number;
  nivel: NivelRiesgo;
  detalle: string;
}

/** Lectura en vivo: puntuación final de cada lado, nivel de riesgo y figura. */
export function PanelVivo({ metodo, max, lados, figura, onInforme }: { metodo: string; max: number; lados: LadoVivo[]; figura?: ReactNode; onInforme: () => void }) {
  return (
    <aside className="lg:sticky lg:top-[calc(env(safe-area-inset-top,0px)+76px)] lg:self-start">
      <div className="tarjeta grid gap-4 p-4" style={{ boxShadow: 'var(--sombra)' }}>
        <div className="flex items-baseline justify-between">
          <span className="etiqueta">Puntuación {metodo} en vivo</span>
          <span className="num font-datos text-xs text-tenue">escala 1–{max}</span>
        </div>
        <div className={`grid gap-3 ${lados.length > 1 ? 'grid-cols-2' : ''}`}>
          {lados.map((l) => (
            <div key={l.nombre} className="grid gap-1.5 rounded-lg p-3" style={{ background: `var(--r-${l.nivel.color}-fondo)` }}>
              <span className="text-xs font-semibold" style={{ color: `var(--r-${l.nivel.color}-tinta)` }}>
                {l.nombre}
              </span>
              <span className="num font-titulo text-4xl font-bold leading-none" style={{ color: `var(--r-${l.nivel.color}-tinta)` }}>
                {l.final}
                <span className="text-base font-medium opacity-70">/{max}</span>
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-superficie/60" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${(l.final / max) * 100}%`, background: `var(--r-${l.nivel.color})` }} />
              </div>
              <RiskBadge nivel={l.nivel} />
              <span className="num font-datos text-[11px] text-tinta2">{l.detalle}</span>
            </div>
          ))}
        </div>
        {figura && <div className="flex justify-center rounded-lg bg-hundido py-2">{figura}</div>}
        {figura && (
          <p className="text-xs text-tenue">
            Colores de la figura: aporte de cada segmento a su máximo (verde = postura de referencia, rojo = máximo).
          </p>
        )}
        <button type="button" onClick={onInforme} className="rounded-lg bg-acento px-4 py-2.5 font-semibold text-sobre-acento">
          Generar informe
        </button>
      </div>
    </aside>
  );
}

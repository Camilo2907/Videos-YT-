import { ReactNode } from 'react';
import type { ColorRiesgo, NivelRiesgo } from '../methods/common';
import { RiskBadge } from './ui';

export interface LadoVivo {
  nombre: string;
  final: number;
  nivel: NivelRiesgo;
  detalle: string;
}

/** Zonas de color de cada escala (por nivel de actuación del método). */
const ZONAS: Record<string, { desde: number; hasta: number; color: ColorRiesgo }[]> = {
  RULA: [
    { desde: 1, hasta: 2, color: 'verde' },
    { desde: 3, hasta: 4, color: 'amarillo' },
    { desde: 5, hasta: 6, color: 'naranja' },
    { desde: 7, hasta: 7, color: 'rojo' },
  ],
  REBA: [
    { desde: 1, hasta: 3, color: 'verde' },
    { desde: 4, hasta: 7, color: 'amarillo' },
    { desde: 8, hasta: 10, color: 'naranja' },
    { desde: 11, hasta: 15, color: 'rojo' },
  ],
  ROSA: [
    { desde: 1, hasta: 4, color: 'verde' },
    { desde: 5, hasta: 5, color: 'amarillo' },
    { desde: 6, hasta: 8, color: 'naranja' },
    { desde: 9, hasta: 10, color: 'rojo' },
  ],
};

const polar = (r: number, a: number) => [Math.cos(((a - 180) * Math.PI) / 180) * r, Math.sin(((a - 180) * Math.PI) / 180) * r];
function arco(r1: number, r2: number, a1: number, a2: number) {
  const [x1, y1] = polar(r2, a1);
  const [x2, y2] = polar(r2, a2);
  const [x3, y3] = polar(r1, a2);
  const [x4, y4] = polar(r1, a1);
  const g = a2 - a1 > 180 ? 1 : 0;
  return `M${x1} ${y1} A${r2} ${r2} 0 ${g} 1 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 ${g} 0 ${x4} ${y4} Z`;
}

/** Medidor semicircular: cada puntuación ocupa una franja; la aguja apunta al centro de la franja. */
export function Medidor({ metodo, max, valor, tamano = 220 }: { metodo: string; max: number; valor: number; tamano?: number }) {
  const n = max;
  const ang = (v: number) => ((v - 1) / n) * 180;
  const aguja = ang(valor + 0.5);
  return (
    <svg viewBox="-110 -108 220 124" width={tamano} style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label={`Medidor ${metodo}: ${valor} de ${max}`}>
      {ZONAS[metodo].map((z) => (
        <path key={z.desde} d={arco(70, 96, ang(z.desde) + 0.6, ang(z.hasta + 1) - 0.6)} fill={`var(--r-${z.color})`} opacity={valor >= z.desde && valor <= z.hasta ? 1 : 0.28} />
      ))}
      {Array.from({ length: n }, (_, i) => i + 1).map((v) => {
        const [x, y] = polar(60, ang(v + 0.5));
        return (
          <text key={v} x={x} y={y + 3} textAnchor="middle" fontSize={n > 10 ? 7 : 9} fill="var(--tenue)" className="num">
            {v}
          </text>
        );
      })}
      <g className="aguja" style={{ transform: `rotate(${aguja}deg)`, transformOrigin: '0px 0px' }}>
        <path d="M-92 0 L0 -5 L6 0 L0 5 Z" fill="var(--tinta)" />
      </g>
      <circle r={9} fill="var(--tinta)" />
      <circle r={3.5} fill="var(--superficie)" />
    </svg>
  );
}

/** Escenario en vivo: ilustración animada, medidor y puntuación de cada lado. */
export function PanelVivo({ metodo, max, lados, figura, onInforme }: { metodo: string; max: number; lados: LadoVivo[]; figura?: ReactNode; onInforme: () => void }) {
  const peor = lados.reduce((a, b) => (b.final > a.final ? b : a));
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="tarjeta grid overflow-hidden lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto" style={{ boxShadow: 'var(--sombra)' }}>
        {figura && (
          <div className="relative flex justify-center px-4 pt-4" style={{ background: 'var(--escenario)' }}>
            <span className="etiqueta absolute left-4 top-3">Postura en vivo</span>
            {figura}
          </div>
        )}
        <div className="grid gap-3 p-4">
          <div className="flex items-baseline justify-between">
            <span className="etiqueta">Puntuación {metodo}</span>
            <span className="num font-datos text-xs text-tenue">escala 1–{max}</span>
          </div>
          <div className="relative mx-auto w-full max-w-[240px]">
            <Medidor metodo={metodo} max={max} valor={peor.final} />
            <div className="pointer-events-none absolute inset-x-0 bottom-[-6px] text-center">
              <span className="num font-titulo text-4xl font-extrabold" style={{ color: `var(--r-${peor.nivel.color}-tinta)` }}>
                {peor.final}
              </span>
              <span className="num text-sm text-tenue">/{max}</span>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <RiskBadge nivel={peor.nivel} grande />
          </div>
          <p className="text-center text-sm text-tinta2">{peor.nivel.actuacion}</p>
          {lados.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {lados.map((l) => (
                <div key={l.nombre} className="rounded-xl p-2.5" style={{ background: `var(--r-${l.nivel.color}-fondo)`, color: `var(--r-${l.nivel.color}-tinta)` }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold">{l.nombre}</span>
                    <span className="num font-titulo text-xl font-extrabold">{l.final}</span>
                  </div>
                  <span className="text-xs font-semibold">{l.nivel.riesgo}</span>
                  <span className="num block font-datos text-[10px] opacity-80">{l.detalle}</span>
                </div>
              ))}
            </div>
          )}
          {lados.length === 1 && <p className="num text-center font-datos text-[11px] text-tenue">{lados[0].detalle}</p>}
          <button type="button" onClick={onInforme} className="rounded-xl bg-acento px-4 py-3 font-bold text-sobre-acento shadow-sm transition-transform hover:-translate-y-0.5">
            Generar informe
          </button>
        </div>
      </div>
    </aside>
  );
}

// Personaje ilustrado de perfil (mira a la derecha) con ropa de trabajo.
// Cada segmento es un grupo anidado que gira con el ángulo medido; las transiciones
// CSS lo animan al mover un control. Convenciones de ángulos: ver Postura.
import type { CSSProperties, ReactNode } from 'react';
import type { ColorRiesgo, Segmento } from '../methods/common';

export interface Postura {
  tronco: number; // flexión (+) / extensión (−) respecto a la vertical
  cuello: number; // flexión (+) / extensión (−) respecto al tronco
  brazo: number; // flexión (+) / extensión (−) respecto al tronco
  antebrazo: number; // flexión del codo
  muneca: number; // flexión (+) / extensión (−)
  rodilla: number; // flexión de rodillas (de pie)
  sentado?: boolean;
  /** Brazo del lado lejano (si se evalúa el otro lado con otros ángulos). */
  lejano?: { brazo: number; antebrazo: number; muneca: number };
  /** Ángulos absolutos de muslo y pierna (desde la vertical hacia abajo, + adelante); para escenas sentadas. */
  piernas?: { muslo: number; pierna: number };
  /** Elevación extra de la cadera sobre el contacto con el suelo (pies colgando). */
  elevar?: number;
}

export const SUELO = 100;
const MUSLO = 46;
const PIERNA = 44;
const ZAPATO = 7;
const rad = (g: number) => (g * Math.PI) / 180;

const T = (x: number, y: number, a: number): CSSProperties => ({
  transform: `translate(${x}px, ${y}px) rotate(${a}deg)`,
  transformOrigin: '0px 0px',
  transition: 'transform 0.55s cubic-bezier(0.34, 1.35, 0.5, 1)',
});

/** Ángulos absolutos de las piernas y altura de la cadera para que los pies apoyen en el suelo. */
export function geometriaPiernas(p: Postura) {
  const muslo = p.piernas?.muslo ?? (p.sentado ? 90 : p.rodilla / 2);
  const pierna = p.piernas?.pierna ?? (p.sentado ? 0 : p.rodilla / 2 - p.rodilla);
  const alto = MUSLO * Math.cos(rad(muslo)) + PIERNA * Math.cos(rad(pierna)) + ZAPATO;
  return { muslo, pierna, caderaY: SUELO - alto - (p.elevar ?? 0) };
}

const PIEL = 'var(--p-piel)';
const PIEL_SOMBRA = 'var(--p-piel-sombra)';

function Brazo({ a, e, w, lejano, trazo, trazoAnte, trazoMano }: { a: number; e: number; w: number; lejano?: boolean; trazo?: string; trazoAnte?: string; trazoMano?: string }) {
  const manga = lejano ? 'var(--p-camisa-sombra)' : 'var(--p-camisa)';
  const piel = lejano ? PIEL_SOMBRA : PIEL;
  return (
    <g style={T(0, -58, -a)}>
      <rect x={-7.5} y={-7} width={15} height={44} rx={7.5} fill={manga} stroke={trazo ?? 'none'} strokeWidth={trazo ? 3 : 0} />
      <g style={T(0, 36, -e)}>
        <rect x={-6} y={-5} width={12} height={38} rx={6} fill={piel} stroke={trazoAnte ?? 'none'} strokeWidth={trazoAnte ? 3 : 0} />
        <rect x={-7} y={-6} width={14} height={9} rx={4} fill={manga} />
        <g style={T(0, 32, -w)}>
          <path d="M-6 -2 Q-7 10 -2 15 Q4 17 7 10 Q8 2 6 -2 Z" fill={piel} stroke={trazoMano ?? 'none'} strokeWidth={trazoMano ? 3 : 0} />
          <ellipse cx={7} cy={4} rx={3} ry={5} fill={piel} transform="rotate(-25 7 4)" />
        </g>
      </g>
    </g>
  );
}

function Pierna({ muslo, pierna, lejano, trazo }: { muslo: number; pierna: number; lejano?: boolean; trazo?: string }) {
  const tela = lejano ? 'var(--p-pantalon-sombra)' : 'var(--p-pantalon)';
  return (
    <g style={T(0, 0, -muslo)}>
      <rect x={-10} y={-8} width={20} height={MUSLO + 8} rx={10} fill={tela} stroke={trazo ?? 'none'} strokeWidth={trazo ? 3 : 0} />
      <g style={T(0, MUSLO, -(pierna - muslo))}>
        <rect x={-8.5} y={-6} width={17} height={PIERNA + 4} rx={8.5} fill={tela} stroke={trazo ?? 'none'} strokeWidth={trazo ? 3 : 0} />
        <g style={T(0, PIERNA, pierna)}>
          <path d="M-8 -5 L8 -5 Q24 -4 25 3 L25 6 L-9 6 Q-10 0 -8 -5 Z" fill={lejano ? 'var(--p-zapato-sombra)' : 'var(--p-zapato)'} />
          <rect x={-9} y={4} width={34} height={3} rx={1.5} fill="var(--p-suela)" />
        </g>
      </g>
    </g>
  );
}

/** El cuerpo como grupo SVG, para incrustarlo en escenas. */
export function Cuerpo({ postura: p, resaltar, colores = {}, x = 0 }: { postura: Postura; resaltar?: Segmento; colores?: Partial<Record<Segmento, ColorRiesgo>>; x?: number }) {
  const { muslo, pierna, caderaY } = geometriaPiernas(p);
  const trazo = (s: Segmento) => (resaltar === s ? 'var(--acento)' : colores[s] ? `var(--r-${colores[s]})` : undefined);
  const lej = p.lejano ?? { brazo: p.brazo, antebrazo: p.antebrazo, muneca: p.muneca };
  return (
    <g style={T(x, caderaY, 0)}>
      {/* lado lejano, detrás */}
      <Pierna muslo={muslo + (p.sentado || p.piernas ? 4 : -6)} pierna={pierna + (p.sentado || p.piernas ? 0 : -4)} lejano />
      <g style={T(0, 0, p.tronco)}>
        <Brazo a={lej.brazo} e={lej.antebrazo} w={lej.muneca} lejano />
      </g>
      <Pierna muslo={muslo} pierna={pierna} trazo={trazo('piernas')} />
      {/* tronco */}
      <g style={T(0, 0, p.tronco)}>
        <g className="respira">
          <rect x={-16} y={-72} width={32} height={80} rx={15} fill="var(--p-camisa)" stroke={trazo('tronco') ?? 'none'} strokeWidth={trazo('tronco') ? 3 : 0} />
          {/* chaleco con franjas reflectivas: detalle de ropa de trabajo */}
          <path d="M-16 -50 L16 -50 L16 -6 Q16 2 8 2 L-8 2 Q-16 2 -16 -6 Z" fill="var(--p-chaleco)" />
          <rect x={-16} y={-34} width={32} height={5} fill="var(--p-reflectivo)" />
          <rect x={-16} y={-18} width={32} height={5} fill="var(--p-reflectivo)" />
          <rect x={-16} y={-2} width={32} height={6} rx={2} fill="var(--p-cinturon)" />
        </g>
        {/* cuello y cabeza */}
        <g style={T(0, -70, p.cuello)}>
          <rect x={-5} y={-12} width={10} height={14} rx={4} fill={PIEL} stroke={trazo('cuello') ?? 'none'} strokeWidth={trazo('cuello') ? 3 : 0} />
          <g transform="translate(3 -26)">
            <circle r={16} fill={PIEL} stroke={trazo('cuello') ?? 'none'} strokeWidth={trazo('cuello') ? 3 : 0} />
            <path d="M-16 2 Q-19 -14 -6 -18 Q8 -21 15 -9 Q10 -12 2 -11 Q-6 -9 -9 0 Q-11 6 -16 2 Z" fill="var(--p-pelo)" />
            <ellipse cx={-5} cy={1} rx={3.2} ry={4.2} fill={PIEL_SOMBRA} />
            <g className="parpadeo">
              <ellipse cx={8.5} cy={-3} rx={1.8} ry={2.3} fill="var(--p-ojo)" />
            </g>
            <path d="M15.5 0 Q19 3 15.5 5" fill={PIEL} stroke={PIEL_SOMBRA} strokeWidth={1.2} />
            <path d="M8 8 Q11 10.5 14 8" fill="none" stroke="var(--p-ojo)" strokeWidth={1.4} strokeLinecap="round" />
            {/* casco de seguridad */}
            <path d="M-17 -6 Q-16 -24 2 -24 Q18 -23 18 -7 Z" fill="var(--p-casco)" />
            <rect x={-18} y={-8} width={40} height={4} rx={2} fill="var(--p-casco-ala)" />
          </g>
        </g>
        <Brazo a={p.brazo} e={p.antebrazo} w={p.muneca} trazo={trazo('brazo')} trazoAnte={trazo('antebrazo')} trazoMano={trazo('muneca')} />
      </g>
    </g>
  );
}

export function Personaje({
  postura,
  resaltar,
  colores,
  tamano = 160,
  titulo,
  fondo = true,
  children,
}: {
  postura: Postura;
  resaltar?: Segmento;
  colores?: Partial<Record<Segmento, ColorRiesgo>>;
  tamano?: number;
  titulo?: string;
  fondo?: boolean;
  children?: ReactNode;
}) {
  return (
    <svg viewBox="-120 -150 260 262" width={tamano} height={(tamano * 262) / 260} role="img" aria-label={titulo ?? 'Ilustración de la postura evaluada'} style={{ maxWidth: '100%', height: 'auto' }}>
      {fondo && (
        <>
          <ellipse cx={8} cy={SUELO + 4} rx={70} ry={6} fill="var(--p-sombra-suelo)" />
          <line x1={-120} y1={SUELO + 1} x2={140} y2={SUELO + 1} stroke="var(--linea)" strokeWidth={2} />
        </>
      )}
      {children}
      <Cuerpo postura={postura} resaltar={resaltar} colores={colores} />
    </svg>
  );
}

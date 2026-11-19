// Escena de oficina para ROSA: la silla, la pantalla, el teléfono y la postura cambian con las respuestas.
import type { CSSProperties } from 'react';
import type { RosaEntrada } from '../methods/rosa';
import { Cuerpo, Postura, SUELO, geometriaPiernas } from './Personaje';

const anim: CSSProperties = { transition: 'transform 0.55s cubic-bezier(0.34, 1.35, 0.5, 1)' };

export function posturaRosa(e: RosaEntrada): Postura {
  const piernas = {
    rodillas90: { muslo: 90, pierna: 0 },
    bajo: { muslo: 106, pierna: -6 },
    alto: { muslo: 74, pierna: 12 },
    sinContacto: { muslo: 86, pierna: 6 },
  }[e.alturaAsiento];
  const tronco = { correcto: -8, sinLumbar: 6, inclinacion: -24, sinRespaldo: 14 }[e.respaldo];
  const cuello = { correcta: 6, baja: 30, alta: -20 }[e.pantalla] - tronco * 0.6;
  const brazo = (e.raton === 'noAlineado' ? 38 : 18) - tronco * 0.5;
  return {
    tronco,
    cuello,
    brazo: e.tecladoAlto ? brazo - 12 : brazo,
    antebrazo: e.tecladoAlto ? 110 : 78,
    muneca: e.teclado === 'extendido' ? -28 : 0,
    rodilla: 0,
    sentado: true,
    piernas,
    elevar: e.alturaAsiento === 'sinContacto' ? 12 : 0,
  };
}

export function EscenaOficina({ entrada: e, tamano = 300 }: { entrada: RosaEntrada; tamano?: number }) {
  const p = posturaRosa(e);
  const { caderaY } = geometriaPiernas(p);
  const asiento = caderaY + 8;
  const pantallaY = { correcta: -78, baja: -42, alta: -112 }[e.pantalla];
  const pantallaX = e.pantallaLejos ? 150 : 118;
  const telX = e.telefono === 'lejos' ? 168 : 92;
  const reposY = { correctos: asiento - 26, altos: asiento - 40, bajos: asiento - 12, sinReposabrazos: null }[e.reposabrazos];
  const mesa = e.superficieAlta || e.tecladoAlto ? 10 : 22;

  return (
    <svg viewBox="-80 -150 290 262" width={tamano} style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label="Escena del puesto de oficina según las respuestas">
      <ellipse cx={10} cy={SUELO + 4} rx={60} ry={6} fill="var(--p-sombra-suelo)" />
      <line x1={-80} y1={SUELO + 1} x2={210} y2={SUELO + 1} stroke="var(--linea)" strokeWidth={2} />
      {/* silla */}
      <g style={{ ...anim, transform: `translate(0px, ${asiento}px)` }}>
        <rect x={-30} y={0} width={56} height={9} rx={4} fill="var(--p-mueble)" />
        <rect x={-3} y={9} width={6} height={Math.max(4, SUELO - asiento - 14)} fill="var(--p-mueble-2)" />
        <path d={`M-26 ${SUELO - asiento - 4} L26 ${SUELO - asiento - 4}`} stroke="var(--p-mueble-2)" strokeWidth={5} strokeLinecap="round" />
        {e.respaldo !== 'sinRespaldo' && (
          <g style={{ ...anim, transform: `translate(-24px, 0px) rotate(${p.tronco - 4}deg)` }}>
            <rect x={-8} y={-66} width={10} height={64} rx={5} fill="var(--p-mueble)" />
            {e.respaldo !== 'sinLumbar' && <rect x={0} y={-30} width={6} height={20} rx={3} fill="var(--acento)" opacity={0.75} />}
          </g>
        )}
        {reposY !== null && <rect x={-10} y={reposY - asiento} width={34} height={6} rx={3} fill="var(--p-mueble-2)" style={anim} />}
      </g>
      {/* mesa */}
      <g style={{ ...anim, transform: `translate(0px, ${mesa}px)` }}>
        <rect x={52} y={0} width={150} height={7} rx={2} fill="var(--p-mesa)" />
        <rect x={190} y={7} width={6} height={SUELO - mesa - 7} fill="var(--p-mueble-2)" />
        <rect x={60} y={7} width={6} height={SUELO - mesa - 7} fill="var(--p-mueble-2)" />
        {/* teclado y ratón */}
        <rect x={60} y={e.teclado === 'extendido' ? -6 : -4} width={30} height={e.teclado === 'extendido' ? 6 : 4} rx={1.5} fill="var(--p-equipo)" transform={e.teclado === 'extendido' ? 'rotate(-8 75 -3)' : undefined} />
        <ellipse cx={e.raton === 'noAlineado' ? 112 : 96} cy={-3} rx={6} ry={3.5} fill="var(--p-equipo)" style={anim} />
        {/* teléfono */}
        <g style={{ ...anim, transform: `translate(${telX}px, -6px)` }}>
          <rect x={-8} y={0} width={16} height={6} rx={2} fill="var(--p-equipo)" />
          <rect x={-9} y={-4} width={18} height={4} rx={2} fill="var(--p-equipo-2)" />
        </g>
        {/* documentos y atril */}
        {e.pantallaSinAtril ? <rect x={136} y={-2} width={22} height={2} fill="var(--superficie)" stroke="var(--linea)" /> : <path d="M168 -2 L176 -26 L180 -26 L174 -2 Z" fill="var(--p-mueble-2)" />}
      </g>
      {/* pantalla */}
      <g style={{ ...anim, transform: `translate(${pantallaX}px, ${pantallaY + mesa - 22}px)` }}>
        <rect x={-4} y={0} width={8} height={Math.max(0, -pantallaY + 22 - 36)} fill="var(--p-mueble-2)" transform="translate(0 34)" />
        <rect x={-3} y={-2} width={9} height={38} rx={2} fill="var(--p-equipo)" />
        <rect x={-6} y={0} width={4} height={34} rx={1} fill={e.pantallaReflejos ? 'var(--p-reflejo)' : 'var(--p-pantalla)'} />
      </g>
      <Cuerpo postura={p} />
      {/* línea de visión */}
      <line x1={20} y1={caderaY - 96} x2={pantallaX - 6} y2={pantallaY + mesa - 22 + 17} stroke="var(--acento)" strokeDasharray="3 4" strokeWidth={1.5} opacity={0.6} />
    </svg>
  );
}

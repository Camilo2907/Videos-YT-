import { useState } from 'react';
import { useErgo } from '../store';
import { RULA_CARGAS, RulaCarga, calcularRula } from '../methods/rula';
import { AngleControl, LadoTabs, NavPasos, OptionCards, Seccion, Stepper, Toggle } from './ui';
import { Figura, Postura } from './Figura';
import { PanelVivo } from './PanelVivo';

const PASOS = ['Brazo y antebrazo', 'Muñeca', 'Cuello, tronco y piernas', 'Actividad y carga'];

export function FormRula({ onInforme }: { onInforme: () => void }) {
  const { rula, setRulaLado, setRulaComun } = useErgo();
  const [paso, setPaso] = useState(0);
  const [lado, setLado] = useState<'izq' | 'der'>('der');
  const L = rula[lado];
  const C = rula.comun;
  const setL = (c: Parameters<typeof setRulaLado>[1]) => setRulaLado(lado, c);
  const postura: Postura = { tronco: C.troncoAngulo, cuello: C.cuelloAngulo, brazo: L.brazoAngulo, antebrazo: L.antebrazoAngulo, muneca: L.munecaAngulo, rodilla: 0 };
  const fig = (s: Parameters<typeof Figura>[0]['resaltar']) => <Figura postura={postura} resaltar={s} tamano={120} />;
  const res = { izq: calcularRula(rula.izq, C), der: calcularRula(rula.der, C) };
  const sufijo = lado === 'izq' ? 'Izq' : 'Der';

  const cargas = (valor: RulaCarga, on: (v: RulaCarga) => void, name: string) => (
    <OptionCards name={name} valor={valor} onChange={on} opciones={RULA_CARGAS.map((c) => ({ valor: c.valor, texto: c.texto, puntos: `+${c.puntos}` }))} />
  );

  const porLado = paso === 0 || paso === 1 || paso === 3;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 content-start gap-4">
        <Stepper pasos={PASOS} actual={paso} onChange={setPaso} />
        {porLado && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LadoTabs lado={lado} onChange={setLado} />
            <span className="text-xs text-tenue">RULA evalúa cada lado por separado.</span>
          </div>
        )}

        {paso === 0 && (
          <>
            <Seccion titulo="Brazo" paso="Grupo A" nota="Ángulo entre el eje del brazo y el eje del tronco. Negativo = extensión (hacia atrás).">
              <AngleControl
                id={`rula-brazo-${sufijo}`}
                etiqueta="Flexión o extensión del brazo"
                valor={L.brazoAngulo}
                min={-60}
                max={180}
                onChange={(v) => setL({ brazoAngulo: v })}
                figura={fig('brazo')}
                bandas={[
                  { texto: '20° ext. a 20° flex.', puntos: 1, activo: (v) => v >= -20 && v <= 20 },
                  { texto: 'Ext. > 20° o flex. 20°–45°', puntos: 2, activo: (v) => v < -20 || (v > 20 && v <= 45) },
                  { texto: 'Flex. 45°–90°', puntos: 3, activo: (v) => v > 45 && v <= 90 },
                  { texto: 'Flex. > 90°', puntos: 4, activo: (v) => v > 90 },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                <Toggle id={`rula-hombro-${sufijo}`} label="Hombro elevado" puntos="+1" checked={L.hombroElevado} onChange={(v) => setL({ hombroElevado: v })} />
                <Toggle id={`rula-abd-${sufijo}`} label="Brazo abducido" detalle="Separado lateralmente del tronco" puntos="+1" checked={L.brazoAbducido} onChange={(v) => setL({ brazoAbducido: v })} />
                <Toggle id={`rula-apoyo-${sufijo}`} label="Brazo apoyado o persona inclinada" detalle="Existe un punto de apoyo" puntos="−1" checked={L.brazoApoyado} onChange={(v) => setL({ brazoApoyado: v })} />
              </div>
            </Seccion>
            <Seccion titulo="Antebrazo" paso="Grupo A" nota="Ángulo de flexión del codo: entre el eje del antebrazo y la prolongación del brazo.">
              <AngleControl
                id={`rula-antebrazo-${sufijo}`}
                etiqueta="Flexión del antebrazo"
                valor={L.antebrazoAngulo}
                min={0}
                max={150}
                onChange={(v) => setL({ antebrazoAngulo: v })}
                figura={fig('antebrazo')}
                bandas={[
                  { texto: '60°–100°', puntos: 1, activo: (v) => v >= 60 && v <= 100 },
                  { texto: '< 60° o > 100°', puntos: 2, activo: (v) => v < 60 || v > 100 },
                ]}
              />
              <Toggle id={`rula-linea-${sufijo}`} label="Trabaja a un lado del cuerpo o cruza la línea media" puntos="+1" checked={L.antebrazoFueraLinea} onChange={(v) => setL({ antebrazoFueraLinea: v })} />
            </Seccion>
          </>
        )}

        {paso === 1 && (
          <Seccion titulo="Muñeca" paso="Grupo A" nota="Flexión o extensión medida desde la posición neutra.">
            <AngleControl
              id={`rula-muneca-${sufijo}`}
              etiqueta="Flexión o extensión de la muñeca"
              valor={L.munecaAngulo}
              min={-80}
              max={80}
              onChange={(v) => setL({ munecaAngulo: v })}
              figura={fig('muneca')}
              bandas={[
                { texto: 'Neutra (0°)', puntos: 1, activo: (v) => v === 0 },
                { texto: '> 0° y < 15°', puntos: 2, activo: (v) => v !== 0 && Math.abs(v) < 15 },
                { texto: '15° o más', puntos: 3, activo: (v) => Math.abs(v) >= 15 },
              ]}
            />
            <Toggle id={`rula-desv-${sufijo}`} label="Desviación radial o cubital" puntos="+1" checked={L.munecaDesviada} onChange={(v) => setL({ munecaDesviada: v })} />
            <div>
              <p className="mb-2 font-semibold">Giro de la muñeca (pronación o supinación)</p>
              <OptionCards
                name={`rula-giro-${sufijo}`}
                valor={L.giroExtremo ? 'extremo' : 'medio'}
                onChange={(v) => setL({ giroExtremo: v === 'extremo' })}
                opciones={[
                  { valor: 'medio', texto: 'Medio o sin giro', detalle: 'Rango medio de pronación/supinación', puntos: '1' },
                  { valor: 'extremo', texto: 'Extremo', detalle: 'En o cerca del final del rango', puntos: '2' },
                ]}
              />
            </div>
          </Seccion>
        )}

        {paso === 2 && (
          <>
            <Seccion titulo="Cuello" paso="Grupo B" nota="Ángulo entre el eje de la cabeza y el del tronco. Negativo = extensión.">
              <AngleControl
                id="rula-cuello"
                etiqueta="Flexión o extensión del cuello"
                valor={C.cuelloAngulo}
                min={-40}
                max={80}
                onChange={(v) => setRulaComun({ cuelloAngulo: v })}
                figura={fig('cuello')}
                bandas={[
                  { texto: '0°–10°', puntos: 1, activo: (v) => v >= 0 && v <= 10 },
                  { texto: '10°–20°', puntos: 2, activo: (v) => v > 10 && v <= 20 },
                  { texto: '> 20°', puntos: 3, activo: (v) => v > 20 },
                  { texto: 'Extensión', puntos: 4, activo: (v) => v < 0 },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                <Toggle id="rula-cuello-rot" label="Cabeza rotada" puntos="+1" checked={C.cuelloRotado} onChange={(v) => setRulaComun({ cuelloRotado: v })} />
                <Toggle id="rula-cuello-inc" label="Inclinación lateral" puntos="+1" checked={C.cuelloInclinado} onChange={(v) => setRulaComun({ cuelloInclinado: v })} />
              </div>
            </Seccion>
            <Seccion titulo="Tronco" paso="Grupo B" nota="Flexión respecto a la vertical. Use 0° si está erguido o sentado bien apoyado (tronco-muslos > 90°).">
              <AngleControl
                id="rula-tronco"
                etiqueta="Flexión del tronco"
                valor={C.troncoAngulo}
                min={0}
                max={120}
                onChange={(v) => setRulaComun({ troncoAngulo: v })}
                figura={fig('tronco')}
                bandas={[
                  { texto: 'Erguido / sentado apoyado', puntos: 1, activo: (v) => v === 0 },
                  { texto: '0°–20°', puntos: 2, activo: (v) => v > 0 && v <= 20 },
                  { texto: '20°–60°', puntos: 3, activo: (v) => v > 20 && v <= 60 },
                  { texto: '> 60°', puntos: 4, activo: (v) => v > 60 },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                <Toggle id="rula-tronco-rot" label="Tronco rotado" puntos="+1" checked={C.troncoRotado} onChange={(v) => setRulaComun({ troncoRotado: v })} />
                <Toggle id="rula-tronco-inc" label="Inclinación lateral" puntos="+1" checked={C.troncoInclinado} onChange={(v) => setRulaComun({ troncoInclinado: v })} />
              </div>
            </Seccion>
            <Seccion titulo="Piernas" paso="Grupo B">
              <OptionCards
                name="rula-piernas"
                valor={C.piernasApoyadas ? 'si' : 'no'}
                onChange={(v) => setRulaComun({ piernasApoyadas: v === 'si' })}
                opciones={[
                  { valor: 'si', texto: 'Apoyadas y equilibradas', detalle: 'Sentado con pies apoyados, o de pie con peso simétrico y espacio para moverse', puntos: '1' },
                  { valor: 'no', texto: 'Sin apoyo o peso asimétrico', puntos: '2' },
                ]}
              />
            </Seccion>
          </>
        )}

        {paso === 3 && (
          <>
            <Seccion titulo={`Grupo A · ${lado === 'izq' ? 'lado izquierdo' : 'lado derecho'}`} paso="Actividad y carga">
              <Toggle
                id={`rula-actA-${sufijo}`}
                label="Postura estática o repetitiva"
                detalle="Mantenida más de 1 minuto seguido o repetida más de 4 veces por minuto"
                puntos="+1"
                checked={L.actividadA}
                onChange={(v) => setL({ actividadA: v })}
              />
              {cargas(L.cargaA, (v) => setL({ cargaA: v }), `rula-cargaA-${sufijo}`)}
            </Seccion>
            <Seccion titulo="Grupo B · cuello, tronco y piernas" paso="Actividad y carga">
              <Toggle id="rula-actB" label="Postura estática o repetitiva" detalle="Mantenida más de 1 minuto o repetida más de 4 veces por minuto" puntos="+1" checked={C.actividadB} onChange={(v) => setRulaComun({ actividadB: v })} />
              {cargas(C.cargaB, (v) => setRulaComun({ cargaB: v }), 'rula-cargaB')}
            </Seccion>
          </>
        )}

        <NavPasos actual={paso} total={PASOS.length} onChange={setPaso} onFinal={onInforme} />
      </div>

      <PanelVivo
        metodo="RULA"
        max={7}
        lados={[
          { nombre: 'Izquierdo', final: res.izq.final, nivel: res.izq.nivel, detalle: `A ${res.izq.grupoA} · B ${res.izq.grupoB} · C ${res.izq.C} · D ${res.izq.D}` },
          { nombre: 'Derecho', final: res.der.final, nivel: res.der.nivel, detalle: `A ${res.der.grupoA} · B ${res.der.grupoB} · C ${res.der.C} · D ${res.der.D}` },
        ]}
        figura={<Figura postura={postura} tamano={170} colores={Object.fromEntries(res[lado].factores.filter((f) => f.segmento && f.clave !== 'giro').map((f) => [f.segmento!, nivelSegmento(f.total, f.maximo)]))} titulo="Postura del lado seleccionado" />}
        onInforme={onInforme}
      />
    </div>
  );
}

/** Color por segmento según su aporte relativo (solo para la figura). */
export function nivelSegmento(total: number, maximo: number): import('../methods/common').ColorRiesgo {
  const r = maximo > 1 ? (total - 1) / (maximo - 1) : 0;
  return r <= 0 ? 'verde' : r < 0.4 ? 'amarillo' : r < 0.75 ? 'naranja' : 'rojo';
}

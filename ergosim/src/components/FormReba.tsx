import { useState } from 'react';
import { useErgo } from '../store';
import { REBA_AGARRES, REBA_CARGAS, calcularReba } from '../methods/reba';
import { AngleControl, LadoTabs, NavPasos, OptionCards, Seccion, Stepper, Toggle } from './ui';
import { Personaje, Postura } from './Personaje';
import { PanelVivo } from './PanelVivo';
import { nivelSegmento } from './FormRula';

const PASOS = ['Tronco, cuello y piernas', 'Brazo, antebrazo y muñeca', 'Carga y agarre', 'Actividad'];

export function FormReba({ onInforme }: { onInforme: () => void }) {
  const { reba, setRebaLado, setRebaComun } = useErgo();
  const [paso, setPaso] = useState(0);
  const [lado, setLado] = useState<'izq' | 'der'>('der');
  const L = reba[lado];
  const C = reba.comun;
  const setL = (c: Parameters<typeof setRebaLado>[1]) => setRebaLado(lado, c);
  const sufijo = lado === 'izq' ? 'Izq' : 'Der';
  const postura: Postura = {
    tronco: C.troncoAngulo,
    cuello: C.cuelloAngulo,
    brazo: L.brazoAngulo,
    antebrazo: L.antebrazoAngulo,
    muneca: L.munecaAngulo,
    rodilla: C.sentado ? 0 : C.rodillaFlexion,
    sentado: C.sentado,
    lejano: { brazo: reba[lado === 'izq' ? 'der' : 'izq'].brazoAngulo, antebrazo: reba[lado === 'izq' ? 'der' : 'izq'].antebrazoAngulo, muneca: reba[lado === 'izq' ? 'der' : 'izq'].munecaAngulo },
  };
  const fig = (s: Parameters<typeof Personaje>[0]['resaltar']) => <Personaje postura={postura} resaltar={s} tamano={132} />;
  const res = { izq: calcularReba(reba.izq, C), der: calcularReba(reba.der, C) };
  const porLado = paso === 1 || paso === 2;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 content-start gap-4">
        <Stepper pasos={PASOS} actual={paso} onChange={setPaso} />
        {porLado && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LadoTabs lado={lado} onChange={setLado} />
            <span className="text-xs text-tenue">El grupo B y el agarre se evalúan por lado.</span>
          </div>
        )}

        {paso === 0 && (
          <>
            <Seccion titulo="Tronco" paso="Grupo A" nota="Ángulo entre el eje del tronco y la vertical. Negativo = extensión.">
              <AngleControl
                id="reba-tronco"
                etiqueta="Flexión o extensión del tronco"
                valor={C.troncoAngulo}
                min={-40}
                max={120}
                onChange={(v) => setRebaComun({ troncoAngulo: v })}
                figura={fig('tronco')}
                bandas={[
                  { texto: 'Erguido (0°)', puntos: 1, activo: (v) => v === 0 },
                  { texto: 'Flex. o ext. 0°–20°', puntos: 2, activo: (v) => v !== 0 && Math.abs(v) <= 20 },
                  { texto: 'Flex. 20°–60° o ext. > 20°', puntos: 3, activo: (v) => (v > 20 && v <= 60) || v < -20 },
                  { texto: 'Flex. > 60°', puntos: 4, activo: (v) => v > 60 },
                ]}
              />
              <Toggle id="reba-tronco-ti" label="Torsión o inclinación lateral del tronco" puntos="+1" checked={C.troncoTorsionInclinacion} onChange={(v) => setRebaComun({ troncoTorsionInclinacion: v })} />
            </Seccion>
            <Seccion titulo="Cuello" paso="Grupo A" nota="Ángulo entre el eje de la cabeza y el del tronco. Negativo = extensión.">
              <AngleControl
                id="reba-cuello"
                etiqueta="Flexión o extensión del cuello"
                valor={C.cuelloAngulo}
                min={-40}
                max={80}
                onChange={(v) => setRebaComun({ cuelloAngulo: v })}
                figura={fig('cuello')}
                bandas={[
                  { texto: 'Flex. 0°–20°', puntos: 1, activo: (v) => v >= 0 && v <= 20 },
                  { texto: 'Flex. > 20° o extensión', puntos: 2, activo: (v) => v > 20 || v < 0 },
                ]}
              />
              <Toggle id="reba-cuello-ti" label="Torsión o inclinación lateral de la cabeza" puntos="+1" checked={C.cuelloTorsionInclinacion} onChange={(v) => setRebaComun({ cuelloTorsionInclinacion: v })} />
            </Seccion>
            <Seccion titulo="Piernas" paso="Grupo A">
              <OptionCards
                name="reba-piernas"
                valor={C.piernasApoyo}
                onChange={(v) => setRebaComun({ piernasApoyo: v })}
                opciones={[
                  { valor: 'bilateral', texto: 'Apoyo bilateral', detalle: 'Sentado, andando o de pie con soporte bilateral simétrico', puntos: '1' },
                  { valor: 'unilateral', texto: 'Apoyo unilateral o inestable', detalle: 'De pie sobre una pierna, soporte ligero o postura inestable', puntos: '2' },
                ]}
              />
              <Toggle id="reba-sentado" label="La persona está sentada" detalle="Sentado no se suma la flexión de rodillas" checked={C.sentado} onChange={(v) => setRebaComun({ sentado: v })} />
              {!C.sentado && (
                <AngleControl
                  id="reba-rodilla"
                  etiqueta="Flexión de rodillas"
                  valor={C.rodillaFlexion}
                  min={0}
                  max={150}
                  onChange={(v) => setRebaComun({ rodillaFlexion: v })}
                  figura={fig('piernas')}
                  bandas={[
                    { texto: '< 30°', puntos: 0, activo: (v) => v < 30 },
                    { texto: '30°–60°', puntos: 1, activo: (v) => v >= 30 && v <= 60 },
                    { texto: '> 60°', puntos: 2, activo: (v) => v > 60 },
                  ]}
                />
              )}
            </Seccion>
          </>
        )}

        {paso === 1 && (
          <>
            <Seccion titulo="Brazo" paso="Grupo B" nota="Ángulo entre el eje del brazo y el del tronco. Negativo = extensión.">
              <AngleControl
                id={`reba-brazo-${sufijo}`}
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
                <Toggle id={`reba-abd-${sufijo}`} label="Brazo abducido o rotado" puntos="+1" checked={L.brazoAbducidoRotado} onChange={(v) => setL({ brazoAbducidoRotado: v })} />
                <Toggle id={`reba-hombro-${sufijo}`} label="Hombro elevado" puntos="+1" checked={L.hombroElevado} onChange={(v) => setL({ hombroElevado: v })} />
                <Toggle id={`reba-apoyo-${sufijo}`} label="Apoyo o postura a favor de la gravedad" detalle="P. ej. el brazo cuelga con el tronco flexionado" puntos="−1" checked={L.brazoApoyoGravedad} onChange={(v) => setL({ brazoApoyoGravedad: v })} />
              </div>
            </Seccion>
            <Seccion titulo="Antebrazo" paso="Grupo B">
              <AngleControl
                id={`reba-antebrazo-${sufijo}`}
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
            </Seccion>
            <Seccion titulo="Muñeca" paso="Grupo B">
              <AngleControl
                id={`reba-muneca-${sufijo}`}
                etiqueta="Flexión o extensión de la muñeca"
                valor={L.munecaAngulo}
                min={-80}
                max={80}
                onChange={(v) => setL({ munecaAngulo: v })}
                figura={fig('muneca')}
                bandas={[
                  { texto: '0°–15°', puntos: 1, activo: (v) => Math.abs(v) <= 15 },
                  { texto: '> 15°', puntos: 2, activo: (v) => Math.abs(v) > 15 },
                ]}
              />
              <Toggle id={`reba-mtd-${sufijo}`} label="Torsión o desviación lateral" puntos="+1" checked={L.munecaTorsionDesviacion} onChange={(v) => setL({ munecaTorsionDesviacion: v })} />
            </Seccion>
          </>
        )}

        {paso === 2 && (
          <>
            <Seccion titulo="Carga o fuerza" paso="Puntuación A" nota="Se suma al resultado de la Tabla A.">
              <OptionCards name="reba-carga" valor={C.carga} onChange={(v) => setRebaComun({ carga: v })} columnas={3} opciones={REBA_CARGAS.map((c) => ({ valor: c.valor, texto: c.texto, puntos: `+${c.puntos}` }))} />
              <Toggle id="reba-brusca" label="La fuerza se aplica bruscamente" puntos="+1" checked={C.cargaBrusca} onChange={(v) => setRebaComun({ cargaBrusca: v })} />
            </Seccion>
            <Seccion titulo={`Agarre · ${lado === 'izq' ? 'mano izquierda' : 'mano derecha'}`} paso="Puntuación B" nota="Se suma al resultado de la Tabla B.">
              <OptionCards name={`reba-agarre-${sufijo}`} valor={L.agarre} onChange={(v) => setL({ agarre: v })} opciones={REBA_AGARRES.map((g) => ({ valor: g.valor, texto: g.texto, detalle: g.detalle, puntos: `+${g.puntos}` }))} />
            </Seccion>
          </>
        )}

        {paso === 3 && (
          <Seccion titulo="Actividad muscular" paso="Puntuación final" nota="Las tres situaciones pueden sumarse (hasta +3).">
            <Toggle id="reba-act-est" label="Una o más partes del cuerpo estáticas" detalle="Mantenidas más de 1 minuto" puntos="+1" checked={C.actEstatica} onChange={(v) => setRebaComun({ actEstatica: v })} />
            <Toggle id="reba-act-rep" label="Movimientos repetitivos" detalle="Más de 4 veces por minuto (sin contar caminar)" puntos="+1" checked={C.actRepetitiva} onChange={(v) => setRebaComun({ actRepetitiva: v })} />
            <Toggle id="reba-act-cam" label="Cambios de postura importantes o posturas inestables" puntos="+1" checked={C.actCambios} onChange={(v) => setRebaComun({ actCambios: v })} />
          </Seccion>
        )}

        <NavPasos actual={paso} total={PASOS.length} onChange={setPaso} onFinal={onInforme} />
      </div>

      <PanelVivo
        metodo="REBA"
        max={15}
        lados={[
          { nombre: 'Izquierdo', final: res.izq.final, nivel: res.izq.nivel, detalle: `A ${res.izq.puntuacionA} · B ${res.izq.puntuacionB} · C ${res.izq.C}` },
          { nombre: 'Derecho', final: res.der.final, nivel: res.der.nivel, detalle: `A ${res.der.puntuacionA} · B ${res.der.puntuacionB} · C ${res.der.C}` },
        ]}
        figura={<Personaje postura={postura} tamano={250} colores={Object.fromEntries(res[lado].factores.map((f) => [f.segmento!, nivelSegmento(f.total, f.maximo)]))} />}
        onInforme={onInforme}
      />
    </div>
  );
}

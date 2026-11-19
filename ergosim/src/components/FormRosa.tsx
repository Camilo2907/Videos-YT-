import { useState } from 'react';
import { useErgo } from '../store';
import { ROSA_TIEMPOS, RosaEntrada, RosaTiempo, calcularRosa } from '../methods/rosa';
import { NavPasos, OptionCards, Seccion, Stepper, Toggle } from './ui';
import { PanelVivo } from './PanelVivo';

const PASOS = ['Silla', 'Pantalla y teléfono', 'Ratón y teclado'];

export function FormRosa({ onInforme }: { onInforme: () => void }) {
  const { rosa: e, setRosa } = useErgo();
  const [paso, setPaso] = useState(0);
  const r = calcularRosa(e);
  const sw = (k: keyof RosaEntrada, label: string, puntos = '+1', detalle?: string) => (
    <Toggle id={`rosa-${k}`} label={label} detalle={detalle} puntos={puntos} checked={e[k] as boolean} onChange={(v) => setRosa({ [k]: v } as Partial<RosaEntrada>)} />
  );
  const tiempo = (k: keyof RosaEntrada, que: string) => (
    <div>
      <p className="mb-2 font-semibold">Tiempo de uso {que}</p>
      <OptionCards
        name={`rosa-${k}`}
        columnas={3}
        valor={e[k] as RosaTiempo}
        onChange={(v) => setRosa({ [k]: v } as Partial<RosaEntrada>)}
        opciones={ROSA_TIEMPOS.map((t) => ({ valor: t.valor, texto: t.texto, puntos: t.puntos > 0 ? `+${t.puntos}` : t.puntos < 0 ? `−${-t.puntos}` : '0' }))}
      />
    </div>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 content-start gap-4">
        <Stepper pasos={PASOS} actual={paso} onChange={setPaso} />

        {paso === 0 && (
          <>
            <Seccion titulo="Altura del asiento" paso="Silla">
              <OptionCards
                name="rosa-altura"
                valor={e.alturaAsiento}
                onChange={(v) => setRosa({ alturaAsiento: v })}
                opciones={[
                  { valor: 'rodillas90', texto: 'Rodillas a unos 90°', puntos: '1' },
                  { valor: 'bajo', texto: 'Asiento muy bajo', detalle: 'Ángulo de rodilla menor de 90°', puntos: '2' },
                  { valor: 'alto', texto: 'Asiento muy alto', detalle: 'Ángulo de rodilla mayor de 90°', puntos: '2' },
                  { valor: 'sinContacto', texto: 'Pies sin tocar el suelo', puntos: '3' },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                {sw('alturaEspacioInsuficiente', 'Espacio insuficiente para las piernas bajo la mesa')}
                {sw('alturaNoRegulable', 'Altura no regulable')}
              </div>
            </Seccion>
            <Seccion titulo="Profundidad del asiento" paso="Silla">
              <OptionCards
                name="rosa-prof"
                columnas={3}
                valor={e.profundidad}
                onChange={(v) => setRosa({ profundidad: v })}
                opciones={[
                  { valor: 'correcta', texto: 'Unos 8 cm hasta la rodilla', puntos: '1' },
                  { valor: 'larga', texto: 'Asiento muy largo', detalle: 'Menos de 8 cm', puntos: '2' },
                  { valor: 'corta', texto: 'Asiento muy corto', detalle: 'Más de 8 cm', puntos: '2' },
                ]}
              />
              {sw('profundidadNoRegulable', 'Profundidad no regulable')}
            </Seccion>
            <Seccion titulo="Reposabrazos" paso="Silla">
              <OptionCards
                name="rosa-repos"
                valor={e.reposabrazos}
                onChange={(v) => setRosa({ reposabrazos: v })}
                opciones={[
                  { valor: 'correctos', texto: 'Codos apoyados a 90°', detalle: 'En línea con los hombros, hombros relajados', puntos: '1' },
                  { valor: 'altos', texto: 'Demasiado altos', detalle: 'Hombros encogidos', puntos: '2' },
                  { valor: 'bajos', texto: 'Demasiado bajos', detalle: 'Los codos no apoyan', puntos: '2' },
                  { valor: 'sinReposabrazos', texto: 'La silla no tiene', detalle: 'Se asimila a codos sin apoyo (NTP 1173)', puntos: '2' },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-3">
                {sw('reposabrazosSeparados', 'Demasiado separados')}
                {sw('reposabrazosDuros', 'Superficie dura o dañada')}
                {sw('reposabrazosNoRegulables', 'No regulables')}
              </div>
            </Seccion>
            <Seccion titulo="Respaldo" paso="Silla">
              <OptionCards
                name="rosa-resp"
                valor={e.respaldo}
                onChange={(v) => setRosa({ respaldo: v })}
                opciones={[
                  { valor: 'correcto', texto: 'Apoyo lumbar adecuado', detalle: 'Reclinado entre 95° y 110°', puntos: '1' },
                  { valor: 'sinLumbar', texto: 'Sin apoyo lumbar', detalle: 'O no está en la parte baja de la espalda', puntos: '2' },
                  { valor: 'inclinacion', texto: 'Inclinación inadecuada', detalle: 'Menos de 95° o más de 110°', puntos: '2' },
                  { valor: 'sinRespaldo', texto: 'Sin respaldo o no se usa', puntos: '2' },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                {sw('superficieAlta', 'Superficie de trabajo demasiado alta', '+1', 'Hombros encogidos')}
                {sw('respaldoNoRegulable', 'Respaldo no regulable')}
              </div>
            </Seccion>
            <Seccion titulo="Tiempo en la silla" paso="Silla">{tiempo('tiempoSilla', 'de la silla')}</Seccion>
          </>
        )}

        {paso === 1 && (
          <>
            <Seccion titulo="Pantalla" paso="Periféricos">
              <OptionCards
                name="rosa-pantalla"
                columnas={3}
                valor={e.pantalla}
                onChange={(v) => setRosa({ pantalla: v })}
                opciones={[
                  { valor: 'correcta', texto: 'A 40–75 cm y a la altura de los ojos', puntos: '1' },
                  { valor: 'baja', texto: 'Muy baja', detalle: 'Por debajo de 30° bajo los ojos', puntos: '2' },
                  { valor: 'alta', texto: 'Muy alta', detalle: 'Provoca extensión del cuello', puntos: '3' },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                {sw('pantallaGiroCuello', 'Hay que girar el cuello')}
                {sw('pantallaLejos', 'Pantalla a más de 75 cm')}
                {sw('pantallaReflejos', 'Brillos o reflejos en la pantalla')}
                {sw('pantallaSinAtril', 'Usa documentos y no hay atril')}
              </div>
              {tiempo('tiempoPantalla', 'de la pantalla')}
            </Seccion>
            <Seccion titulo="Teléfono" paso="Periféricos">
              <OptionCards
                name="rosa-tel"
                valor={e.telefono}
                onChange={(v) => setRosa({ telefono: v })}
                opciones={[
                  { valor: 'correcto', texto: 'Cerca y con cuello neutro', detalle: 'A 30 cm o menos; auriculares o una mano', puntos: '1' },
                  { valor: 'lejos', texto: 'Lejos', detalle: 'A más de 30 cm', puntos: '2' },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                {sw('telefonoCuelloHombro', 'Se sujeta entre el cuello y el hombro', '+2')}
                {sw('telefonoSinManosLibres', 'Sin opción de manos libres')}
              </div>
              {tiempo('tiempoTelefono', 'del teléfono')}
            </Seccion>
          </>
        )}

        {paso === 2 && (
          <>
            <Seccion titulo="Ratón" paso="Periféricos">
              <OptionCards
                name="rosa-raton"
                valor={e.raton}
                onChange={(v) => setRosa({ raton: v })}
                opciones={[
                  { valor: 'alineado', texto: 'Alineado con el hombro', puntos: '1' },
                  { valor: 'noAlineado', texto: 'No alineado o lejos del cuerpo', puntos: '2' },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                {sw('ratonPinza', 'Ratón pequeño, agarre en pinza')}
                {sw('ratonAlturaDistinta', 'Ratón y teclado a diferente altura', '+2')}
                {sw('ratonReposamanosDuro', 'Reposamanos duro o puntos de presión')}
              </div>
              {tiempo('tiempoRaton', 'del ratón')}
            </Seccion>
            <Seccion titulo="Teclado" paso="Periféricos">
              <OptionCards
                name="rosa-teclado"
                valor={e.teclado}
                onChange={(v) => setRosa({ teclado: v })}
                opciones={[
                  { valor: 'recto', texto: 'Muñecas rectas, hombros relajados', puntos: '1' },
                  { valor: 'extendido', texto: 'Muñecas extendidas más de 15°', puntos: '2' },
                ]}
              />
              <div className="grid gap-1 sm:grid-cols-2">
                {sw('tecladoDesviacion', 'Muñecas desviadas al escribir')}
                {sw('tecladoAlto', 'Teclado demasiado alto', '+1', 'Hombros encogidos')}
                {sw('tecladoAlcanceCabeza', 'Alcanza objetos por encima de la cabeza')}
                {sw('tecladoNoRegulable', 'Teclado o plataforma no regulable')}
              </div>
              {tiempo('tiempoTeclado', 'del teclado')}
            </Seccion>
          </>
        )}

        <NavPasos actual={paso} total={PASOS.length} onChange={setPaso} onFinal={onInforme} />
      </div>

      <PanelVivo
        metodo="ROSA"
        max={10}
        lados={[{ nombre: 'Puesto de oficina', final: r.final, nivel: r.nivel, detalle: `Silla ${r.silla} · Pantalla y teléfono ${r.tablaB} · Ratón y teclado ${r.tablaC} · Periféricos ${r.perifericos}` }]}
        onInforme={onInforme}
      />
    </div>
  );
}

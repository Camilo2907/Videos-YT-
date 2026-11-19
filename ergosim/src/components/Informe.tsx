import { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { InformeModelo, TablaCombinacion, aporte, pct } from '../informe';
import { useErgo } from '../store';
import type { Celda } from '../methods/common';
import { RiskBadge } from './ui';
import { ComparacionMetodos, usarComparacion } from './Comparar';
import { FotoEsqueleto, etiquetasAngulos } from './FotoIA';

const fmtFecha = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

function Bloque({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-linea pt-6">
      <h3 className="flex items-baseline gap-3 text-xl font-semibold">
        <span className="num font-datos text-sm text-acento">{n}.</span>
        {titulo}
      </h3>
      {children}
    </section>
  );
}

export function Anexo({ n, titulo, fuente, children, explicacion, lectura }: { n: number; titulo: string; fuente: string; children: ReactNode; explicacion: string; lectura?: string }) {
  return (
    <figure className="tarjeta grid content-start gap-3 p-4">
      <figcaption className="font-titulo font-semibold">
        Anexo {n}. {titulo}
      </figcaption>
      <div className="min-w-0">{children}</div>
      <div className="grid gap-1.5 rounded-xl bg-hundido p-3 text-sm">
        <p>
          <span className="font-bold">Cómo leerlo. </span>
          <span className="text-tinta2">{explicacion}</span>
        </p>
        {lectura && (
          <p>
            <span className="font-bold">En esta evaluación. </span>
            <span className="text-tinta2">{lectura}</span>
          </p>
        )}
      </div>
      <p className="text-xs text-tenue">Fuente de los datos: {fuente}</p>
    </figure>
  );
}

const tooltipEstilo = { contentStyle: { background: 'var(--superficie)', border: '1px solid var(--linea)', borderRadius: 8, color: 'var(--tinta)' }, itemStyle: { color: 'var(--tinta)' }, labelStyle: { color: 'var(--tinta)', fontWeight: 600 } };

function TablaComb({ t, celda }: { t: TablaCombinacion; celda?: Celda }) {
  return (
    <div className="overflow-x-auto">
      <table className="num border-collapse font-datos text-xs" aria-label={t.titulo}>
        <caption className="mb-1 text-left font-cuerpo text-sm font-semibold text-tinta">
          {t.titulo}
          {celda && <span className="ml-2 font-normal text-tenue">· celda resultante: {celda.valor}</span>}
        </caption>
        <thead>
          <tr>
            <th className="whitespace-nowrap px-2 py-1 text-left font-cuerpo font-semibold text-tenue">
              {t.filaTitulo} ↓ / {t.colTitulo} →
            </th>
            {t.columnas.map((c, j) => (
              <th key={c} className={`whitespace-nowrap px-1.5 py-1 text-center font-medium ${celda?.columna === j ? 'text-acento' : 'text-tenue'}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.datos.map((fila, i) => (
            <tr key={i}>
              <th className={`whitespace-nowrap px-2 py-0.5 text-left font-medium ${celda?.fila === i ? 'text-acento' : 'text-tenue'}`}>{t.filas[i]}</th>
              {fila.map((v, j) => {
                const on = celda?.fila === i && celda?.columna === j;
                const guia = celda && (celda.fila === i || celda.columna === j);
                return (
                  <td
                    key={j}
                    className={`px-1.5 py-0.5 text-center ${on ? 'rounded font-bold' : ''}`}
                    style={on ? { background: 'var(--acento)', color: 'var(--sobre-acento)' } : guia ? { background: 'var(--acento-suave)' } : undefined}
                    aria-current={on ? 'true' : undefined}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PRIORIDAD_COLOR = { Alta: 'rojo', Media: 'amarillo', Baja: 'verde' } as const;

export function Informe({ modelo, onCerrar }: { modelo: InformeModelo; onCerrar: () => void }) {
  const estado = useErgo();
  const { datos, foto } = estado;
  const ia = estado.ia[modelo.clave];
  const comparacion = usarComparacion();
  const fuente = `evaluación ${modelo.metodo} de ErgoSim (${fmtFecha(datos.fecha)}); tablas y criterios según docs/fuentes.md.`;
  const posturas = modelo.metodo !== 'ROSA';
  const p = modelo.peor;

  // Datos de gráficas
  const segmentos = posturas
    ? Array.from(new Set(p.factores.map((f) => f.segmento!)))
    : [];
  const nombreSeg: Record<string, string> = { cuello: 'Cuello', tronco: 'Tronco', piernas: 'Piernas', brazo: 'Brazo', antebrazo: 'Antebrazo', muneca: 'Muñeca' };
  const radar = posturas
    ? ['cuello', 'tronco', 'piernas', 'brazo', 'antebrazo', 'muneca']
        .filter((s) => segmentos.includes(s as never))
        .map((s) => {
          const fila: Record<string, string | number> = { segmento: nombreSeg[s] };
          modelo.lados.forEach((l) => {
            const fs = l.factores.filter((f) => f.segmento === s);
            fila[l.nombre] = Math.max(...fs.map(aporte));
          });
          return fila;
        })
    : p.factores.map((f) => ({ segmento: f.nombre, [p.nombre]: aporte(f) }));

  const contrib = p.factores.map((f) => {
    const pos = f.modificadores.filter((m) => m.valor > 0).reduce((s, m) => s + m.valor, 0);
    const neg = f.modificadores.filter((m) => m.valor < 0).reduce((s, m) => s + m.valor, 0);
    return { factor: f.nombre, Base: f.base + neg, Modificadores: pos, total: f.total };
  });

  const ladosBarras = modelo.lados.map((l) => ({ lado: l.nombre, Puntuación: l.final, pct: pct(l.final, modelo.max), color: l.nivel.color, riesgo: l.nivel.riesgo }));
  const intermediosRosa = modelo.metodo === 'ROSA' ? p.intermedios.map((i) => ({ etapa: i.etiqueta.replace(/ \(.*\)/, ''), Puntuación: i.valor })) : [];

  const series = ['var(--serie-1)', 'var(--serie-2)'];
  const ordenados = [...p.factores].sort((a, b) => aporte(b) - aporte(a));
  const top = ordenados[0];
  const masMods = [...contrib].sort((a, b) => b.Modificadores - a.Modificadores)[0];
  const origenes = Object.values(p.origen);
  const nIA = origenes.filter((o) => o === 'IA').length;
  const nCorr = origenes.filter((o) => o === 'IA, corregido a mano').length;
  const ORIGEN_ESTILO: Record<string, string> = { IA: 'var(--acento-suave)', 'IA, corregido a mano': 'var(--r-amarillo-fondo)', Manual: 'var(--hundido)' };
  let anexo = 0;
  const sig = () => ++anexo;
  const evaluados = comparacion.filter((c) => c.evaluado);

  return (
    <article id="informe" className="tarjeta grid gap-6 p-5 sm:p-8" style={{ boxShadow: 'var(--sombra)' }}>
      {/* 1. Portada */}
      <header className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="etiqueta">Informe de evaluación ergonómica</p>
            <h2 className="mt-1 text-3xl font-bold">{modelo.nombreCompleto}</h2>
          </div>
          <div className="no-imprimir flex flex-wrap gap-2">
            {!window.claude && (
              <button type="button" onClick={() => window.print()} className="rounded-lg bg-acento px-3 py-1.5 text-sm font-bold text-sobre-acento">
                Imprimir o guardar PDF
              </button>
            )}
            <button type="button" onClick={onCerrar} className="rounded-lg border border-linea px-3 py-1.5 text-sm font-medium">
              Volver al formulario
            </button>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg bg-hundido p-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Empresa', datos.empresa],
            ['Área', datos.area],
            ['Puesto', datos.puesto],
            ['Trabajador', datos.trabajador || 'POR DEFINIR'],
            ['Evaluador', datos.evaluador || 'POR DEFINIR'],
            ['Fecha', fmtFecha(datos.fecha)],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="etiqueta">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-4 rounded-lg p-4" style={{ background: `var(--r-${p.nivel.color}-fondo)`, border: `1px solid var(--r-${p.nivel.color})` }}>
          <span className="num font-titulo text-5xl font-bold leading-none" style={{ color: `var(--r-${p.nivel.color}-tinta)` }}>
            {p.final}
            <span className="text-xl opacity-70">/{modelo.max}</span>
          </span>
          <div className="grid gap-1">
            <RiskBadge nivel={p.nivel} grande />
            <span className="text-sm" style={{ color: `var(--r-${p.nivel.color}-tinta)` }}>
              {modelo.lados.length > 1 ? `${p.nombre} (más desfavorable). ` : ''}
              {p.nivel.actuacion}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Tarea */}
      <Bloque n={1} titulo="Descripción de la tarea">
        <p className="max-w-prose">{datos.tarea || 'POR DEFINIR'}</p>
        {foto ? (
          <div className="grid gap-1">
            <FotoEsqueleto foto={foto} ia={ia} etiquetas={etiquetasAngulos(modelo.clave, estado, ia?.ladoVisible === 'izq' ? 'izq' : 'der')} alto={380} />
            {ia && <p className="text-xs text-tenue">Esqueleto y articulaciones estimados por IA (aproximados); los ángulos mostrados son los valores finales del formulario.</p>}
          </div>
        ) : (
          <p className="text-sm text-tenue">Sin fotografía.</p>
        )}
        <p className="text-sm">
          <strong>Origen de los valores: </strong>
          {ia
            ? `${nIA} de ${origenes.length} factores se tomaron tal como los sugirió la IA a partir de la foto (confianza ${ia.confianza}); ${nCorr} se corrigieron a mano; el resto se introdujo manualmente. La columna «Origen» de cada tabla lo detalla.`
            : 'todos los valores fueron introducidos manualmente por el evaluador (no se usó IA).'}
        </p>
        {ia && ia.observaciones.length > 0 && (
          <ul className="grid list-disc gap-1 pl-5 text-sm text-tinta2">
            {ia.observaciones.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        )}
      </Bloque>

      {/* 3. Resultados por lado */}
      <Bloque n={2} titulo="Resultados del método">
        <div className={`grid gap-5 ${modelo.lados.length > 1 ? '2xl:grid-cols-2' : ''}`}>
          {modelo.lados.map((l) => (
            <div key={l.nombre} className="grid min-w-0 content-start gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-lg font-semibold">{l.nombre}</h4>
                <RiskBadge nivel={l.nivel} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-linea text-left">
                      <th className="py-1.5 pr-2 etiqueta">Factor</th>
                      <th className="py-1.5 pr-2 etiqueta">Medida</th>
                      <th className="py-1.5 pr-2 text-center etiqueta">Base</th>
                      <th className="py-1.5 pr-2 etiqueta">Modificadores</th>
                      <th className="py-1.5 pr-2 text-center etiqueta">Resultado</th>
                      <th className="py-1.5 etiqueta">Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {l.factores.map((f) => (
                      <tr key={f.clave} className="border-b border-linea align-top">
                        <td className="py-1.5 pr-2 font-medium">{f.nombre}</td>
                        <td className="py-1.5 pr-2 text-tinta2">{f.medida}</td>
                        <td className="num py-1.5 pr-2 text-center font-datos">{f.base}</td>
                        <td className="py-1.5 pr-2 text-tinta2">
                          {f.modificadores.length ? f.modificadores.map((m) => `${m.nombre} (${m.valor > 0 ? '+' : '−'}${Math.abs(m.valor)})`).join('; ') : '—'}
                        </td>
                        <td className="num py-1.5 pr-2 text-center font-datos font-bold">{f.total}</td>
                        <td className="py-1.5">
                          <span className="whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: ORIGEN_ESTILO[l.origen[f.clave] ?? 'Manual'] }}>
                            {l.origen[f.clave] ?? 'Manual'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-hundido p-3 text-sm sm:grid-cols-3">
                {l.intermedios.map((i) => (
                  <div key={i.etiqueta} className="flex justify-between gap-2">
                    <span className="text-tinta2">{i.etiqueta}</span>
                    <span className="num font-datos font-semibold">{i.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm">
          <strong>Interpretación:</strong> {p.nivel.actuacion} {modelo.metodo === 'ROSA' ? 'El método fija el nivel de acción en 5.' : ''}
        </p>
      </Bloque>

      {/* 4. Segmentos */}
      <Bloque n={3} titulo={posturas ? 'Análisis por segmento corporal' : 'Análisis por elemento del puesto'}>
        <p className="text-sm text-tinta2">
          Aporte de cada {posturas ? 'segmento' : 'elemento'} respecto a su máximo posible ({p.nombre.toLowerCase()}). 0 % = postura de referencia.
        </p>
        <ul className="grid gap-2">
          {[...p.factores]
            .sort((a, b) => aporte(b) - aporte(a))
            .map((f) => {
              const v = aporte(f);
              return (
                <li key={f.clave} className="grid grid-cols-[minmax(110px,160px)_1fr_auto] items-center gap-3 text-sm">
                  <span className="truncate">{f.nombre}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-hundido" aria-hidden="true">
                    <span className="block h-full rounded-full" style={{ width: `${Math.max(v, 2)}%`, background: 'var(--serie-1)' }} />
                  </span>
                  <span className="num whitespace-nowrap text-right font-datos">
                    {v} % · {f.total}/{f.maximo}
                  </span>
                </li>
              );
            })}
        </ul>
      </Bloque>

      {/* 5. Recomendaciones */}
      <Bloque n={4} titulo="Recomendaciones priorizadas">
        <p className="text-sm text-tinta2">
          Ordenadas por prioridad y por jerarquía de controles (técnicas, administrativas y EPP). El responsable y el plazo son sugerencias que debe validar el profesional en SST.
        </p>
        {modelo.recomendaciones.length === 0 ? (
          <p>No se identifican desviaciones que requieran medidas. Mantener las condiciones actuales y reevaluar ante cambios en la tarea.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-linea text-left">
                  <th className="py-1.5 pr-2 etiqueta">Prioridad</th>
                  <th className="py-1.5 pr-2 etiqueta">Medida</th>
                  <th className="py-1.5 pr-2 etiqueta">Tipo</th>
                  <th className="py-1.5 pr-2 etiqueta">Ámbito</th>
                  <th className="py-1.5 pr-2 etiqueta">Responsable sugerido</th>
                  <th className="py-1.5 etiqueta">Plazo sugerido</th>
                </tr>
              </thead>
              <tbody>
                {modelo.recomendaciones.map((r) => {
                  const c = PRIORIDAD_COLOR[r.prioridad];
                  return (
                    <tr key={r.id} className="border-b border-linea align-top">
                      <td className="py-2 pr-2">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `var(--r-${c}-fondo)`, color: `var(--r-${c}-tinta)`, border: `1px solid var(--r-${c})` }}>
                          {r.prioridad}
                        </span>
                      </td>
                      <td className="py-2 pr-2">
                        <span className="font-semibold">{r.titulo}</span>
                        <span className="block text-tinta2">{r.detalle}</span>
                      </td>
                      <td className="py-2 pr-2">{r.tipo}</td>
                      <td className="py-2 pr-2 text-tinta2">{r.ambito}</td>
                      <td className="py-2 pr-2 text-tinta2">{r.responsable}</td>
                      <td className="py-2 text-tinta2">{r.plazo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Bloque>

      {/* 6. Conclusiones */}
      <Bloque n={5} titulo="Conclusiones y limitaciones">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">Conclusiones</h4>
            <ul className="grid list-disc gap-1.5 pl-5">
              {modelo.conclusiones.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Limitaciones del método</h4>
            <ul className="grid list-disc gap-1.5 pl-5 text-tinta2">
              {modelo.limitaciones.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </Bloque>

      {/* 7. Referencias */}
      <Bloque n={6} titulo="Referencias">
        <ul className="grid gap-2 text-sm">
          {modelo.referencias.map((r) => (
            <li key={r} className="pl-6 -indent-6 break-words">
              {r}
            </li>
          ))}
        </ul>
      </Bloque>

      {/* 8. Anexos */}
      <Bloque n={7} titulo="Anexos">
        <div className="grid gap-4 xl:grid-cols-2">
          <Anexo n={sig()} titulo={posturas ? 'Radar por segmento corporal (% del máximo de cada segmento)' : 'Radar por elemento del puesto (% del máximo de cada elemento)'} fuente={fuente}
            explicacion={`Cada eje es un ${posturas ? 'segmento del cuerpo' : 'elemento del puesto'}. El centro (0 %) es la postura de referencia y el borde (100 %) el peor valor posible de ese ${posturas ? 'segmento' : 'elemento'}. Cuanto más se aleja la línea del centro, más aporta al riesgo.${posturas ? ' La línea azul es el lado izquierdo y la naranja el derecho: donde se separan, un lado trabaja peor que el otro.' : ''}`}
            lectura={top && aporte(top) > 0 ? `El punto más alejado es ${top.nombre.toLowerCase()} (${aporte(top)} %): es la primera parte a corregir.` : 'Todos los puntos están en el centro: no hay desviaciones.'}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="72%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="segmento" tick={{ fontSize: 12, fill: 'var(--tinta-2)' }} />
                  <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10, fill: 'var(--tenue)' }} angle={90} />
                  {(posturas ? modelo.lados : [p]).map((l, i) => (
                    <Radar key={l.nombre} name={l.nombre} dataKey={l.nombre} stroke={series[i]} fill={series[i]} fillOpacity={0.18} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                  ))}
                  <Legend wrapperStyle={{ color: 'var(--tinta-2)', fontSize: 12 }} />
                  <Tooltip {...tooltipEstilo} formatter={(v: number) => `${v} %`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Anexo>

          <Anexo n={sig()} titulo={`Contribución de cada factor (${p.nombre.toLowerCase()}): puntuación base y modificadores`} fuente={fuente}
            explicacion="Cada barra es la puntuación de un factor. La parte azul es lo que puntúa la postura en sí (el ángulo o la situación base) y la naranja lo que suman las situaciones agravantes, como giros, hombro elevado o falta de regulación. Mucho naranja indica que corregir esas situaciones baja el riesgo sin cambiar la postura principal."
            lectura={masMods && masMods.Modificadores > 0 ? `${masMods.factor} es el factor con más agravantes (+${masMods.Modificadores}).` : 'Ningún factor tiene agravantes: la puntuación viene solo de la postura base.'}
          >
            <div style={{ height: Math.max(220, contrib.length * 34 + 60) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contrib} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }} barCategoryGap={6}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--tenue)' }} />
                  <YAxis type="category" dataKey="factor" width={118} tick={{ fontSize: 12, fill: 'var(--tinta-2)' }} />
                  <Tooltip {...tooltipEstilo} cursor={{ fill: 'var(--hundido)' }} />
                  <Legend wrapperStyle={{ color: 'var(--tinta-2)', fontSize: 12 }} />
                  <Bar dataKey="Base" stackId="a" fill="var(--serie-1)" stroke="var(--superficie)" strokeWidth={2} isAnimationActive={false} />
                  <Bar dataKey="Modificadores" stackId="a" fill="var(--serie-2)" stroke="var(--superficie)" strokeWidth={2} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                    <LabelList dataKey="total" position="right" style={{ fill: 'var(--tinta)', fontSize: 11 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Anexo>

          {posturas ? (
            <Anexo n={sig()} titulo={`Puntuación final por lado (escala 1–${modelo.max}) y nivel de riesgo`} fuente={fuente}
              explicacion={`Compara la puntuación final de cada lado en la escala del método (1 a ${modelo.max}). La altura es la puntuación y el color, el nivel de riesgo que le corresponde.`}
              lectura={modelo.lados[0].final === modelo.lados[1]?.final ? `Ambos lados obtienen ${modelo.lados[0].final}.` : `El lado con mayor puntuación (${p.nombre.toLowerCase()}, ${p.final}) es el que define el riesgo del puesto.`}
            >
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ladosBarras} margin={{ left: 0, right: 16, top: 24, bottom: 4 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="lado" tick={{ fontSize: 12, fill: 'var(--tinta-2)' }} />
                    <YAxis domain={[0, modelo.max]} allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--tenue)' }} />
                    <Tooltip {...tooltipEstilo} cursor={{ fill: 'var(--hundido)' }} />
                    <Bar dataKey="Puntuación" radius={[4, 4, 0, 0]} maxBarSize={72} isAnimationActive={false}>
                      {ladosBarras.map((d) => (
                        <Cell key={d.lado} fill={`var(--r-${d.color})`} />
                      ))}
                      <LabelList dataKey="riesgo" position="top" style={{ fill: 'var(--tinta)', fontSize: 12, fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Anexo>
          ) : (
            <Anexo n={sig()} titulo="Puntuaciones intermedias del método ROSA" fuente={fuente}
              explicacion="Muestra el camino del cálculo: la silla, la pantalla con el teléfono, el ratón con el teclado y su combinación. La puntuación final es el mayor valor entre la silla y los periféricos, así que el elemento más alto es el que marca el resultado."
              lectura={`La silla suma ${p.intermedios[1]?.valor} y los periféricos ${p.intermedios[4]?.valor}; por eso el resultado es ${p.final}.`}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intermediosRosa} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--tenue)' }} />
                    <YAxis type="category" dataKey="etapa" width={150} tick={{ fontSize: 12, fill: 'var(--tinta-2)' }} />
                    <Tooltip {...tooltipEstilo} cursor={{ fill: 'var(--hundido)' }} />
                    <Bar dataKey="Puntuación" fill="var(--serie-1)" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                      <LabelList dataKey="Puntuación" position="right" style={{ fill: 'var(--tinta)', fontSize: 11 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Anexo>
          )}

          <Anexo n={sig()} titulo="Comparación entre métodos (puntuación normalizada 0–100 %)" fuente="métodos con informe generado en esta sesión de ErgoSim; normalización = puntuación ÷ máximo del método."
            explicacion="Pone los métodos en una misma escala dividiendo cada puntuación por su máximo (RULA 7, REBA 15, ROSA 10). Sirve para orientarse: los métodos no son equivalentes porque cada uno observa partes distintas del cuerpo o del puesto."
            lectura={evaluados.length >= 2 ? `El resultado más alto es ${[...evaluados].sort((a, b) => b.pct - a.pct)[0].metodo} (${[...evaluados].sort((a, b) => b.pct - a.pct)[0].pct} %).` : undefined}
          >
            {evaluados.length >= 2 ? (
              <ComparacionMetodos datos={evaluados} />
            ) : (
              <p className="text-sm text-tenue">Genere el informe de al menos otro método para ver la comparación. Métodos con informe: {evaluados.map((e) => e.metodo).join(', ') || 'ninguno'}.</p>
            )}
          </Anexo>
        </div>

        <Anexo n={sig()} titulo={`Tablas de combinación con la celda resultante resaltada (${p.nombre.toLowerCase()})`} fuente={`${modelo.referencias[modelo.referencias.length - 1].split('. https')[0]} (ver docs/fuentes.md).`}
          explicacion="Así calcula el método el resultado: se busca la fila y la columna con las puntuaciones parciales, y la celda donde se cruzan (resaltada) es la puntuación del grupo. Las franjas claras marcan la fila y la columna usadas."
          lectura={`La última tabla da ${p.celdas[modelo.tablas[modelo.tablas.length - 1].clave].valor}${modelo.metodo === 'REBA' ? `, la puntuación C; al sumar la actividad (+${p.final - p.celdas.C.valor}) resulta ${p.final}` : ', que es la puntuación final'}.`}
        >
          <div className="grid gap-5">
            {modelo.tablas.map((t) => (
              <TablaComb key={t.clave} t={t} celda={p.celdas[t.clave]} />
            ))}
          </div>
        </Anexo>
      </Bloque>

      <footer className="border-t border-linea pt-4 text-xs text-tenue">
        Herramienta académica. Este informe no reemplaza la evaluación de un profesional en Seguridad y Salud en el Trabajo.
      </footer>
    </article>
  );
}

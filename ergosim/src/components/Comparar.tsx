import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useErgo } from '../store';
import type { Metodo } from '../store';
import { construirInforme, pct } from '../informe';
import type { NivelRiesgo } from '../methods/common';
import { RiskBadge } from './ui';

export interface FilaComparacion {
  clave: Metodo;
  metodo: string;
  final: number;
  max: number;
  pct: number;
  nivel: NivelRiesgo;
  evaluado: boolean;
}

export function usarComparacion(): FilaComparacion[] {
  const s = useErgo();
  return (['rula', 'reba', 'rosa'] as const).map((m) => {
    const inf = construirInforme(m, s);
    return { clave: m, metodo: inf.metodo, final: inf.peor.final, max: inf.max, pct: pct(inf.peor.final, inf.max), nivel: inf.peor.nivel, evaluado: s.informes[m] };
  });
}

export function ComparacionMetodos({ datos }: { datos: FilaComparacion[] }) {
  const filas = datos.map((d) => ({ ...d, etiqueta: `${d.pct} % · ${d.nivel.riesgo}` }));
  return (
    <div className="grid gap-3">
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filas} margin={{ left: 0, right: 16, top: 24, bottom: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="metodo" tick={{ fontSize: 12, fill: 'var(--tinta-2)' }} />
            <YAxis domain={[0, 100]} unit=" %" tick={{ fontSize: 11, fill: 'var(--tenue)' }} />
            <Tooltip
              cursor={{ fill: 'var(--hundido)' }}
              contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--linea)', borderRadius: 8, color: 'var(--tinta)' }}
              formatter={(v: number, _n, item) => [`${v} % (${item.payload.final}/${item.payload.max})`, 'Puntuación normalizada']}
            />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={80} isAnimationActive={false}>
              {filas.map((d) => (
                <Cell key={d.clave} fill={`var(--r-${d.nivel.color})`} />
              ))}
              <LabelList dataKey="etiqueta" position="top" style={{ fill: 'var(--tinta)', fontSize: 12, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-tenue">El color de cada barra indica el nivel de riesgo del propio método; la altura, la puntuación respecto a su máximo (RULA 7, REBA 15, ROSA 10). Los métodos no son equivalentes entre sí: la comparación es orientativa.</p>
    </div>
  );
}

export function VistaComparar() {
  const filas = usarComparacion();
  const { setVista, datos } = useErgo();
  const evaluados = filas.filter((f) => f.evaluado);
  const peor = [...evaluados].sort((a, b) => b.pct - a.pct)[0];
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="tarjeta p-4">
          <p className="etiqueta">Métodos con informe</p>
          <p className="num mt-1 font-titulo text-3xl font-bold">
            {evaluados.length}
            <span className="text-base font-medium text-tenue"> de 3</span>
          </p>
        </div>
        <div className="tarjeta p-4">
          <p className="etiqueta">Puesto evaluado</p>
          <p className="mt-1 font-semibold">{datos.puesto}</p>
          <p className="text-sm text-tenue">
            {datos.empresa} · {datos.area}
          </p>
        </div>
        <div className="tarjeta p-4">
          <p className="etiqueta">Resultado más desfavorable</p>
          {peor ? (
            <div className="mt-1 grid gap-1">
              <p className="font-semibold">
                {peor.metodo}: {peor.final}/{peor.max}
              </p>
              <RiskBadge nivel={peor.nivel} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-tenue">Aún no hay informes.</p>
          )}
        </div>
      </div>

      <section className="tarjeta grid gap-3 p-5">
        <h2 className="text-xl font-semibold">Comparación entre métodos</h2>
        {evaluados.length ? (
          <ComparacionMetodos datos={evaluados} />
        ) : (
          <p className="text-tinta2">Complete un método y pulse «Generar informe»; el resultado aparecerá aquí para compararlo con los demás.</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-linea text-left">
                <th className="py-1.5 etiqueta">Método</th>
                <th className="py-1.5 etiqueta">Puntuación</th>
                <th className="py-1.5 etiqueta">Normalizada</th>
                <th className="py-1.5 etiqueta">Riesgo</th>
                <th className="py-1.5 etiqueta">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.clave} className="border-b border-linea">
                  <td className="py-2 font-semibold">{f.metodo}</td>
                  <td className="num py-2 font-datos">{f.evaluado ? `${f.final}/${f.max}` : '—'}</td>
                  <td className="num py-2 font-datos">{f.evaluado ? `${f.pct} %` : '—'}</td>
                  <td className="py-2">{f.evaluado ? <RiskBadge nivel={f.nivel} /> : '—'}</td>
                  <td className="py-2">
                    <button type="button" className="text-acento underline underline-offset-2" onClick={() => setVista(f.clave)}>
                      {f.evaluado ? 'Ver o editar' : 'Evaluar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

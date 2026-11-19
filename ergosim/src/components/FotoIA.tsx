import { useEffect, useRef, useState } from 'react';
import { Metodo, useErgo } from '../store';
import { MENSAJE_ERROR, Punto, ResultadoIA, construirPrompt, validarRespuesta } from '../ia';
import { analizarPose, poseAMetodo } from '../pose';
import { aplicarRespuestas, RespuestasRapidas } from '../respuestas';
import { construirInforme } from '../informe';
import { RiskBadge } from './ui';

type Sample = ((input: string, opts?: Record<string, unknown>) => Promise<{ text: string }>) & {
  json: (input: string, opts?: Record<string, unknown>) => Promise<unknown>;
  limits: () => Promise<{ images?: { mediaTypes: string[]; maxInputBytes: number } }>;
};
declare global {
  interface Window {
    claude?: { use: (n: string) => Promise<unknown> };
  }
}

/** Resuelve la capacidad `sample` con imágenes, o null si esta vista no puede usarla. */
function useSample() {
  const [estado, setEstado] = useState<{ s: Sample | null; listo: boolean; imagenes: boolean }>({ s: null, listo: false, imagenes: false });
  useEffect(() => {
    let vivo = true;
    (async () => {
      const s = window.claude ? ((await window.claude.use('sample').catch(() => null)) as Sample | null) : null;
      const lim = s ? await s.limits().catch(() => null) : null;
      if (vivo) setEstado({ s, listo: true, imagenes: !!lim?.images });
    })();
    return () => {
      vivo = false;
    };
  }, []);
  return estado;
}

const UNIONES: [Punto, Punto][] = [
  ['cabeza', 'hombro'],
  ['hombro', 'codo'],
  ['codo', 'muneca'],
  ['hombro', 'cadera'],
  ['cadera', 'rodilla'],
  ['rodilla', 'tobillo'],
];

/** Etiquetas de ángulo junto a cada articulación, con los valores ACTUALES del formulario. */
export function etiquetasAngulos(m: Metodo, s: ReturnType<typeof useErgo.getState>, lado: 'izq' | 'der'): Partial<Record<Punto, string>> {
  if (m === 'rula') {
    const L = s.rula[lado];
    const C = s.rula.comun;
    return { cabeza: `Cuello ${C.cuelloAngulo}°`, hombro: `Brazo ${L.brazoAngulo}°`, codo: `Antebrazo ${L.antebrazoAngulo}°`, muneca: `Muñeca ${L.munecaAngulo}°`, cadera: `Tronco ${C.troncoAngulo}°` };
  }
  if (m === 'reba') {
    const L = s.reba[lado];
    const C = s.reba.comun;
    return { cabeza: `Cuello ${C.cuelloAngulo}°`, hombro: `Brazo ${L.brazoAngulo}°`, codo: `Antebrazo ${L.antebrazoAngulo}°`, muneca: `Muñeca ${L.munecaAngulo}°`, cadera: `Tronco ${C.troncoAngulo}°`, rodilla: `Rodillas ${C.rodillaFlexion}°` };
  }
  return {};
}

export function FotoEsqueleto({ foto, ia, etiquetas, alto = 320 }: { foto: string; ia?: ResultadoIA; etiquetas?: Partial<Record<Punto, string>>; alto?: number }) {
  const pts = ia?.puntos ?? {};
  return (
    <div className="relative inline-block w-fit max-w-full justify-self-start overflow-hidden rounded-xl border border-linea bg-hundido">
      <img src={foto} alt="Fotografía de la tarea evaluada" className="block h-auto max-w-full" style={{ maxHeight: alto }} />
      {ia && Object.keys(pts).length > 1 && (
        <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
            {UNIONES.filter(([a, b]) => pts[a] && pts[b]).map(([a, b]) => (
              <line key={a + b} x1={pts[a]![0]} y1={pts[a]![1]} x2={pts[b]![0]} y2={pts[b]![1]} stroke="var(--esqueleto)" strokeWidth={4} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            ))}
          </svg>
          {Object.entries(pts).map(([k, p]) => (
            <span key={k} className="pointer-events-none absolute" style={{ left: `${p![0] * 100}%`, top: `${p![1] * 100}%` }}>
              <span className="absolute block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ background: 'var(--esqueleto)' }} />
              {etiquetas?.[k as Punto] && (
                <span className="num absolute left-2 whitespace-nowrap rounded-md px-1.5 py-0.5 font-datos text-[11px] font-semibold text-white" style={{ top: k === 'codo' || k === 'cabeza' ? -24 : 6, background: 'rgba(12,18,40,0.82)' }}>
                  {etiquetas[k as Punto]}
                </span>
              )}
            </span>
          ))}
        </>
      )}
    </div>
  );
}

const METODOS: Metodo[] = ['rula', 'reba', 'rosa'];
const RESPONDIDOS: Record<Metodo, string[]> = {
  rula: ['L.actividadA', 'L.cargaA', 'C.actividadB', 'C.cargaB'],
  reba: ['C.carga', 'C.cargaBrusca', 'C.actEstatica', 'C.actRepetitiva', 'L.agarre'],
  rosa: ['tiempoSilla', 'tiempoPantalla', 'tiempoRaton', 'tiempoTeclado'],
};

function Pregunta<T extends string>({ id, label, valor, opciones, onChange }: { id: string; label: string; valor: T; opciones: [T, string][]; onChange: (v: T) => void }) {
  return (
    <label htmlFor={id} className="grid gap-1 text-sm">
      <span className="font-semibold text-tinta2">{label}</span>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value as T)} className="rounded-lg border border-linea bg-superficie px-2.5 py-2">
        {opciones.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FotoIA({ metodo, abrirInforme, irA }: { metodo: Metodo; abrirInforme: (m: Metodo) => void; irA: (m: Metodo) => void }) {
  const estado = useErgo();
  const { foto, fotoArchivo, setFoto, aplicarIA, descartarIA, datos, respuestas, setRespuestas, marcarInforme } = estado;
  const ia = estado.ia[metodo];
  const { s, listo, imagenes } = useSample();
  const [fase, setFase] = useState<'reposo' | 'analizando' | 'listo' | 'error'>('reposo');
  const [progreso, setProgreso] = useState('');
  const [error, setError] = useState('');
  const [noAplica, setNoAplica] = useState<Partial<Record<Metodo, string>>>({});
  const ctl = useRef<AbortController | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const cargar = (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = () => {
      setFoto(String(r.result), f);
      setFase('reposo');
    };
    r.readAsDataURL(f);
  };

  const disponible = listo && !!s && imagenes;
  // Dentro de claude.ai analiza Claude; fuera (archivo descargado) analiza MediaPipe en el navegador.
  const motor: 'claude' | 'mediapipe' | null = !listo ? null : disponible ? 'claude' : window.claude ? null : 'mediapipe';

  const simular = async () => {
    if (!foto) return;
    ctl.current = new AbortController();
    setFase('analizando');
    setError('');
    const fuera: Partial<Record<Metodo, string>> = {};
    try {
      const resultados: ResultadoIA[] = [];
      if (motor === 'claude' && s && fotoArchivo) {
        for (const [i, m] of METODOS.entries()) {
          setProgreso(`Claude analiza la foto para ${m.toUpperCase()} (${i + 1} de 3)…`);
          const st = useErgo.getState();
          const actual = (m === 'rosa' ? st.rosa : st[m]) as unknown as Record<string, unknown>;
          const r = await s.json(construirPrompt(m, datos.tarea), { images: [fotoArchivo], signal: ctl.current.signal });
          resultados.push({ ...validarRespuesta(m, r, actual), motor: 'claude' });
        }
      } else {
        setProgreso('Detectando la postura… La primera vez descarga el modelo (unos 10 MB).');
        const img = new Image();
        img.src = foto;
        await img.decode();
        const pose = await analizarPose(img);
        setProgreso('Calculando RULA, REBA y ROSA…');
        for (const m of METODOS) {
          const st = useErgo.getState();
          const actual = (m === 'rosa' ? st.rosa : st[m]) as unknown as Record<string, unknown>;
          resultados.push(poseAMetodo(m, pose, actual));
          if (m === 'rosa' && !pose.sentado) fuera.rosa = 'La persona está de pie: ROSA evalúa puestos de oficina sentados.';
        }
      }
      for (const r of resultados) {
        aplicarIA({ ...r, valores: aplicarRespuestas(r.metodo, r.valores, respuestas), respondidos: RESPONDIDOS[r.metodo] });
        marcarInforme(r.metodo, !fuera[r.metodo]);
      }
      setNoAplica(fuera);
      setFase('listo');
    } catch (e) {
      const code = (e as { code?: string })?.code ?? (motor === 'mediapipe' ? 'sin_detector' : 'upstream_error');
      if (code === 'cancelled') return setFase('reposo');
      setError(MENSAJE_ERROR[code] ?? 'No se pudo completar el análisis. Intente de nuevo.');
      setFase('error');
    }
  };

  const R = respuestas;
  const setR = (p: Partial<RespuestasRapidas>) => setRespuestas(p);
  const lado = ia?.ladoVisible === 'izq' ? 'izq' : 'der';

  return (
    <section className="tarjeta overflow-hidden">
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="grid content-start gap-4">
          <div>
            <p className="etiqueta">Simulación completa por foto</p>
            <h2 className="text-xl font-bold">Suba una foto y ErgoSim evalúa los tres métodos</h2>
            <p className="text-sm text-tinta2">
              {motor === 'claude'
                ? 'Claude observa la foto y estima todas las respuestas de RULA, REBA y ROSA.'
                : 'La IA detecta el esqueleto en 3D (MediaPipe, en este navegador) y mide ángulos, giros, inclinaciones y abducción.'}{' '}
              Usted responde abajo lo que una foto no muestra. Al terminar tendrá la puntuación y el informe de cada método; puede corregir cualquier valor y el informe indicará qué vino de la IA.
            </p>
          </div>

          {!foto ? (
            <label
              htmlFor="foto-simulacion"
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastrando(false);
                cargar(e.dataTransfer.files?.[0]);
              }}
              className={`grid cursor-pointer place-items-center gap-1 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${arrastrando ? 'border-acento bg-acento-suave' : 'border-linea hover:border-tenue'}`}
            >
              <span className="text-3xl" aria-hidden="true">
                ⤒
              </span>
              <span className="font-semibold">1. Arrastre la foto aquí o pulse para elegirla</span>
              <span className="text-xs text-tenue">JPG o PNG. Mejor de perfil, con todo el cuerpo y la tarea a la vista.</span>
            </label>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">1. Foto cargada.</span>
              <label htmlFor="foto-simulacion" className="cursor-pointer rounded-lg border border-linea px-3 py-1.5 font-medium">
                Cambiar foto
              </label>
              <button type="button" onClick={() => setFoto(null)} className="px-2 py-1.5 text-tenue underline underline-offset-2">
                Quitar
              </button>
            </div>
          )}
          <input id="foto-simulacion" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => cargar(e.target.files?.[0])} />

          <fieldset className="grid gap-3 rounded-xl border border-linea p-3">
            <legend className="px-1 text-sm font-bold">2. Lo que la foto no muestra</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Pregunta id="r-peso" label="Peso o fuerza que maneja" valor={R.peso} onChange={(v) => setR({ peso: v })} opciones={[['menos2', 'Menos de 2 kg'], ['2a5', 'Entre 2 y 5 kg'], ['5a10', 'Entre 5 y 10 kg'], ['mas10', 'Más de 10 kg']]} />
              <Pregunta
                id="r-act"
                label="La postura…"
                valor={R.actividad}
                onChange={(v) => setR({ actividad: v })}
                opciones={[
                  ['ocasional', 'Es ocasional y breve'],
                  ['estatica', 'Se mantiene más de 1 minuto'],
                  ['repetitiva', 'Se repite más de 4 veces/min'],
                  ['ambas', 'Se mantiene y se repite'],
                ]}
              />
              <Pregunta id="r-agarre" label="Agarre de los objetos" valor={R.agarre} onChange={(v) => setR({ agarre: v })} opciones={[['bueno', 'Bueno (asas, buen ajuste)'], ['regular', 'Regular'], ['malo', 'Malo'], ['inaceptable', 'Inaceptable o sin agarre']]} />
              <Pregunta id="r-horas" label="Horas al día frente al computador" valor={R.horasPC} onChange={(v) => setR({ horasPC: v })} opciones={[['menos1', 'Menos de 1 h'], ['1a4', 'Entre 1 y 4 h'], ['mas4', 'Más de 4 h']]} />
            </div>
            <label htmlFor="r-brusca" className="flex items-center gap-2 text-sm">
              <input id="r-brusca" type="checkbox" checked={R.brusca} onChange={(e) => setR({ brusca: e.target.checked })} className="h-4 w-4 accent-[var(--acento)]" />
              Hay golpes o fuerzas bruscas
            </label>
          </fieldset>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!foto || !motor || (motor === 'claude' && !fotoArchivo) || fase === 'analizando'}
              onClick={simular}
              className="rounded-xl bg-acento px-5 py-3 font-bold text-sobre-acento shadow-sm disabled:opacity-50"
            >
              {fase === 'analizando' ? 'Analizando…' : '3. Analizar foto y simular todo'}
            </button>
            {fase === 'analizando' && motor === 'claude' && (
              <button type="button" onClick={() => ctl.current?.abort()} className="rounded-xl border border-linea px-3 py-2 text-sm font-medium">
                Detener
              </button>
            )}
          </div>
          {fase === 'analizando' && <p className="animate-pulse text-sm text-tinta2">{progreso}</p>}
          {fase === 'error' && (
            <p role="alert" className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--r-rojo-fondo)', color: 'var(--r-rojo-tinta)' }}>
              {error}
            </p>
          )}
          {foto && !fotoArchivo && motor === 'claude' && <p className="text-xs text-tenue">Vuelva a elegir la foto para analizarla (la foto no se guarda al recargar la página).</p>}
          {listo && !motor && (
            <p className="rounded-lg bg-hundido px-3 py-2 text-xs text-tinta2">El análisis con IA no está disponible en esta vista (falta el permiso para usar Claude). Puede adjuntar la foto y llenar los datos a mano.</p>
          )}
          {motor === 'mediapipe' && <p className="text-xs text-tenue">Necesita conexión a internet la primera vez. La foto no sale de este equipo.</p>}
        </div>

        <div className="grid min-w-0 content-start justify-items-center gap-3">
          {foto ? (
            <FotoEsqueleto foto={foto} ia={ia} etiquetas={etiquetasAngulos(metodo, estado, lado)} />
          ) : (
            <div className="grid h-full min-h-[200px] w-full place-items-center rounded-xl bg-hundido p-6 text-center text-sm text-tenue">Aquí verá la foto con el esqueleto y los ángulos detectados.</div>
          )}
          {ia && (
            <div className="grid w-full gap-1.5 rounded-xl bg-acento-suave p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">Lo que vio la IA{ia.motor === 'mediapipe' ? ' (MediaPipe)' : ia.motor === 'claude' ? ' (Claude)' : ''}</span>
                <span className="rounded-full bg-superficie px-2 py-0.5 text-xs font-semibold">Confianza {ia.confianza}</span>
              </div>
              <ul className="grid list-disc gap-1 pl-5 text-tinta2">
                {ia.observaciones.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              <button type="button" onClick={() => descartarIA(metodo)} className="justify-self-start text-xs text-tenue underline underline-offset-2">
                Olvidar el análisis de {metodo.toUpperCase()} (los valores se mantienen como manuales)
              </button>
            </div>
          )}
        </div>
      </div>

      {(fase === 'listo' || METODOS.some((m) => estado.ia[m])) && (
        <div className="grid gap-3 border-t border-linea bg-hundido p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold">Resultados de la simulación</h3>
            <span className="text-xs text-tenue">Revise y corrija los valores en cada método; las puntuaciones se actualizan solas.</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {METODOS.map((m) => {
              const inf = construirInforme(m, estado);
              const na = noAplica[m];
              const hecho = !!estado.ia[m];
              return (
                <div key={m} className="tarjeta grid content-start gap-2 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-titulo text-lg font-extrabold">{inf.metodo}</span>
                    {hecho && !na && (
                      <span className="num font-titulo text-2xl font-extrabold" style={{ color: `var(--r-${inf.peor.nivel.color}-tinta)` }}>
                        {inf.peor.final}
                        <span className="text-sm font-medium text-tenue">/{inf.max}</span>
                      </span>
                    )}
                  </div>
                  {!hecho ? (
                    <p className="text-sm text-tenue">Sin simular todavía.</p>
                  ) : na ? (
                    <p className="text-sm text-tinta2">No aplica: {na}</p>
                  ) : (
                    <>
                      <RiskBadge nivel={inf.peor.nivel} />
                      <p className="text-xs text-tinta2">{inf.peor.nivel.actuacion}</p>
                    </>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {hecho && !na && (
                      <button type="button" onClick={() => abrirInforme(m)} className="rounded-lg bg-acento px-3 py-1.5 text-sm font-bold text-sobre-acento">
                        Ver informe
                      </button>
                    )}
                    <button type="button" onClick={() => irA(m)} className="rounded-lg border border-linea bg-superficie px-3 py-1.5 text-sm font-medium">
                      {m === metodo ? 'Revisar abajo' : 'Revisar respuestas'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

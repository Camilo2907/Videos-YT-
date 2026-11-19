import { useEffect, useRef, useState } from 'react';
import { Metodo, useErgo } from '../store';
import { MENSAJE_ERROR, Punto, ResultadoIA, construirPrompt, validarRespuesta } from '../ia';
import { analizarConMediapipe } from '../pose';

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

export function FotoIA({ metodo }: { metodo: Metodo }) {
  const estado = useErgo();
  const { foto, fotoArchivo, setFoto, aplicarIA, descartarIA, datos } = estado;
  const ia = estado.ia[metodo];
  const { s, listo, imagenes } = useSample();
  const [fase, setFase] = useState<'reposo' | 'analizando' | 'error'>('reposo');
  const [error, setError] = useState('');
  const ctl = useRef<AbortController | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const cargar = (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = () => setFoto(String(r.result), f);
    r.readAsDataURL(f);
  };

  const disponible = listo && !!s && imagenes;
  // Dentro de claude.ai analiza Claude; fuera (archivo descargado) analiza MediaPipe en el navegador.
  const motor: 'claude' | 'mediapipe' | null = !listo ? null : disponible ? 'claude' : window.claude ? null : 'mediapipe';

  const analizar = async () => {
    if (!foto) return;
    ctl.current = new AbortController();
    setFase('analizando');
    setError('');
    const actual = (metodo === 'rosa' ? estado.rosa : estado[metodo]) as unknown as Record<string, unknown>;
    try {
      if (motor === 'claude' && s && fotoArchivo) {
        const r = await s.json(construirPrompt(metodo, datos.tarea), { images: [fotoArchivo], signal: ctl.current.signal });
        aplicarIA({ ...validarRespuesta(metodo, r, actual), motor: 'claude' });
      } else {
        const img = new Image();
        img.src = foto;
        await img.decode();
        aplicarIA(await analizarConMediapipe(metodo, img, actual));
      }
      setFase('reposo');
    } catch (e) {
      const code = (e as { code?: string })?.code ?? (motor === 'mediapipe' ? 'sin_detector' : 'upstream_error');
      if (code === 'cancelled') return setFase('reposo');
      setError(MENSAJE_ERROR[code] ?? 'No se pudo completar el análisis. Intente de nuevo.');
      setFase('error');
    }
  };
  const lado = ia?.ladoVisible === 'izq' ? 'izq' : 'der';

  return (
    <section className="tarjeta overflow-hidden">
      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="grid content-start gap-3">
          <div>
            <p className="etiqueta">Evaluación por foto</p>
            <h2 className="text-lg font-bold">Adjunte una foto y la IA llena el formulario</h2>
            <p className="text-sm text-tinta2">
              {motor === 'mediapipe'
                ? `La IA detecta el esqueleto en la foto (MediaPipe, en este mismo navegador), mide los ángulos y selecciona las respuestas de ${metodo.toUpperCase()} que se pueden ver. Revíselas y complete lo demás: el informe indicará qué vino de la IA y qué se corrigió a mano.`
                : `Claude observa la foto, estima los ángulos y las demás respuestas de ${metodo.toUpperCase()} y las selecciona por usted. Revíselas: puede corregir cualquier valor y el informe indicará qué vino de la IA y qué se corrigió a mano.`}
            </p>
          </div>
          {!foto ? (
            <label
              htmlFor={`foto-${metodo}`}
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
              <span className="font-semibold">Arrastre la foto aquí o pulse para elegirla</span>
              <span className="text-xs text-tenue">JPG o PNG. Mejor de perfil, con todo el cuerpo y la tarea a la vista.</span>
            </label>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!motor || (motor === 'claude' && !fotoArchivo) || fase === 'analizando'}
                onClick={analizar}
                className="rounded-xl bg-acento px-4 py-2.5 font-bold text-sobre-acento shadow-sm disabled:opacity-50"
              >
                {fase === 'analizando' ? 'Analizando la foto…' : ia ? 'Volver a analizar' : 'Analizar foto con IA'}
              </button>
              {fase === 'analizando' && motor === 'claude' && (
                <button type="button" onClick={() => ctl.current?.abort()} className="rounded-xl border border-linea px-3 py-2 text-sm font-medium">
                  Detener
                </button>
              )}
              <label htmlFor={`foto-${metodo}`} className="cursor-pointer rounded-xl border border-linea px-3 py-2 text-sm font-medium">
                Cambiar foto
              </label>
              <button type="button" onClick={() => setFoto(null)} className="px-2 py-2 text-sm text-tenue underline underline-offset-2">
                Quitar
              </button>
            </div>
          )}
          <input id={`foto-${metodo}`} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => cargar(e.target.files?.[0])} />
          {fase === 'analizando' && (
            <p className="animate-pulse text-sm text-tinta2">
              {motor === 'claude' ? 'Claude está observando la postura. Suele tardar entre 20 y 60 segundos.' : 'Detectando la postura… La primera vez descarga el modelo (unos 10 MB) y tarda un poco más.'}
            </p>
          )}
          {fase === 'error' && (
            <p role="alert" className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--r-rojo-fondo)', color: 'var(--r-rojo-tinta)' }}>
              {error}
            </p>
          )}
          {foto && !fotoArchivo && motor === 'claude' && <p className="text-xs text-tenue">Vuelva a elegir la foto para analizarla (la foto no se guarda al recargar la página).</p>}
          {listo && !motor && (
            <p className="rounded-lg bg-hundido px-3 py-2 text-xs text-tinta2">
              El análisis con IA no está disponible en esta vista (falta el permiso para usar Claude). Puede adjuntar la foto y llenar los datos a mano.
            </p>
          )}
          {motor === 'mediapipe' && <p className="text-xs text-tenue">Necesita conexión a internet la primera vez. La foto no sale de este equipo.</p>}
          {ia && (
            <div className="grid gap-2 rounded-xl bg-acento-suave p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">Sugerencias de la IA aplicadas{ia.motor === 'mediapipe' ? ' (MediaPipe)' : ia.motor === 'claude' ? ' (Claude)' : ''}</span>
                <span className="rounded-full bg-superficie px-2 py-0.5 text-xs font-semibold">Confianza {ia.confianza}</span>
              </div>
              {ia.observaciones.length > 0 && (
                <ul className="grid list-disc gap-1 pl-5 text-tinta2">
                  {ia.observaciones.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-tinta2">
                Lado visible en la foto: {ia.ladoVisible === 'ambos' ? 'ambos' : ia.ladoVisible === 'izq' ? 'izquierdo' : 'derecho'}
                {ia.ladoVisible !== 'ambos' && metodo !== 'rosa' ? '; el otro lado se copió del visible: revíselo.' : '.'}
              </p>
              <button type="button" onClick={() => descartarIA(metodo)} className="justify-self-start text-xs text-tenue underline underline-offset-2">
                Olvidar el análisis (los valores actuales se mantienen como manuales)
              </button>
            </div>
          )}
        </div>
        <div className="flex min-w-0 items-start justify-center">
          {foto ? (
            <FotoEsqueleto foto={foto} ia={ia} etiquetas={etiquetasAngulos(metodo, estado, lado)} />
          ) : (
            <div className="grid h-full min-h-[180px] w-full place-items-center rounded-xl bg-hundido p-6 text-center text-sm text-tenue">
              Aquí verá la foto con el esqueleto y los ángulos detectados.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

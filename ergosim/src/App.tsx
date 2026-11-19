import { useEffect, useState } from 'react';
import { Metodo, Vista, useErgo } from './store';
import { construirInforme } from './informe';
import { FormRula } from './components/FormRula';
import { FormReba } from './components/FormReba';
import { FormRosa } from './components/FormRosa';
import { Informe } from './components/Informe';
import { VistaComparar, usarComparacion } from './components/Comparar';
import { FotoIA } from './components/FotoIA';

const VISTAS: { v: Vista; texto: string; sub: string }[] = [
  { v: 'rula', texto: 'RULA', sub: 'Miembro superior' },
  { v: 'reba', texto: 'REBA', sub: 'Cuerpo entero' },
  { v: 'rosa', texto: 'ROSA', sub: 'Oficina' },
  { v: 'comparar', texto: 'Comparar', sub: 'Resumen' },
];

const DESCRIPCION: Record<Metodo, string> = {
  rula: 'Evalúa la carga postural del cuello, el tronco y los miembros superiores (McAtamney y Corlett, 1993). Puntuación de 1 a 7.',
  reba: 'Evalúa posturas de cuerpo entero, con carga, agarre y actividad (Hignett y McAtamney, 2000). Puntuación de 1 a 15.',
  rosa: 'Evalúa puestos de oficina con computador: silla, pantalla, teléfono, ratón y teclado (Sonne et al., 2012). Puntuación de 1 a 10.',
};

type Tema = 'sistema' | 'claro' | 'oscuro';
function leerTema(): Tema {
  try {
    const t = localStorage.getItem('ergosim-tema');
    return t === 'claro' || t === 'oscuro' ? t : 'sistema';
  } catch {
    return 'sistema';
  }
}

function DatosEvaluacion() {
  const { datos, setDatos } = useErgo();
  const [abierto, setAbierto] = useState(false);
  const campo = (k: keyof typeof datos, label: string, tipo = 'text') => (
    <label htmlFor={`dato-${k}`} className="grid gap-1 text-sm">
      <span className="font-medium text-tinta2">{label}</span>
      <input
        id={`dato-${k}`}
        type={tipo}
        value={datos[k]}
        placeholder="POR DEFINIR"
        onChange={(e) => setDatos({ [k]: e.target.value })}
        className="rounded-md border border-linea bg-superficie px-2.5 py-1.5"
      />
    </label>
  );
  return (
    <section className="tarjeta">
      <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
        <span>
          <span className="etiqueta block">Datos de la evaluación</span>
          <span className="font-semibold">
            {datos.empresa} · {datos.puesto}
          </span>
          <span className="text-sm text-tenue">
            {' '}
            · {datos.area} · {datos.fecha}
          </span>
        </span>
        <span className="text-sm font-medium text-acento">{abierto ? 'Ocultar' : 'Editar datos'}</span>
      </button>
      {abierto && (
        <div className="grid gap-4 border-t border-linea p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campo('empresa', 'Empresa')}
            {campo('area', 'Área')}
            {campo('puesto', 'Puesto de trabajo')}
            {campo('trabajador', 'Trabajador')}
            {campo('evaluador', 'Evaluador')}
            {campo('fecha', 'Fecha', 'date')}
          </div>
          <label htmlFor="dato-tarea" className="grid gap-1 text-sm">
            <span className="font-medium text-tinta2">Descripción de la tarea</span>
            <textarea id="dato-tarea" rows={3} value={datos.tarea} onChange={(e) => setDatos({ tarea: e.target.value })} className="rounded-md border border-linea bg-superficie px-2.5 py-1.5" />
          </label>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const { vista, setVista, marcarInforme } = useErgo();
  const [informe, setInforme] = useState<Metodo | null>(null);
  const [tema, setTema] = useState<Tema>(leerTema);
  const estado = useErgo();

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'sistema') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light');
    try {
      localStorage.setItem('ergosim-tema', tema);
    } catch {
      /* sin almacenamiento */
    }
  }, [tema]);

  // Vista enlazable por #rula, #reba, #rosa o #comparar
  useEffect(() => {
    const leer = () => {
      const h = location.hash.replace('#', '') as Vista;
      if (VISTAS.some((x) => x.v === h)) setVista(h);
    };
    leer();
    window.addEventListener('hashchange', leer);
    return () => window.removeEventListener('hashchange', leer);
  }, [setVista]);

  const ir = (v: Vista) => {
    setVista(v);
    setInforme(null);
    try {
      history.replaceState(null, '', `#${v}`);
    } catch {
      /* hash no disponible */
    }
  };

  const generar = (m: Metodo) => {
    marcarInforme(m, true);
    setInforme(m);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const metodo = vista === 'comparar' ? null : vista;

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <BarraLateral vista={vista} ir={ir} tema={tema} setTema={setTema} />
      <main className="gutter mx-auto grid w-full max-w-[1240px] content-start gap-5 py-6">
        {metodo && informe === metodo ? (
          <Informe modelo={construirInforme(metodo, estado)} onCerrar={() => setInforme(null)} />
        ) : (
          <>
            {metodo && (
              <div className="grid gap-1">
                <p className="etiqueta">Método {VISTAS.find((x) => x.v === metodo)?.sub.toLowerCase()}</p>
                <h1 className="text-3xl font-extrabold sm:text-4xl">{metodo.toUpperCase()}</h1>
                <p className="max-w-3xl text-tinta2">{DESCRIPCION[metodo]}</p>
              </div>
            )}
            <DatosEvaluacion />
            {metodo && <FotoIA metodo={metodo} />}
            {metodo && <p className="text-xs text-tenue">El formulario abre con un caso de ejemplo. Use una foto o cambie los valores por los de su puesto.</p>}
            {vista === 'rula' && <FormRula onInforme={() => generar('rula')} />}
            {vista === 'reba' && <FormReba onInforme={() => generar('reba')} />}
            {vista === 'rosa' && <FormRosa onInforme={() => generar('rosa')} />}
            {vista === 'comparar' && <VistaComparar />}
          </>
        )}
        <p className="pb-4 text-center text-xs text-tenue">
          Herramienta académica basada en Ergonautas (UPV), INSST y los artículos originales de cada método. No reemplaza la evaluación de un profesional en SST.
        </p>
      </main>
    </div>
  );
}

function BarraLateral({ vista, ir, tema, setTema }: { vista: Vista; ir: (v: Vista) => void; tema: Tema; setTema: (t: Tema) => void }) {
  const comp = usarComparacion();
  return (
    <aside className="no-imprimir sticky top-[env(safe-area-inset-top,0px)] z-20 lg:top-0 lg:h-screen" style={{ background: 'var(--barra)', color: 'var(--barra-tinta)' }}>
      <div className="gutter flex flex-wrap items-center justify-between gap-3 py-3 lg:flex lg:h-full lg:flex-col lg:flex-nowrap lg:items-stretch lg:justify-start lg:gap-6 lg:py-6">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" width={30} height={30} aria-hidden="true">
            <rect width={32} height={32} rx={9} fill="var(--acento)" />
            <circle cx={17} cy={9} r={3.4} fill="#fff" />
            <path d="M16 13 L13 21 L9 24 M13 21 L19 23 L21 28 M15 15 L22 17" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <div className="leading-tight">
            <span className="font-titulo text-xl font-extrabold tracking-tight">ErgoSim</span>
            <span className="hidden text-[11px] lg:block" style={{ color: 'var(--barra-tenue)' }}>
              Evaluación ergonómica de puestos
            </span>
          </div>
        </div>
        <nav aria-label="Métodos" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto lg:order-none lg:mx-0 lg:grid lg:gap-1.5 lg:overflow-visible">
          {VISTAS.map((x) => {
            const c = comp.find((f) => f.clave === x.v);
            const activo = vista === x.v;
            return (
              <button
                key={x.v}
                type="button"
                onClick={() => ir(x.v)}
                aria-current={activo ? 'page' : undefined}
                className="flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors"
                style={{ background: activo ? 'var(--barra-activo)' : 'transparent' }}
              >
                <span className="leading-tight">
                  <span className="block font-bold">{x.texto}</span>
                  <span className="block text-[11px]" style={{ color: 'var(--barra-tenue)' }}>
                    {x.sub}
                  </span>
                </span>
                {c && c.evaluado && (
                  <span className="num rounded-full px-2 py-0.5 font-datos text-xs font-bold" style={{ background: `var(--r-${c.nivel.color})`, color: '#111' }} title={`Riesgo ${c.nivel.riesgo.toLowerCase()}`}>
                    {c.final}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="order-2 flex items-center gap-2 lg:order-none lg:mt-auto lg:grid lg:gap-3">
          <label htmlFor="tema" className="flex items-center gap-2 text-xs" style={{ color: 'var(--barra-tenue)' }}>
            Tema
            <select id="tema" value={tema} onChange={(e) => setTema(e.target.value as Tema)} className="rounded-lg border-0 px-2 py-1 text-sm" style={{ background: 'var(--barra-activo)', color: 'var(--barra-tinta)' }}>
              <option value="sistema">Sistema</option>
              <option value="claro">Claro</option>
              <option value="oscuro">Oscuro</option>
            </select>
          </label>
          <p className="hidden text-[11px] leading-snug lg:block" style={{ color: 'var(--barra-tenue)' }}>
            RULA, REBA y ROSA según Ergonautas (UPV), INSST y los artículos originales.
          </p>
        </div>
      </div>
    </aside>
  );
}

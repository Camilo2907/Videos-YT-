import { useEffect, useState } from 'react';
import { Metodo, Vista, useErgo } from './store';
import { construirInforme } from './informe';
import { FormRula } from './components/FormRula';
import { FormReba } from './components/FormReba';
import { FormRosa } from './components/FormRosa';
import { Informe } from './components/Informe';
import { VistaComparar } from './components/Comparar';

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
  const { datos, setDatos, foto, setFoto } = useErgo();
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
        <span className="text-sm font-medium text-acento">{abierto ? 'Ocultar' : 'Editar datos y foto'}</span>
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
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label htmlFor="dato-foto" className="cursor-pointer rounded-lg border border-linea px-3 py-1.5 font-medium hover:border-tenue">
              {foto ? 'Cambiar foto de la tarea' : 'Agregar foto de la tarea'}
            </label>
            <input
              id="dato-foto"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => setFoto(String(r.result));
                r.readAsDataURL(f);
              }}
            />
            {foto && (
              <button type="button" onClick={() => setFoto(null)} className="text-tenue underline underline-offset-2">
                Quitar foto
              </button>
            )}
            <span className="text-xs text-tenue">La foto se queda en este navegador y aparece en el informe.</span>
          </div>
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
    <div className="min-h-full">
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 border-b border-linea bg-superficie/95 backdrop-blur">
        <div className="gutter mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-titulo text-xl font-extrabold tracking-tight">
              Ergo<span className="text-acento">Sim</span>
            </span>
            <span className="hidden text-xs text-tenue sm:inline">Evaluación ergonómica de puestos de trabajo</span>
          </div>
          <nav aria-label="Métodos" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto">
            {VISTAS.map((x) => (
              <button
                key={x.v}
                type="button"
                onClick={() => ir(x.v)}
                aria-current={vista === x.v ? 'page' : undefined}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-left leading-tight transition-colors ${vista === x.v ? 'bg-acento text-sobre-acento' : 'hover:bg-hundido'}`}
              >
                <span className="block text-sm font-semibold">{x.texto}</span>
                <span className={`block text-[11px] ${vista === x.v ? 'opacity-80' : 'text-tenue'}`}>{x.sub}</span>
              </button>
            ))}
          </nav>
          <label htmlFor="tema" className="order-2 flex items-center gap-1.5 text-xs text-tenue sm:order-3">
            Tema
            <select id="tema" value={tema} onChange={(e) => setTema(e.target.value as Tema)} className="rounded-md border border-linea bg-superficie px-1.5 py-1 text-tinta">
              <option value="sistema">Sistema</option>
              <option value="claro">Claro</option>
              <option value="oscuro">Oscuro</option>
            </select>
          </label>
        </div>
      </header>

      <main className="gutter mx-auto grid max-w-7xl gap-5 py-6">
        {metodo && informe === metodo ? (
          <Informe modelo={construirInforme(metodo, estado)} onCerrar={() => setInforme(null)} />
        ) : (
          <>
            <DatosEvaluacion />
            {metodo && (
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="max-w-2xl">
                  <h1 className="text-2xl font-bold">{metodo.toUpperCase()}</h1>
                  <p className="text-tinta2">{DESCRIPCION[metodo]}</p>
                </div>
                <span className="rounded-full border border-linea px-3 py-1 text-xs text-tenue">Abre con un caso de ejemplo: cambie los valores por los de su puesto</span>
              </div>
            )}
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

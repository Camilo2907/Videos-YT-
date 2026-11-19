// Recomendaciones de control a partir de los factores con desviación.
// Son medidas genéricas de buena práctica ergonómica, en el orden de la jerarquía de controles
// (técnicas > administrativas > EPP). El plazo y el responsable son SUGERENCIAS que el
// profesional en SST debe validar en cada caso.
import type { ColorRiesgo, Factor } from './methods/common';

export type TipoControl = 'Técnica' | 'Administrativa' | 'EPP';
export type Prioridad = 'Alta' | 'Media' | 'Baja';

export interface Recomendacion {
  id: string;
  ambito: string;
  titulo: string;
  detalle: string;
  tipo: TipoControl;
  prioridad: Prioridad;
  responsable: string;
  plazo: string;
}

const ORDEN_PRIORIDAD: Record<Prioridad, number> = { Alta: 0, Media: 1, Baja: 2 };
const ORDEN_TIPO: Record<TipoControl, number> = { Técnica: 0, Administrativa: 1, EPP: 2 };

function prioridadDe(f: { total: number; maximo: number; base?: number }, color: ColorRiesgo): Prioridad {
  const r = f.maximo > 1 ? (f.total - 1) / (f.maximo - 1) : 0;
  let p: Prioridad = r >= 0.6 ? 'Alta' : r >= 0.3 ? 'Media' : 'Baja';
  if ((color === 'rojo' || color === 'naranja') && p === 'Baja') p = 'Media';
  if (color === 'verde' && p === 'Alta') p = 'Media';
  return p;
}

export function plazoSugerido(p: Prioridad, color: ColorRiesgo): string {
  if (p === 'Alta') return color === 'rojo' ? 'Inmediato (esta semana)' : 'Corto plazo (≤ 1 mes)';
  if (p === 'Media') return 'Mediano plazo (≤ 3 meses)';
  return 'Seguimiento en la próxima evaluación';
}

type Regla = Omit<Recomendacion, 'id' | 'prioridad' | 'plazo' | 'ambito'> & { cuando: (f: Factor) => boolean };

const tieneMod = (f: Factor, texto: string) => f.modificadores.some((m) => m.nombre.toLowerCase().includes(texto) && m.valor > 0);
const desviado = (f: Factor) => f.base > 1;

const SST = 'Responsable de SST';
const ING = 'Ingeniería / Mantenimiento';
const COMPRAS = 'Compras con aval de SST';
const JEFE = 'Jefe de área y SST';
const TRAB = 'Trabajador con apoyo de SST';

/** Reglas para métodos posturales (RULA y REBA), por clave de factor. */
const REGLAS_POSTURA: Record<string, Regla[]> = {
  brazo: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Acercar y bajar la zona de trabajo', detalle: 'Ubicar piezas, controles y herramientas frente al cuerpo y por debajo de la altura del hombro, para que el brazo trabaje cerca del tronco (menos de 45° de flexión).', responsable: ING },
    { cuando: (f) => tieneMod(f, 'hombro') || tieneMod(f, 'abducido'), tipo: 'Técnica', titulo: 'Eliminar la elevación del hombro', detalle: 'Ajustar la altura de la superficie, usar plataformas o soportes regulables para que los hombros permanezcan relajados y el brazo no se separe del cuerpo.', responsable: ING },
  ],
  antebrazo: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Ajustar la altura de trabajo al codo', detalle: 'Regular la superficie para que el antebrazo trabaje entre 60° y 100° de flexión (aprox. a la altura del codo).', responsable: ING },
    { cuando: (f) => tieneMod(f, 'línea media'), tipo: 'Técnica', titulo: 'Trabajar frente al cuerpo', detalle: 'Reorganizar el puesto para evitar que el antebrazo cruce la línea media o trabaje hacia un lado.', responsable: TRAB },
  ],
  muneca: [
    { cuando: (f) => f.clave === 'muneca' && desviado(f), tipo: 'Técnica', titulo: 'Mantener la muñeca recta', detalle: 'Usar herramientas con mango adaptado a la orientación de la tarea (recto o en pistola) y reorientar la pieza para evitar flexión o extensión de la muñeca.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'desviación') || tieneMod(f, 'torsión') || (f.clave === 'giro' && f.total > 1), tipo: 'Técnica', titulo: 'Evitar giros y desviaciones de la muñeca', detalle: 'Emplear soportes giratorios o fijaciones que presenten la pieza en la orientación correcta y reduzcan la pronación o supinación extrema.', responsable: ING },
  ],
  giro: [],
  cuello: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Llevar la tarea a la altura de los ojos', detalle: 'Elevar o inclinar la superficie de trabajo, o reubicar pantallas y documentos, para evitar flexión de cuello mayor de 20° o extensión.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'rotad') || tieneMod(f, 'inclinación') || tieneMod(f, 'torsión'), tipo: 'Técnica', titulo: 'Ubicar la información frente al trabajador', detalle: 'Colocar los elementos de consulta de frente para evitar girar o inclinar la cabeza de forma mantenida.', responsable: TRAB },
  ],
  tronco: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Eliminar la flexión del tronco', detalle: 'Elevar la tarea o el objeto con mesas regulables, elevadores o volteadores para trabajar con la espalda recta.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'rotad') || tieneMod(f, 'inclinación') || tieneMod(f, 'torsión'), tipo: 'Administrativa', titulo: 'Reorganizar para evitar giros del tronco', detalle: 'Ubicar origen y destino de los materiales en el mismo frente y entrenar el giro con los pies en lugar de la cintura.', responsable: JEFE },
  ],
  piernas: [
    { cuando: (f) => f.base > 1, tipo: 'Técnica', titulo: 'Asegurar un apoyo estable de los pies', detalle: 'Garantizar superficie nivelada, espacio libre para los pies y apoyo bilateral; si se trabaja de pie mucho tiempo, valorar tapete antifatiga o apoyo isquiático.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'rodillas'), tipo: 'Técnica', titulo: 'Evitar trabajar en cuclillas', detalle: 'Elevar la tarea o usar bancos bajos para no mantener las rodillas flexionadas.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'más de 60'), tipo: 'EPP', titulo: 'Rodilleras cuando no se pueda evitar', detalle: 'Si la postura de rodillas o en cuclillas no puede eliminarse, suministrar rodilleras acolchadas como medida complementaria, nunca como única medida.', responsable: SST },
  ],
};

REGLAS_POSTURA.giro = [REGLAS_POSTURA.muneca[1]];

/** Reglas para ROSA, por clave de elemento. */
const REGLAS_ROSA: Record<string, Regla[]> = {
  altura: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Ajustar la altura del asiento', detalle: 'Regular la silla para que las rodillas queden a unos 90° y los pies apoyados en el suelo; si no alcanzan, suministrar reposapiés.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'espacio'), tipo: 'Técnica', titulo: 'Liberar el espacio bajo la mesa', detalle: 'Retirar cajas, CPU u objetos que impidan acomodar las piernas.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'no regulable'), tipo: 'Técnica', titulo: 'Silla con altura regulable', detalle: 'Reemplazar la silla por una con altura regulable de forma sencilla.', responsable: COMPRAS },
  ],
  profundidad: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Ajustar la profundidad del asiento', detalle: 'Dejar unos 8 cm (5 a 9 cm) entre el borde del asiento y la parte trasera de la rodilla, regulando el asiento o el respaldo.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'no regulable'), tipo: 'Técnica', titulo: 'Asiento con profundidad regulable', detalle: 'Al renovar la silla, preferir modelos con asiento deslizable.', responsable: COMPRAS },
  ],
  reposabrazos: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Ajustar los reposabrazos a la altura del codo', detalle: 'Colocarlos de forma que los codos queden apoyados a 90° y los hombros relajados. Si la silla no los tiene, valorar un modelo con reposabrazos regulables.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'dura') || tieneMod(f, 'separados') || tieneMod(f, 'no regulables'), tipo: 'Técnica', titulo: 'Reposabrazos acolchados y regulables', detalle: 'Sustituir o forrar los reposabrazos duros o dañados y preferir modelos regulables en altura y anchura.', responsable: COMPRAS },
  ],
  respaldo: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Ajustar el apoyo lumbar y la inclinación', detalle: 'Situar el apoyo lumbar en la parte baja de la espalda y reclinar el respaldo entre 95° y 110°; usar siempre el respaldo.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'superficie'), tipo: 'Técnica', titulo: 'Corregir la altura de la mesa', detalle: 'Bajar la superficie de trabajo o subir la silla con reposapiés para que los hombros no queden encogidos.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'no regulable'), tipo: 'Técnica', titulo: 'Respaldo regulable', detalle: 'Al renovar la silla, exigir respaldo con ajuste de inclinación y apoyo lumbar.', responsable: COMPRAS },
  ],
  pantalla: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Colocar la pantalla a la altura de los ojos', detalle: 'Ajustar con un soporte o brazo para monitor de modo que el borde superior quede a la altura de los ojos o un poco por debajo.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'girar'), tipo: 'Técnica', titulo: 'Centrar la pantalla', detalle: 'Ubicar la pantalla principal justo frente al trabajador.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, '75 cm'), tipo: 'Técnica', titulo: 'Acercar la pantalla', detalle: 'Situarla entre 40 y 75 cm de los ojos (aprox. a la distancia del brazo).', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'reflejos'), tipo: 'Técnica', titulo: 'Eliminar reflejos', detalle: 'Orientar la pantalla perpendicular a las ventanas y controlar la luz con cortinas o persianas.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'atril'), tipo: 'Técnica', titulo: 'Suministrar atril portadocumentos', detalle: 'Ubicar los documentos junto a la pantalla y a la misma altura.', responsable: COMPRAS },
  ],
  telefono: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Acercar el teléfono', detalle: 'Ubicarlo a 30 cm o menos del trabajador.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'cuello y hombro') || tieneMod(f, 'manos libres'), tipo: 'Técnica', titulo: 'Diadema o manos libres', detalle: 'Suministrar diadema o activar manos libres para no sujetar el teléfono entre cuello y hombro.', responsable: COMPRAS },
  ],
  raton: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Alinear el ratón con el hombro', detalle: 'Colocarlo junto al teclado; un teclado compacto sin bloque numérico reduce el alcance.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'pinza'), tipo: 'Técnica', titulo: 'Ratón de tamaño adecuado', detalle: 'Usar un ratón que llene la mano y permita agarrarlo sin pinza.', responsable: COMPRAS },
    { cuando: (f) => tieneMod(f, 'altura'), tipo: 'Técnica', titulo: 'Ratón y teclado en la misma superficie', detalle: 'Ubicarlos a la misma altura.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'reposamanos'), tipo: 'Técnica', titulo: 'Eliminar puntos de presión', detalle: 'Retirar bordes duros bajo la muñeca o usar apoyos blandos.', responsable: TRAB },
  ],
  teclado: [
    { cuando: desviado, tipo: 'Técnica', titulo: 'Mantener las muñecas rectas al teclear', detalle: 'Recoger las patas del teclado o usar teclado plano para evitar extensión mayor de 15°.', responsable: TRAB },
    { cuando: (f) => tieneMod(f, 'desviadas'), tipo: 'Administrativa', titulo: 'Técnica de digitación', detalle: 'Capacitar en técnica de digitación sin desviar las muñecas; valorar teclado partido si persiste.', responsable: SST },
    { cuando: (f) => tieneMod(f, 'alto'), tipo: 'Técnica', titulo: 'Bajar el teclado', detalle: 'Usar bandeja o ajustar mesa y silla para que los hombros queden relajados.', responsable: ING },
    { cuando: (f) => tieneMod(f, 'cabeza'), tipo: 'Administrativa', titulo: 'Reubicar objetos de uso frecuente', detalle: 'Guardar lo que se usa a menudo entre la cintura y el hombro.', responsable: JEFE },
    { cuando: (f) => tieneMod(f, 'plataforma'), tipo: 'Técnica', titulo: 'Bandeja de teclado regulable', detalle: 'Instalar una bandeja o soporte regulable.', responsable: COMPRAS },
  ],
};

export interface ExtrasPostura {
  carga?: number; // puntos de carga/fuerza
  cargaMax?: number;
  agarre?: number;
  actividad?: number;
  repetitiva?: boolean;
}

export function generarRecomendaciones(
  metodo: 'RULA' | 'REBA' | 'ROSA',
  factores: Factor[],
  color: ColorRiesgo,
  extras: ExtrasPostura = {},
): Recomendacion[] {
  const reglas = metodo === 'ROSA' ? REGLAS_ROSA : REGLAS_POSTURA;
  const out: Recomendacion[] = [];
  const vistos = new Set<string>();
  for (const f of factores) {
    for (const r of reglas[f.clave] ?? []) {
      if (!r.cuando(f) || vistos.has(r.titulo)) continue;
      vistos.add(r.titulo);
      const prioridad = prioridadDe(f, color);
      const { cuando: _c, ...resto } = r;
      out.push({ ...resto, id: `${f.clave}-${out.length}`, ambito: f.nombre, prioridad, plazo: plazoSugerido(prioridad, color) });
    }
  }
  const add = (ambito: string, rel: { total: number; maximo: number }, r: Omit<Recomendacion, 'id' | 'prioridad' | 'plazo' | 'ambito'>) => {
    const prioridad = prioridadDe(rel, color);
    out.push({ ...r, id: `${ambito}-${out.length}`, ambito, prioridad, plazo: plazoSugerido(prioridad, color) });
  };
  if (metodo !== 'ROSA') {
    if (extras.carga && extras.carga > 0) {
      const rel = { total: 1 + extras.carga, maximo: 1 + (extras.cargaMax ?? 3) };
      add('Carga o fuerza', rel, { tipo: 'Técnica', titulo: 'Ayudas mecánicas para la carga', detalle: 'Usar carretillas, mesas elevadoras, polipastos o manipuladores para reducir el peso o la fuerza que se aplica con el cuerpo.', responsable: ING });
      add('Carga o fuerza', rel, { tipo: 'Administrativa', titulo: 'Capacitación y trabajo en equipo', detalle: 'Capacitar en manipulación manual de cargas y organizar el levantamiento entre dos personas cuando el peso lo exija.', responsable: JEFE });
    }
    if (extras.agarre && extras.agarre >= 1) {
      const rel = { total: 1 + extras.agarre, maximo: 4 };
      add('Agarre', rel, { tipo: 'Técnica', titulo: 'Mejorar el agarre de los objetos', detalle: 'Usar contenedores con asas o agarraderas de tamaño adecuado.', responsable: COMPRAS });
      add('Agarre', rel, { tipo: 'EPP', titulo: 'Guantes de talla adecuada con buen agarre', detalle: 'Si el objeto no puede modificarse, suministrar guantes que mejoren la fricción sin restar destreza.', responsable: SST });
    }
    if (extras.actividad && extras.actividad > 0) {
      add('Actividad muscular', { total: 1 + extras.actividad, maximo: 4 }, { tipo: 'Administrativa', titulo: 'Pausas activas y rotación de tareas', detalle: 'Programar pausas cortas y frecuentes y alternar tareas que usen otros grupos musculares, sobre todo si la postura se mantiene más de un minuto o se repite más de 4 veces por minuto.', responsable: JEFE });
    }
  } else {
    const largo = factores.filter((f) => f.modificadores.some((m) => m.nombre === 'Tiempo de uso' && m.valor > 0));
    if (largo.length) {
      add('Tiempo de uso', { total: 2, maximo: 3 }, { tipo: 'Administrativa', titulo: 'Pausas y alternancia de tareas', detalle: `Interrumpir el uso continuado de ${largo.map((f) => f.nombre.toLowerCase()).join(', ')} con pausas breves al menos cada hora y alternar con tareas lejos del computador.`, responsable: JEFE });
    }
  }
  if (color !== 'verde') {
    add('General', { total: 1, maximo: 3 }, { tipo: 'Administrativa', titulo: 'Capacitar y volver a evaluar', detalle: 'Formar al trabajador en higiene postural y ajuste del puesto, y repetir la evaluación después de implementar los cambios para comprobar su efecto.', responsable: SST });
  }
  return out.sort((a, b) => ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad] || ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo]);
}

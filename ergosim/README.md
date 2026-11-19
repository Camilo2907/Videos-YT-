# ErgoSim

Simulador web para evaluar puestos de trabajo con los métodos **RULA**, **REBA** y **ROSA**.
Muestra la puntuación en vivo, genera un informe con gráficas, colores de riesgo y recomendaciones priorizadas.

> **Advertencia.** ErgoSim es una herramienta **académica**. No reemplaza la evaluación de un profesional
> en Seguridad y Salud en el Trabajo (SST).

## Ejecutar

```bash
npm install
npm run dev          # abre la app en http://localhost:5173
npm test             # pruebas de los métodos (Vitest)
npm run build:pagina # genera pagina/ergosim.html (una sola página para publicar)
```

## Qué hay

- `src/methods/` — cálculo puro de RULA, REBA y ROSA, con las tablas de `docs/fuentes.md`.
- `src/methods/metodos.test.ts` — pruebas con los ejemplos resueltos de NTP 601, NTP 1173, Sonne et al. (2012) y Ergonomics Plus.
- `src/recomendaciones.ts` — medidas técnicas, administrativas y de EPP según los factores con desviación.
- `src/informe.ts` y `src/components/Informe.tsx` — informe con portada, resultados, análisis por segmento,
  recomendaciones, conclusiones, limitaciones, referencias APA y anexos con gráficas.
- `docs/fuentes.md` — origen de cada tabla y factor, diferencias entre fuentes y decisiones.

## Estado

Hecho: cálculo y pruebas, formularios paso a paso con lado izquierdo y derecho, figura humana que cambia con los
ángulos, informe con gráficas y tablas resaltadas, comparación entre métodos, modo claro y oscuro.

Pendiente: detección de pose con MediaPipe y análisis por IA, video, exportación a PDF y Word,
gestión de varias evaluaciones con IndexedDB, comparación antes y después, mapa de calor de puestos.

## Limitaciones

- Los métodos valoran una postura puntual; los resultados dependen de la observación del evaluador.
- Los plazos y responsables de las recomendaciones son sugerencias que debe validar el profesional en SST.

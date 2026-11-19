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
npm run build:pagina  # genera pagina/ergosim.html (página para publicar en claude.ai)
npm run build:archivo # genera pagina/ErgoSim.html (archivo único para compartir: Teams, correo, USB)
```

## Qué hay

- `src/methods/` — cálculo puro de RULA, REBA y ROSA, con las tablas de `docs/fuentes.md`.
- `src/methods/metodos.test.ts` — pruebas con los ejemplos resueltos de NTP 601, NTP 1173, Sonne et al. (2012) y Ergonomics Plus.
- `src/recomendaciones.ts` — medidas técnicas, administrativas y de EPP según los factores con desviación.
- `src/informe.ts` y `src/components/Informe.tsx` — informe con portada, resultados, análisis por segmento,
  recomendaciones, conclusiones, limitaciones, referencias APA y anexos con gráficas.
- `docs/fuentes.md` — origen de cada tabla y factor, diferencias entre fuentes y decisiones.

## Estado

Hecho: cálculo y pruebas, formularios paso a paso con lado izquierdo y derecho, personaje ilustrado y animado que
cambia con los ángulos (y escena de oficina en ROSA), informe con gráficas explicadas y tablas resaltadas,
comparación entre métodos, modo claro y oscuro, y **evaluación por foto con IA**: en la página publicada en claude.ai
la foto se envía a Claude (capacidad `sample` con imágenes), que estima todas las respuestas; el evaluador las revisa
y el informe marca cada factor como «IA», «IA, corregido a mano» o «Manual».

**Simulación completa por foto:** con un botón se analiza la foto y se calculan RULA, REBA y ROSA a la vez, con su
informe. En el archivo descargado (fuera de claude.ai) la foto se analiza con **MediaPipe Pose Landmarker** en el propio
navegador, usando sus coordenadas 3D: ángulos, giros e inclinaciones de tronco y cuello, abducción y elevación del
hombro, antebrazo fuera de la línea media, muñeca y su desviación, rodillas, posición sentada y apoyo de pies. Lo que
una foto no muestra (peso, frecuencia, agarre, horas frente al computador) se responde en cuatro preguntas rápidas.
Los umbrales propios de la herramienta están marcados con «UMBRAL» en `src/pose.ts`. El informe puede imprimirse o guardarse en PDF.

Pendiente: video, exportación a PDF y Word,
gestión de varias evaluaciones con IndexedDB, comparación antes y después, mapa de calor de puestos.

## Limitaciones

- La IA **estima** ángulos y situaciones a partir de una sola foto en 2D: puede equivocarse con la perspectiva,
  partes ocultas, la carga o la frecuencia. Los valores deben revisarse antes de generar el informe.

- Los métodos valoran una postura puntual; los resultados dependen de la observación del evaluador.
- Los plazos y responsables de las recomendaciones son sugerencias que debe validar el profesional en SST.

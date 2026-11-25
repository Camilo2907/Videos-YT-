# Generador de escenas del Editor (HyperFrames)

Arma las escenas de un video a partir del guion visual de Visuales y de la voz con sus tiempos. Se usó en Los Nefilim.

- `alinear.py`: busca en la voz el momento exacto en que empieza cada escena del guion visual.
- `escenas.py`: el plan de cada escena (imagen o clip de fondo y gráficos encima). Es lo que se reescribe en cada video.
- `generar.py`: convierte el plan en composiciones de HyperFrames usando las plantillas (cita, palabra en hebreo o griego, mapa,
  línea de tiempo, escala, árbol, sello, contador, ficha, libro, columnas, mini gancho, título de capítulo, tarjeta final…).
- `comun.css` y `comun.js`: estilo del canal (paleta y letras) y efectos (partículas, profundidad, contador).
- Tarjeta final: usa `assets/logo.png` (logo del canal «Raíces de la Fe», dorado sobre transparente) si está en el proyecto.
- `indice.py`: arma el video principal con la voz, la música y los efectos de sonido.
- `capas.py`: separa una pintura en fondo y figura para el efecto de profundidad (recorte a mano con polígonos).
- `mapa.py` y `mapa_vistas.py`: mapa base de la región con datos de Natural Earth (dominio público).

Las imágenes, clips, voces y videos no van al repositorio: viven en `trabajo/` dentro de la sesión del Editor.

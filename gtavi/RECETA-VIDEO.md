# Receta: video de la ruleta + plantilla "5 pasos"

> **Estado:** el paso 5 ya tiene el canal de Camilo: **xNeonVice**, @xNeonVice, banner y logo de `gtavi/marca/`.
> El **link de la bio** es provisional: `linktr.ee/xNeonVice` (solo de ejemplo, no está registrado). Sirve para videos
> de prueba; antes de **publicar** se cambia por el link real de las reglas del sorteo. La plantilla real que genera `generar.py` es de 5 pasos.

Receta exacta para que cualquier agente haga los videos **iguales** al aprobado por Camilo
(`gtavi/2026-11-24-ruleta-gta/`, aprobado el 24-11-2026: primer video de xNeonVice, con el fondo nuevo). Sigue los pasos en orden y no cambies valores sin
permiso de Camilo.

**Resultado:** MP4 vertical 1080×1920, 30 fps, H.264 + AAC. Dura lo que dure el video de Camilo más 14 s de
plantilla. Ejemplo: 8,8 + 14 = 22,8 s. Lo ideal según Camilo es grabar unos 15 s para llegar a 28–30 s.

---

## 0. Antes de empezar

1. Lee `gtavi/CLAUDE.md`, `.claude/agents/editor-gtavi.md` y esta receta.
2. Herramientas: los plugins HyperFrames y watch (en `.claude/settings.json`), ffmpeg y Python 3.
   - El CLI de HyperFrames se llama así (en esta receta: `HF`):
     ```bash
     HF="node $(ls -d ~/.claude/plugins/cache/hyperframes/hyperframes/*/ | tail -1)skills/hyperframes/scripts/plugin-cli.mjs"
     ```
   - Antes de tocar composiciones, carga la skill `hyperframes`.
3. Archivos base, que **no se modifican** salvo que Camilo pida cambiar la plantilla:
   - `gtavi/pasos-cta/generar.py`: genera la plantilla de 5 pasos y la raíz del video.
   - `gtavi/pasos-cta/assets/`: banner, avatar y efectos de sonido (licencia Pixabay, ver `sfx/CREDITS.md`).
   - `gtavi/herramientas/sonido_ruleta.py`: sonido de la ruleta sincronizado.
   - `gtavi/ejemplo-ruleta/`: proyecto de ejemplo completo. Cópialo como punto de partida.
   - `trabajo/gtavi/ruleta.html`: la ruleta que graba Camilo (Vice Spin Wheel). **No se sube** porque trae el logo y la
     portada de GTA VI y el logo de PayPal. Si no está en la sesión, pídesela a Camilo. Sirve para revisar casillas,
     colores y sonidos: 8 casillas, giro de 5,6 s que frena así: 1 − (1 − p)⁴.

## 1. Revisar el video de Camilo

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,color_transfer -of compact VIDEO.MOV
```
- Los iPhone graban **vertical con rotación** (salen como 1920×1080 con `rotation=-90`) y en **HDR**
  (`color_transfer=arib-std-b67`). El paso 3 corrige las dos cosas.
- Mira cuadros sueltos (4 por segundo) para ubicar: cuándo toca SPIN, cuándo se frena la ruleta y en qué segundo
  aparece la pantalla del resultado (`T_RESULTADO`). En el ejemplo: toque ≈0,65 s, frena ≈5,4 s y resultado 6,27 s.
- **No se corta el giro.** El video de Camilo va completo, sin quitar ni un cuadro del giro.

## 2. Crear el proyecto nuevo

```bash
cd gtavi
NUEVO=AAAA-MM-DD-nombre
cp -r ejemplo-ruleta $NUEVO
rm -rf $NUEVO/.hyperframes $NUEVO/assets/footage/*
```
El `.gitignore` del proyecto ya excluye `assets/footage/`: los videos de Camilo **no se suben** (el repo es público).

## 3. Pasar el video a vertical y SDR (colores normales)

```bash
ffmpeg -y -i VIDEO.MOV -map 0:v:0 -an \
  -vf "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,scale=1080:1920,eq=saturation=1.12:contrast=1.04" \
  -c:v libx264 -crf 17 -preset medium -g 15 -movflags +faststart $NUEVO/assets/footage/ruleta.mp4
```
- Si el video **no es HDR**, usa solo `-vf "scale=1080:1920,eq=saturation=1.12:contrast=1.04"`.
- **Grabación de pantalla del iPhone** (1290×2796, 60 fps, SDR): arriba salen la barra del iPhone y la del visor de
  archivos. Recorta la página a 9:16 y baja a 30 fps:
  `-vf "crop=1290:2293:0:370,scale=1080:1920,fps=30,eq=saturation=1.12:contrast=1.04,format=yuv420p"`.
  Revisa un cuadro antes: el `crop` empieza justo debajo de esas barras (y=370 en el video del 24-11).
- **Espera antes del toque y pantalla del premio al final:** se recortan para que el toque quede en ~0,65 s y el
  video termine ~2,5 s después del resultado (`-ss INICIO -t DURACION`). El giro entre el toque y el resultado **no se
  toca**. Para hallar el toque y el resultado, mide la diferencia entre cuadros: el giro arranca con un salto de ~8 y
  la pantalla del premio con uno de ~37.
- El audio original no se usa: es casi silencio y el sonido de la ruleta se genera aparte (paso 5).

## 3b. Desenfocar arte oficial y textos de marca (OPCIONAL, solo si Camilo lo pide)

**Por defecto NO se hace:** Camilo lo probó el 24-11-2026 y prefirió el video **sin desenfocar**. Este paso queda por
si algún día lo pide. Lo que hace: desenfoca el arte oficial (personajes del fondo, logo y
portadas de GTA VI, tarjeta de PayPal) y los botones "CLAIM" y "UNLOCK MORE ATTEMPTS". La ruleta, sus casillas, la
flecha, el cartel "SUPER WIN · WIN GTA VI" y la línea "Giveaway rules at the link…" quedan **nítidos**.

1. Copia `desenfoque.json` del último proyecto y mide en `ruleta.mp4` (con una cuadrícula sobre un cuadro): centro de la
   ruleta, ángulo de cada imagen de premio en el cuadro 0 (0° = derecha, sentido horario), la flecha, el cartel del
   premio y la línea de reglas. `t_resultado` = segundo de la pantalla del premio.
2. Ajusta el giro con las imágenes de premio (deja `t0` y `e_grados` aproximados: `e_grados` ≡ giro final medido, más
   vueltas completas) y copia el mejor resultado al JSON:
   ```bash
   python3 -I ../herramientas/desenfocar_marcas.py ajustar desenfoque.json assets/footage/ruleta.mp4
   ```
3. Aplica y **revisa una hoja de cuadros** (las manchas tienen que seguir a las imágenes mientras gira):
   ```bash
   mv assets/footage/ruleta.mp4 assets/footage/ruleta-original.mp4
   python3 -I ../herramientas/desenfocar_marcas.py video desenfoque.json assets/footage/ruleta-original.mp4 assets/footage/ruleta.mp4
   ```
4. El fondo del paso 4 pasa por `desenfocar_marcas.py cuadro` antes del `gblur` (ver el proyecto del 24-11).

## 4. Fondo de la plantilla (último cuadro, nítido y desenfoque suave)

Sale del **video original** de Camilo (no de `ruleta.mp4`) para que no pierda calidad. `T_FONDO` = segundo del original
que corresponde al final del recorte, menos 0,1 s (en el ejemplo del 24-11: 1,133 + 8,8 − 0,1 = 9,833). Usa el mismo
`crop` del paso 3 (si no hubo recorte, quítalo):
```bash
ffmpeg -y -ss T_FONDO -i VIDEO.MOV -frames:v 1 \
  -vf "crop=1290:2293:0:370,scale=1080:1920:flags=lanczos,eq=saturation=1.12:contrast=1.04,gblur=sigma=8:steps=3,eq=brightness=-0.06:saturation=0.95" \
  -q:v 1 -qmin 1 $NUEVO/assets/footage/fondo-final.jpg
```
Camilo pidió (24-11-2026) el fondo **de mejor calidad y un poco más borroso**: desenfoque gaussiano `sigma=8` (antes
`boxblur=6`) y JPG a máxima calidad. No lo oscurezcas más de -0.06 (pidió que no se vea oscuro).

## 5. Sonido de la ruleta (el mismo de su HTML, sincronizado)

El sonido sale del HTML original de la ruleta: un "tic" por casilla (onda cuadrada de 1100 Hz) y una fanfarria de
5 notas al ganar. **No uses clicks de librería**, porque Camilo los rechazó.

1. Ubica la punta de la flecha en `ruleta.mp4` (ya vertical) y toma un punto unos 50 px debajo, dentro de las
   casillas. En el ejemplo fue x=445, y=725.
2. Detecta los cambios de casilla:
   ```bash
   python3 -I herramientas/sonido_ruleta.py detectar $NUEVO/assets/footage/ruleta.mp4 445 725
   ```
3. Toma los **dos últimos tics lentos** antes de que se detenga (en el ejemplo, 4,167 y 4,633). Ignora los que salen
   después del resultado: son la animación de la pantalla de premio. Ajusta el modelo con el momento del resultado:
   ```bash
   python3 -I herramientas/sonido_ruleta.py ajustar 6.25 4.167 4.633
   # -> T0=0.650  E=64.42  R0=0.448
   ```
   Comprueba que los "tic modelo" coincidan con los cambios detectados de la zona lenta (±0,03 s).
4. Genera el audio. Argumentos: duración del video, T0, E, R0, el segundo de la fanfarria (= `T_RESULTADO`) y el
   resultado: `gana` si cae en WIN GTA VI o BONUS (5 notas) o `pierde` si cae en SO CLOSE, TRY AGAIN, ALMOST o
   SPIN AGAIN (2 notas graves). Sin ese último dato, es `gana`:
   ```bash
   python3 -I herramientas/sonido_ruleta.py generar $NUEVO/assets/sfx/ruleta-giro.wav 8.8 0.65 64.5 0.45 6.27 gana
   ```

## 6. Configurar `intro.json`

```json
{
 "duration": 8.8,
 "endbg": "assets/footage/fondo-final.jpg",
 "sfx": [
  ["i-ruleta", "ruleta-giro.wav", 0.0, 0.9, 8.8],
  ["i-wh", "whoosh", 8.5, 0.6, 0.57]
 ]
}
```
- `duration` = duración exacta del video de Camilo.
- El `whoosh` va 0,3 s antes del final del video. Para otra duración, usa `duration - 0.3`.
- Nada más: **sin** golpe grave ni brillo en el resultado (Camilo quiere solo el sonido de su ruleta).

## 7. Ajustar `compositions/intro.html`

Copia el del ejemplo y cambia **solo los tiempos** según el video nuevo:

| Qué | Valor en el ejemplo | Regla |
|---|---|---|
| `data-duration` del `<video>` | 8.8 | = duración del video |
| Golpe de cámara (`#intro-cam` scale 1.12, 0,45 s, `power3.out`) | 6.3 | = `T_RESULTADO` |
| Destello blanco (0,75 → 0 en 0,45 s, con `immediateRender: false`) | 6.32 | resultado + 0,02 |
| Sale "CAN I LAND GTA VI?" (blur 10 px, 0,15 s) | 6.3 | = resultado |
| Entra "IT LANDED ON" (blur 8 → 0, 0,22 s) | 6.38 | resultado + 0,08 |
| Entra "GTA VI!" (scale 0,3 → 1, `back.out(2.2)`, 0,5 s) | 6.46 | resultado + 0,16 |
| Salida: cámara a 1,3 y negro a **0,3** (0,35 s) | 8.45 | duración − 0,35 |

Diseño fijo del intro:
- Arriba, sobre un degradado oscuro de 560 px: **"CAN I LAND GTA VI?"** (Archivo Black 80 px, "GTA VI?" con
  degradado rosa → dorado). Se ve **desde el cuadro 0**, porque es el gancho.
- Al caer: **"IT LANDED ON GTA VI!"** en el mismo lugar.
- **Sin letreros abajo.** Camilo pidió quitar "WATCH WHERE IT STOPS", "ONE TAKE · NO CUTS" y la franja de la nota.
- Cambia el texto del gancho solo si el premio es otro, y siempre en inglés.
- Si la ruleta **no** cae en un premio, no pongas "IT LANDED ON GTA VI!": pídele a Camilo el texto (en inglés) y
  nunca muestres un premio que no salió.

## 8. Generar y revisar

```bash
cd gtavi/$NUEVO
python3 -I ../pasos-cta/generar.py . intro.json   # crea index.html y las escenas s1..s5 a continuación del video
$HF check --json          # debe dar "ok": true (el aviso line_unread de #s3-typed es normal)
$HF snapshot --at 0,3,T_RESULTADO+0.1,DURACION+1,DURACION+12 --json
```
Mira las imágenes antes de renderizar: el gancho tiene que verse en el cuadro 0, el destello y "GTA VI!" en el
resultado, y la plantilla legible sobre el fondo.

## 9. Render y entrega

```bash
mkdir -p ../../trabajo/gtavi
$HF render --quality delivery --output ../../trabajo/gtavi/render.mp4
ffmpeg -y -i ../../trabajo/gtavi/render.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k \
  -movflags +faststart ../../trabajo/gtavi/AAAA-MM-DD-nombre.mp4
```
- Volumen: -14 LUFS, el estándar de redes.
- El MP4 queda en `trabajo/gtavi/` y **no se sube** al repositorio (los `.mp4` están en `.gitignore`): se entrega en el chat.
- Commit y push del proyecto (sin footage) a la rama `agente/editor-gtavi`. Muéstrale el MP4 a Camilo en el chat y resume en 2 o 3 líneas qué hiciste.

---

## La plantilla "5 pasos" (no se toca)

Dura 14 s y la genera `generar.py`. Ya está aprobada por Camilo (v3):

| Paso | Dura | Qué pasa |
|---|---|---|
| 1 · LIKE THE VIDEO | 2,0 s | El toque presiona el pulgar, se pinta rosa-dorado y salen chispas de diamante |
| 2 · SUBSCRIBE | 2,2 s | "SUBSCRIBE" pasa a "SUBSCRIBED ✓" y luego se toca la campanita, que se mueve y se pone dorada |
| 3 · DROP A COMMENT | 3,0 s | Se escribe "This channel is fire 💎", se envía y aparece publicado |
| 4 · SHARE IT | 2,2 s | Se abre el menú de compartir y se toca "Copy link" |
| 5 · VISIT THE CHANNEL | 4,6 s | Captura tipo YouTube en modo oscuro (banner y logo de xNeonVice, @xNeonVice y el link provisional `linktr.ee/xNeonVice`). Se toca **Subscribe** → "🔔 Subscribed" y luego **el link de la bio**, que abre una página con barra de carga |

- Números: Montserrat 900 cursiva, relleno cromado y sombra rosa desplazada. Entran girando en 3D con rebote, un aro
  dorado, dos contornos (azul y rosa) y un brillo que los cruza.
- Arriba siempre: "Giveaway rules at the link · Not affiliated with Rockstar Games" y la barra de 5 segmentos.
- Títulos con sombra para que se lean sobre el fondo claro.

## Reglas que no se rompen

- **No se ponen cifras falsas** de suscriptores ni de videos en la captura del canal (no se inventan). Se deja sin esa línea o con los números reales.
- No se pone la línea "CLAIM NOW" de la bio en la captura.
- El giro va completo, sin cortes que cambien el resultado.
- Los textos que se publican van en **inglés**.
- Los videos de Camilo y su cara o datos no se suben al repositorio.
- En la ruleta salen "CLAIM", "Unlock more attempts" y arte oficial de GTA VI. Camilo lo sabe y decidió dejarlos
  nítidos (24-11-2026); el paso 3b (desenfocar) se usa solo si él lo pide.

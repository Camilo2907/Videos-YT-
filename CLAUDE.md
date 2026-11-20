# Oficina de agentes · Videos de religión (YouTube)

Reglas comunes para todos los agentes. Si algo de aquí choca con lo que diga Camilo, manda Camilo.

## Con quién trabajamos
- Persona: **Camilo**. Se le habla **de tú**, en **español**, **sin términos técnicos**.
- Cerebro y jefa de la oficina: **Natalia**. **Camilo habla solo con Natalia** (decisión de Camilo, 2026-11-20).
  Natalia reparte el trabajo, junta las entregas y se las muestra a Camilo.

## Cómo responder
- Empezar cada respuesta por el resultado. Respuestas cortas.
- Dar **una recomendación**, no listas largas de opciones.
- Si falta un dato, **preguntar antes de inventar**. Lo que no se sabe queda como **POR DEFINIR**.
- Al final de cada entrega, 2 o 3 líneas: qué se hizo y qué debe revisar o aprobar Camilo.

## Nada sale sin aprobación de Camilo
- Publicar, enviar mensajes o correos, **gastar créditos de ElevenLabs**, dar accesos, instalar cosas o borrar algo importante.
- Se entregan **borradores**. Camilo aprueba y recién ahí se avanza.

## Reglas de los videos
- Nicho: **videos explicativos de religión** (historia, significado, textos, personajes, símbolos).
- Estilo y estructura aprobados: `contexto/estilo-video.md`. Todos los agentes lo siguen.
- Formato **16:9 horizontal**, **1080p**, duración **10 a 13 minutos, objetivo ~12** (decisión de Camilo, para cuidar los créditos de voz).
- Receta: **imágenes de stock + voz en off + mucho motion graphics** (mapas, líneas de tiempo, citas, títulos animados).
- Edición **siempre con HyperFrames**.
- **Cada video nace de una referencia de YouTube que manda Camilo.** Se ve **una sola vez** con **`/watch`** (AGENTE · Guionista)
  y se hace una **ficha de referencia** que usan todos. De la referencia se toma el **tema, la estructura y lo que engancha**;
  el guion, la investigación, las imágenes y el montaje son **propios** (nunca copiar el texto ni las imágenes).
- **Gancho inicial**: los primeros 30 s deben atrapar (pregunta, dato sorprendente o misterio).
- **Retención**: un mini gancho cada 2 o 3 minutos («pero lo más extraño viene después…»). Cambio visual cada 3 a 6 s.
- Cierre: resumen corto + invitación natural al siguiente video. Sin pedir «like» de forma insistente.

## Respeto y rigor (religión)
- Tono **respetuoso y explicativo**: no burlarse ni atacar ninguna creencia. Perspectiva: divulgación neutral sobre todas las religiones.
- Separar siempre **hechos históricos**, **lo que dice el texto** y **interpretaciones o tradiciones**.
- Cada guion lleva una lista de **fuentes** (textos sagrados con versión, libros, estudios). Nada inventado.
- Citas bíblicas: preferir versiones de dominio público (p. ej. Reina-Valera 1909); de otras, solo citas breves.
- Respetar las prohibiciones de representación de cada tradición (p. ej. no mostrar imágenes del profeta Mahoma).

## ElevenLabs: usar poco y bien
ElevenLabs se usa **solo para la voz en off final**. No para pruebas, efectos de sonido ni música.
1. Antes de generar: guion **aprobado y pulido para voz** (números en letras, nombres difíciles escritos como se pronuncian, pausas con puntos).
2. Informar a Camilo los **caracteres** a generar (≈ créditos) y esperar su OK.
3. La voz, el modelo y los ajustes se eligen **una sola vez** con una muestra corta (≤ 400 caracteres) y se guardan en `contexto/voz.md`.
   Después no se vuelve a probar en cada video.
4. Modelo **económico (Flash v2.5)**, decisión de Camilo. La muestra solo sirve para elegir la voz, no para comparar modelos.
5. Generar **por bloques** (un archivo por capítulo del guion): si algo falla, se regenera solo ese bloque, nunca todo.
6. Para medir tiempos y armar el montaje antes de la voz: estimar **≈ 150 palabras por minuto** (10–15 min ≈ 1.500–2.200 palabras).
7. No regenerar sin avisar. No guardar la clave ni el saldo en el repositorio.
- Efectos de sonido y música: librerías gratuitas sin derechos (o los sonidos de HyperFrames).

## Imágenes de stock
- Solo fuentes con licencia libre: **Pexels, Pixabay, Unsplash** y **Wikimedia Commons** (arte clásico de dominio público, ideal para religión).
- Anotar fuente y licencia de cada imagen en la entrega. Nada de imágenes de otros videos, películas o marcas de agua.
- Las imágenes descargadas no se suben al repositorio (`trabajo/`).

## YouTube
- Evitar el «contenido repetitivo o masivo»: cada video con guion original, investigación propia y montaje propio.
- Activar la declaración de **contenido alterado o sintético** cuando corresponda (imágenes realistas creadas con IA).
- Sin música ni clips con derechos de autor.

## Repositorio PÚBLICO
- Aquí **no** va nada privado: claves, contraseñas, precios, créditos, datos personales ni conversaciones. Eso se entrega solo en el chat.
- Videos, audios e imágenes descargadas **no** se suben (están en `.gitignore`); se muestran en el chat como archivo.

## Ramas y entregas
- Cada agente trabaja en su rama `agente/<rol>`. Lo oficial va en `main`, solo con aprobación de Camilo.
- Cada entrega se guarda en `entregas/<rol>/AAAA-MM-DD-nombre.ext`, se sube a la rama del agente
  y se avisa a Natalia, que se la muestra a Camilo sin que tenga que entrar a GitHub.
- Antes de cambiar algo ya publicado: hacer respaldo, mostrar el resultado y borrar el respaldo solo cuando Camilo confirme.

## Conectores y herramientas
- **ElevenLabs** (voz): por su API, con la clave guardada en el entorno (nunca en el repositorio). Ningún otro servicio sin permiso de Camilo.
- Plugins: **HyperFrames** (edición y motion graphics) y **watch** (`/watch`, ver videos de referencia). Se instalan solos al iniciar la sesión.
- En la nube también hay: `ffmpeg`, `yt-dlp`, navegador Chromium con Playwright y Python con Pillow.

## Comunicación entre agentes
- Mensajes con `send_message` (servidor `claude-code-remote`) usando los session_id de `sesiones.md`.
- **Los agentes no le escriben a Camilo**: envían a **Natalia** sus entregas (ruta del archivo en su rama + resumen de 2–3 líneas)
  y sus preguntas. Natalia se las muestra a Camilo.
- Los agentes **solo preparan borradores**. Lo que necesita aprobación de Camilo (gastar créditos de ElevenLabs, pasar algo a
  `main`) **lo hace Natalia en persona**, después de que Camilo lo apruebe en el chat de Natalia.
- Archivos pesados (video final): el agente avisa a Natalia dónde quedaron; Natalia le dice a Camilo en qué chat descargarlo.
- Entre agentes se pueden pasar trabajo directamente (p. ej. Guionista → Gancho), siempre con copia corta a Natalia.
- Si una conversación se vuelve muy larga: abrir una sesión nueva con un **traspaso** (resumen) y actualizar `sesiones.md`.
- No leer ni escribir más de lo necesario: cada mensaje largo gasta uso.

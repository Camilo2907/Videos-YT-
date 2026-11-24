# Carpeta gtavi · Videos de GTA VI (aparte de la oficina de religión)

Esta carpeta es un trabajo **separado** de los videos de religión. Aquí mandan estas reglas sobre las de `../CLAUDE.md`
(formato, nicho, idioma del contenido y entregas). Lo demás de `../CLAUDE.md` sigue igual: hablar con Camilo de tú,
en español sencillo, preguntar antes de inventar, nada sale sin su aprobación y el repositorio es público.

- **Agente:** `editor-gtavi` (`.claude/agents/editor-gtavi.md`). Receta obligatoria: `gtavi/RECETA-VIDEO.md`.
- **Formato:** vertical **9:16, 1080×1920**, 30 fps, Shorts / TikTok / Reels. No aplica el 16:9 de 10–13 min.
- **Idioma:** todo lo que sale en el video va en **inglés**. Lo interno, en español.
- **Sin ElevenLabs:** estos videos no llevan voz en off. El sonido sale de `herramientas/sonido_ruleta.py` y de
  `pasos-cta/assets/sfx/` (licencia Pixabay).
- **Canal:** **xNeonVice** (@xNeonVice), aprobado por Camilo el 24-11-2026. Banner y logo propios en `gtavi/marca/`
  (`marca.html` es la fuente; `node gtavi/marca/exportar.js` los vuelve a sacar). El **link de la bio** sigue
  **POR DEFINIR** (en la plantilla sale "your-link.com"): se pide a Camilo, nunca se inventa.
- **Nunca se suben:** los videos de Camilo (`assets/footage/`), su cara, datos de participantes ni los MP4 finales.
  Los renders quedan en `trabajo/gtavi/` y se entregan en el chat.
- **Sorteo real** (lo confirmó Camilo): los premios que muestra la ruleta (GTA VI y el bono de PayPal €10) se entregan de
  verdad y las reglas están en el link. Cada video lleva "Giveaway rules at the link". El video muestra lo que salió
  en la ruleta, sin cortes ni trucos.
- La ruleta (`trabajo/gtavi/ruleta.html`) **no se sube** porque trae logos y arte oficial. Si falta, se le pide a Camilo.
- Siempre va "Not affiliated with Rockstar Games". Sin cifras falsas, sin ganadores inventados y sin decir que el
  espectador ya ganó.
- Rama: `agente/editor-gtavi`.

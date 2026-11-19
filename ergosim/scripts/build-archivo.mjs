// Genera un único archivo HTML autónomo (pagina/ErgoSim.html) para compartir (Teams, correo, USB).
// Se abre con doble clic en Chrome o Edge. Sin claude.ai, el análisis de fotos usa MediaPipe en el navegador.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const assets = join('dist', 'assets');
const archivos = readdirSync(assets);
const js = readFileSync(join(assets, archivos.find((f) => f.endsWith('.js'))), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(join(assets, archivos.find((f) => f.endsWith('.css'))), 'utf8').replace(/<\/style/gi, '<\\/style');
const fuentes = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';

const html = `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>ErgoSim</title>
<meta name="description" content="Simulador académico de evaluación ergonómica con RULA, REBA y ROSA.">
<link rel="stylesheet" href="${fuentes}">
<style>html,body{margin:0;height:100%}img{max-width:100%}[hidden]{display:none!important}${css}</style>
</head>
<body>
<div id="root"></div>
<noscript>ErgoSim necesita JavaScript. Abra este archivo en Chrome o Edge.</noscript>
<script type="module">${js}</script>
</body>
</html>
`;
mkdirSync('pagina', { recursive: true });
writeFileSync(join('pagina', 'ErgoSim.html'), html);
console.log(`pagina/ErgoSim.html · ${(html.length / 1024).toFixed(0)} KB`);

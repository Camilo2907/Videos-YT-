// Empaqueta la compilación de Vite en una sola página (pagina/ergosim.html) para publicarla.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const assets = join('dist', 'assets');
const archivos = readdirSync(assets);
const js = readFileSync(join(assets, archivos.find((f) => f.endsWith('.js'))), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(join(assets, archivos.find((f) => f.endsWith('.css'))), 'utf8').replace(/<\/style/gi, '<\\/style');
const fuentes = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;500;600;700&display=swap';

const html = `<title>ErgoSim</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="${fuentes}">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
mkdirSync('pagina', { recursive: true });
writeFileSync(join('pagina', 'ergosim.html'), html);
console.log(`pagina/ergosim.html · ${(html.length / 1024).toFixed(0)} KB`);

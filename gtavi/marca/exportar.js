// Exporta la marca del canal a PNG/JPG: node gtavi/marca/exportar.js
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const dir = __dirname;
  const browser = await chromium.launch();
  const piezas = [['banner', 2560, 1440], ['logo', 800, 800]];
  for (const [id, w, h] of piezas) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(dir, 'marca.html') + '?pieza=' + id);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.locator('#' + id).screenshot({ path: path.join(dir, id + '.png') });
    await page.close();
    console.log('listo', id);
  }
  await browser.close();
})();

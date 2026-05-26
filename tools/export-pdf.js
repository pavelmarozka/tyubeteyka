const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 8765;
const ROOT = path.resolve(__dirname, '..');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let filePath = path.join(ROOT, url === '/' ? 'index.html' : url);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found: ' + filePath);
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

async function showOnly(page, pageId) {
    const otherId = pageId === 'page1' ? 'page2' : 'page1';
    await page.evaluate(({ otherId, pageId }) => {
        const other = document.getElementById(otherId);
        const self = document.getElementById(pageId);
        const breaks = document.querySelectorAll('.page-break');
        if (other) other.style.display = 'none';
        if (self) self.style.display = 'block';
        breaks.forEach(b => b.style.display = 'none');
    }, { otherId, pageId });
}

async function restoreAll(page) {
    await page.evaluate(() => {
        document.querySelectorAll('.page-break, .menu-page').forEach(el => {
            el.style.display = '';
        });
    });
}

server.listen(PORT, async () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1600, height: 1200 },
        deviceScaleFactor: 3,
    });
    const page = await context.newPage();

    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.menu-section');
    await page.waitForTimeout(1000);

    // Проверка реального DPR
    const dpr = await page.evaluate(() => window.devicePixelRatio);
    console.log(`Device pixel ratio: ${dpr}`);

    console.log('Генерация PDF (422×299 мм)...');
    for (const id of ['page1', 'page2']) {
        await showOnly(page, id);
        await page.waitForTimeout(500);

        await page.pdf({
            path: path.join(ROOT, `menu-${id}.pdf`),
            width: '422mm',
            height: '299mm',
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            printBackground: true,
            preferCSSPageSize: true,
        });

        console.log(`  ✓ menu-${id}.pdf`);
        await restoreAll(page);
    }

    console.log('Генерация PNG (300 DPI)...');
    for (const id of ['page1', 'page2']) {
        await showOnly(page, id);
        await page.waitForTimeout(500);

        const el = await page.$(`#${id}`);
        const box = await el.boundingBox();

        // Расширяем viewport, чтобы элемент влез целиком
        await page.setViewportSize({
            width: Math.ceil(box.width * 3),
            height: Math.ceil(box.height * 3),
        });
        await page.waitForTimeout(300);

        // Перечитываем box после изменения viewport
        const box2 = await el.boundingBox();

        await el.screenshot({
            path: path.join(ROOT, `menu-${id}.png`),
        });

        const w = Math.round(box2.width * 3);
        const h = Math.round(box2.height * 3);
        const dpi = Math.round(w / (422 / 25.4));
        console.log(`  ✓ menu-${id}.png  (${w}×${h} px @ ${dpi} DPI)`);
        await restoreAll(page);
    }

    await browser.close();
    server.close();
    console.log('Готово!');
});

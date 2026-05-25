# Ресторанное меню для печати А3

## 📋 Описание проекта
Этот проект представляет собой веб-версию ресторанного меню, оптимизированную для печати на бумаге формата А3 (420×297 мм) с безопасной зоной **422×299 мм**. Проект создан с использованием современных веб-технологий и подготовлен для экспорта в высококачественные PDF/PNG/JPG/TIFF файлы с разрешением **300 dpi**.

### Особенности:
- ✅ Двусторонняя печать (лицевая и оборотная стороны)
- ✅ Трёхколоночная сетка для компактного размещения
- ✅ Данные отделены от вёрстки (JSON файл)
- ✅ Автоматическая загрузка меню из `menu.json`
- ✅ Чистые цвета (#000, #fff) для последующей конвертации в CMYK

## 🚀 Быстрый старт
1. Откройте файл `index.html` в любом современном браузере (Chrome, Firefox, Safari)
2. Меню автоматически загрузится из файла `menu.json`

## 📁 Структура проекта
```
├── README.md          # Этот файл
├── index.html         # Основная HTML-страница
├── style.css          # Стили CSS
├── menu.json          # Данные меню (редактируемый файл)
```

## ✏️ Как редактировать меню
### Способ 1: Через JSON (рекомендуется)
Откройте файл `menu.json` и измените данные:

```json
{
  "категория": "Кофе",
  "меню": [
    {
      "наименование": "Эспрессо",
      "объём": "30 мл",
      "цена": 180,
      "примечание": ""
    }
  ]
}
```

**Чтобы изменить цену:** найдите нужное блюдо и измените значение `"цена"`
**Чтобы добавить блюдо:** скопируйте объект `{...}` и добавьте в массив `"меню"`
**Чтобы удалить блюдо:** удалите соответствующий объект из массива

### Способ 2: Настройка распределения по страницам
В файле `index.html` найдите переменную `CATEGORIES_PER_PAGE`:

```javascript
const CATEGORIES_PER_PAGE = {
    page1: 8,  // Первые 8 категорий на лицевой стороне
    page2: 100 // Остальные на оборотной
};
```

Измените `page1` чтобы настроить количество категорий на первой странице.

## 🎨 Технологии
- **HTML5** — семантическая разметка
- **CSS3** — стилизация
- **CSS Grid** — трёхколоночная сетка
- **Flexbox** — выравнивание элементов
- **JavaScript (ES6+)** — загрузка и рендеринг данных
- **Google Fonts** — шрифты PT Serif и Roboto Slab (с поддержкой кириллицы)

## 📤 Экспорт в PDF
### Через браузер (Chrome/Edge):
1. Откройте `index.html` в браузере
2. Нажмите **Ctrl+P** (Windows) или **Cmd+P** (Mac)
3. В диалоге печати выберите:
   - **Принтер:** "Сохранить как PDF"
   - **Размер бумаги:** Пользовательский
   - **Ширина:** 422 мм
   - **Высота:** 299 мм
   - **Масштаб:** 100%
   - **Поля:** Нет (или "Минимальные")
   - **Фон:** Включить ("Печатать фон")
4. Нажмите "Сохранить"

### Используя Puppeteer (Node.js):
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/index.html', {waitUntil: 'networkidle2'});
  
  await page.pdf({
    path: 'menu.pdf',
    width: '422mm',
    height: '299mm',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
  });
  
  await browser.close();
})();
```

Установка Puppeteer: `npm install puppeteer`

### Используя WeasyPrint (Python):
```bash
weasyprint index.html menu.pdf -p --media-type print
```

Установка: `pip install weasyprint`

## 🖼️ Экспорт в изображения (PNG/JPG/TIFF) с 300 DPI
### Важно для 300 DPI:
- 422 мм × 300 dpi / 25.4 ≈ **4984 пикселей** (ширина)
- 299 мм × 300 dpi / 25.4 ≈ **3531 пикселей** (высота)

### Через Puppeteer:
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Установка viewport для 300 DPI
  const widthPx = Math.round(422 * 300 / 25.4);
  const heightPx = Math.round(299 * 300 / 25.4);
  
  await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: 1 });
  await page.goto('file://' + __dirname + '/index.html', {waitUntil: 'networkidle2'});
  
  // Скриншот первой страницы
  await page.screenshot({ 
    path: 'menu-page1.png', 
    clip: { x: 0, y: 0, width: widthPx, height: heightPx }
  });
  
  // Переход на вторую страницу и скриншот
  await page.evaluate(() => window.scrollTo(0, heightPx));
  await page.screenshot({ 
    path: 'menu-page2.png', 
    clip: { x: 0, y: heightPx, width: widthPx, height: heightPx }
  });
  
  await browser.close();
})();
```

### Через ImageMagick из PDF:
```bash
# Конвертация PDF в PNG с 300 DPI
convert -density 300 menu.pdf menu.png

# Конвертация в JPG (качество 95%)
convert -density 300 menu.pdf -quality 95 menu.jpg

# Конвертация в TIFF
convert -density 300 menu.pdf menu.tiff
```

### Через Chrome DevTools (альтернативный способ):
1. Откройте `index.html` в Chrome
2. Откройте DevTools (**F12**)
3. Включите Device Toolbar (**Ctrl+Shift+M**)
4. Установите размеры: **4984 × 3531 px**
5. Нажмите три точки → "Run command" → введите "Screenshot"
6. Выберите "Capture full size screenshot"

## ⚙️ Технические требования типографии
| Параметр | Значение |
|----------|----------|
| Формат бумаги | А3 (420×297 мм) |
| Безопасная зона | 422×299 мм |
| Bleed (вылеты) | +3–5 мм (добавляется отдельно) |
| Разрешение | 300 DPI |
| Цветовая модель | RGB → CMYK (конвертация после экспорта) |
| Шрифты | Векторные (не растровые) |
| Фоновые изображения | Минимум 300 DPI при 100% масштабе |

## 🎯 Важные замечания
1. **Векторный текст:** Все тексты остаются векторными при экспорте в PDF — идеально для печати
2. **Цвета:** Используются чистые #000 (чёрный) и #fff (белый) — легко конвертируются в CMYK
3. **Шрифты:** Подключаются через Google Fonts с полной поддержкой кириллицы
4. **Bleed:** В макете не включён — добавьте 3–5 мм при подготовке к печати
5. **Проверка:** Перед отправкой в типографию обязательно проверьте PDF в режиме предпечатной подготовки

## 🔧 Troubleshooting
### Меню не загружается
- Убедитесь, что `menu.json` находится в той же папке, что и `index.html`
- Проверьте консоль браузера (F12) на наличие ошибок
- Убедитесь, что JSON файл имеет правильную структуру

### Неправильное распределение по страницам
- Измените значение `CATEGORIES_PER_PAGE.page1` в `index.html`

### Проблемы с печатью
- Убедитесь, что в настройках печати включена опция "Печатать фон"
- Проверьте, что масштаб установлен на 100%
- Убедитесь, что поля установлены на "Нет" или "Минимальные"

## 📞 Поддержка
При возникновении вопросов обращайтесь к документации по CSS Grid и Flexbox:
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

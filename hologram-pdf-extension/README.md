# Hologram PDF Extension

Локальная установка:

1. Откройте `chrome://extensions`.
2. Включите режим разработчика.
3. Нажмите `Загрузить распакованное расширение`.
4. Выберите папку `hologram-pdf-extension`.
5. Откройте `http://localhost:3000` или `http://127.0.0.1:3000` с приложением Transmission Hologram Lab.
6. Нажмите иконку расширения и скачайте PDF.

Расширение получает данные из приложения через скрытый JSON-блок `#hologram-export-data` и резервно через `window.__HOLOGRAM_DATA__`.

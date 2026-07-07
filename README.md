# Tea Timer

Веб-приложение для таймера заваривания чая с анимированным фоном и двухфазным отсчётом.

## Демо

https://tea-timer-trae.vercel.app

## Возможности

- **Двухфазный таймер** — brewing (заваривание) + cooling (остывание)
- **Мульти-таймер** — запуск нескольких таймеров одновременно
- **Metaballs анимация** — шейдерный фон зоны активного таймера (зелёный при заваривании, красный при остывании)
- **Звуковое уведомление** — сигнал при завершении фазы заваривания
- **Светлая/тёмная тема** — автоматическое переключение по системным настройкам
- **Glass morphism** — современный визуальный стиль
- **История завершённых** — аккордеон с возможностью удаления

## Стек

- [Next.js](https://nextjs.org/) 16.2.4
- [React](https://react.dev/) 19.2.4
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [@paper-design/shaders-react](https://github.com/nickytonline/paper-design-shaders-react) — Metaballs анимация

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка
npm run build

# Запуск production-версии
npm start
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
app/
├── components/
│   └── TeaTimer.tsx    # Основной компонент таймера
├── globals.css         # CSS-переменные и темы
├── layout.tsx          # Root layout
└── page.tsx            # Главная страница
public/
└── notification.mp3    # Звук уведомления
```

## Лицензия

MIT

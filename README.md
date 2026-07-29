# Tea Timer

A web-based tea brewing timer with a clean phase-aware background and two-phase countdown.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## Demo

https://tea-timer-trae.vercel.app

## Features

- **Two-phase timer** — brewing (steeping) + cooling (post-brew countdown)
- **Multi-timer** — run multiple timers simultaneously
- **Phase-aware background** — a clean background on the active timer (green during brewing, red during cooling)
- **Sound notification** — audio alert when brewing phase completes
- **Light/Dark theme** — automatic switching based on system preferences
- **Glass morphism** — modern translucent UI design
- **Completed history** — expandable accordion with delete option

## Tech Stack

- [Next.js](https://nextjs.org/) 16.2.4
- [React](https://react.dev/) 19.2.4
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── components/
│   └── TeaTimer.tsx    # Main timer component
├── globals.css         # CSS variables and themes
├── layout.tsx          # Root layout
└── page.tsx            # Home page
public/
└── notification.mp3    # Notification sound
```

## License

[MIT](./LICENSE)

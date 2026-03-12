# ALumiEye User App

A desktop-first market intelligence and trading insights dashboard for ALumiEye.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Zustand
- React Router
- Lucide React

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Push this repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Vercel will auto-detect the Vite framework
4. Deploy

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
src/
├── api/          # API layer (bootstrap)
├── components/   # Reusable UI components
├── data/        # Mock data
├── lib/         # Utilities
├── pages/       # Route pages
├── store/       # Zustand store
└── types/       # TypeScript types
```

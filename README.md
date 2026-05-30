# Agamana Area Converter

A mobile-first Progressive Web App for Karnataka land area conversions and plot calculations. Works fully offline after first load.

## Features
- Convert between Acre, Gunta, Sq Ft, Sq Yard, Sq Meter, Hectare, Cent (real-time, no button)
- Tap any result to reverse-convert from it
- Plot Calculator (Length x Width in Feet / Yard / Meter)
- Quick Reference tables
- Recent calculations (last 10, saved locally)
- Popular conversions
- Searchable unit dropdown
- WhatsApp share + copy to clipboard
- Indian number formatting
- English / Kannada toggle
- Light / Dark mode (follows device, remembers your choice)
- Installable PWA with offline support

## Tech
React + Vite + vite-plugin-pwa. No backend, no database, no API.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Deploy

### Vercel
1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
4. Deploy. (`vercel.json` already handles SPA routing.)

You can also run `npx vercel` from this folder.

### Netlify
Build command `npm run build`, publish directory `dist`.

### GitHub Pages
If serving from a sub-path, set `base: "/<repo-name>/"` in `vite.config.js`, then deploy the `dist/` folder.

## Important
This is a complete project. Do NOT deploy a single `.jsx` file on its own — a website needs the `index.html` entry point and a build step, which is what produced the earlier `404: NOT_FOUND`.

# Modo Truck Pricing Calculator

A mobile-first PWA for estimating client parcel pricing from truck capacity, operating costs, and lightweight or heavy parcel details.

## Features

- Truck height, length, breadth, and maximum weight inputs.
- Fuel, driver wage, and miscellaneous cost capture.
- Lightweight parcel mode with dimensional validation and volume pricing.
- Heavy parcel mode with weight-capacity validation and weight pricing.
- Offline app shell caching through a service worker.
- Installable PWA metadata in `public/manifest.webmanifest`.

## Pricing formula

The estimate is calculated as:

```text
operational cost + 18% markup + variable parcel charge
```

The variable parcel charge is `$12 per cubic foot` for lightweight parcels and `$2.50 per kg` for heavy parcels. These constants live in `src/calculations.ts`.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Build

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview
```

## Test

```bash
npm test
```

## Install the PWA

1. Run `npm run build` and serve the app with `npm run preview` or another HTTPS-capable static host.
2. Open the app in a PWA-capable browser.
3. Use the browser install prompt or the address-bar install icon.
4. Relaunch from the installed app shortcut; the cached app shell remains available offline.

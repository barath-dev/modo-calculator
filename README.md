# Modo Truck Pricing Calculator

A mobile-first PWA for estimating client parcel freight in rupees per cubic foot, based on truck volume, route operating costs, and a desired revenue target for a fully loaded truck.

## Features

- Truck length, breadth, and height inputs, in feet.
- Truck hire cost, loading & unloading cost, and desired revenue (for a full truck) capture in Indian rupees.
- Parcel dimension inputs with a feet/inches unit switch (parcels are often measured in inches) and capacity validation against the truck's volume.
- Offline app shell caching through a service worker.
- Installable PWA metadata in `public/manifest.webmanifest`.

## Pricing formula

The estimate is calculated as:

```text
rate per cu ft = desired revenue ÷ truck volume
freight        = parcel volume × rate per cu ft
```

Truck volume and parcel volume are each `length × breadth × height`, in cubic feet. The truck is always entered in feet; the parcel can be entered in feet or inches and is converted to feet before its volume is calculated, so it stays consistent with the truck volume. Truck hire cost and loading/unloading cost are captured for reference as the total operating cost, but do not feed into the freight formula. These calculations live in `src/calculations.ts`.

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

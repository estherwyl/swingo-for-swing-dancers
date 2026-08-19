# Swingo

Swingo is a mobile-first swing dance learning journal for rookie and social dancers.
It helps dancers quickly log the moves they learned or practiced, reflect on how the
session felt, and build a searchable Move Bank over time.

Live demo: [https://swingo-mvp.vercel.app](https://swingo-mvp.vercel.app)

## Product Idea

Swing dancers often forget move names, when they learned them, and what helped the
move finally click. Swingo turns those small learning moments into a lightweight
daily check-in ritual.

The MVP centers on two connected experiences:

- **Move Journal**: a reverse-chronological feed of dance learning entries.
- **Move Bank**: a searchable archive generated from saved journal entries.

Future versions can use this structured history to create a year-end
Spotify Wrapped-style dance report.

## MVP Features

- Journal home with recent dance entries and collected move stats
- Multi-step check-in flow:
  - choose dance family
  - choose or search for a move
  - record learning status
  - choose mood
  - add notes and optional class details
- Saved confirmation screen
- Searchable Move Bank
- Move detail history
- Lightweight Wrapped preview
- Mobile-first responsive layout inspired by native app screens

## Dance Families

The prototype includes a fixed taxonomy for:

- Lindy Hop
- Solo Jazz
- Charleston

## Tech Stack

- React
- Vite
- Lucide React icons
- Plain CSS
- Vercel deployment
- Playwright scripts for visual and scroll QA

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## QA Scripts

Run the main visual flow check:

```bash
node scripts/visual-qa.mjs
```

Run the focused mood-screen scroll check:

```bash
node scripts/scroll-qa.mjs
```

Both scripts share the Playwright harness in `scripts/qa-harness.mjs`. Screenshots are written to
`qa-output/`; override the target with `SWINGO_QA_OUT_DIR`, and the app URL with `SWINGO_QA_BASE_URL`.

The scroll QA was added after a mobile bug where the mood and note screen could feel
stuck under the bottom navigation. The current version keeps the save button visible
above the nav and confirms the screen can scroll.

## Deployment

The app is configured for Vercel with:

- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

Deploy:

```bash
npx vercel --prod
```

## Prototype Limitations

This is a front-end MVP prototype. Data is held in React state for the current
session only, so entries are not persisted after refresh. There is no user account,
database, media upload, social sharing, or full Wrapped report generation yet.

## Project Structure

```text
.
├── index.html
├── package.json
├── scripts/
│   ├── qa-harness.mjs
│   ├── scroll-qa.mjs
│   └── visual-qa.mjs
├── src/
│   ├── lib/            # shared domain data and helpers
│   ├── main.jsx        # screens and components
│   └── styles.css
└── vercel.json
```

## Design Direction

Swingo uses a dark, warm, mobile-app visual system with gold, mint, and coral accents
for the three dance families. The UI aims to feel more like a joyful check-in ritual
than a technical syllabus tracker.

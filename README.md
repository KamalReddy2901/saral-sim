# Saral: 3D simulation website

An interactive, static simulation of **Saral**, an offline Raspberry Pi study aid for learners with Down syndrome. A judge sees a 3D model of the device, watches a sample passage go through the pipeline, and then uses the real learner screen.

> **This is a simulation, not the real model.** Example outputs were prepared by the team (Master Doc section 11). The site never runs the AI model. Numbers marked *Simulated* are placeholders until real Raspberry Pi measurements are added (see below).

## Run, test, build

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run test:e2e   # smoke + axe accessibility tests (Playwright, uses installed Google Chrome)
npm run build      # type-check + production build into dist/
npm run preview
```

Useful URL parameters: `?mode=2d` or `?mode=3d` forces a view; `?chapter=5` opens a chapter (0 to 11).

## Deploy

Static output in `dist/`, no backend, no environment variables.

**Cloudflare Pages:** connect the repo, framework preset *Vite* (or none), build command `npm run build`, output directory `dist`. `.node-version` pins Node 22. `public/_headers` adds cache and security headers.
**Vercel / Netlify:** `vercel.json` and `netlify.toml` are included.
**GitHub Pages (project site):** `BASE_PATH=/<repo-name>/ npm run build`, then publish `dist/`.

## Swap in measured metrics

Edit only `src/data/metrics.config.ts`: set `source: "measured"`, fill `measuredOn` (hardware, OS, ExecuTorch version, date), replace the values, rebuild. Every badge switches from *Simulated* to *Measured on Raspberry Pi*, and the dashboard, model card, impact numbers and timers update. A `null` value shows "To be measured". Team names and links: `src/data/credits.config.ts`.

## Design language
A quiet instrument workspace: three hairline-divided columns (chapters, a framed 3D viewport, chapter details), cool graphite surfaces, one signal-yellow accent, teal for live data. Titles in Instrument Serif, interface in Geist, readouts in Geist Mono, the product's own pictograms as chapter icons. The learner screen is the only bright surface, so it reads as the user's world glowing out of the instrument. Reading chapters (barrier, checks, pictograms, results, impact, credits) take the centre; the 3D viewport steps aside.

The 3D viewport is the main stage: dark studio, glossy floor, accent lights that change colour per chapter, a scan sheet through the device on each chapter change, restrained bloom and grain. Interactions: hover lifts a part and shows its name; click opens it; click the Ethernet plug to pull it out or plug it in; click the USB stick to eject or insert it; click the screen to open the learner chapter; click the chip or cooler to start a run (chapter 5) or spin the fan; the picture leans toward the pointer; the briefing card can be hidden; `F` fullscreens the viewport; `R` runs the simulation. Explore mode adds free orbit, a pull-apart slider, fly-to-part on click and a reset button.

## What is in it

Twelve chapters (0 to 11): intro, the barrier, the device (exploded 3D with keyboard-focusable hotspots), load a passage (plus a basic-mode preview for your own text), offline proof, the local AI run (signature moment), checks (scripted retry), pictograms, the learner screen (rendered on the 3D display and full-screen), results, impact, credits. Guided and Explore modes. A 2D guided view takes over when WebGL is missing, the device is low-power, or the visitor chooses it.

Structure: `src/data` (passages, metrics, copy), `src/learner` (self-contained learner app), `src/preview` (basic mode and checks), `src/scene` (3D), `src/chapters`, `src/ui`, `src/store`, `src/utils`.

## Honesty rules built in
Persistent banner on every chapter; "Example output" tags on sample results; "Simulated"/"Measured" badge on every metric; "Basic-mode preview, not the AI model" on custom text; person-first language; no claim of learning outcomes, certification or validation by people with Down syndrome; no Easy-to-Read logo.

## Assumptions
- Everything in `DESIGN_PLAN.md`, plus: the Check A reading-grade limit is 5 (the Master Doc says "about 4"); it is an informal proxy and should be calibrated on the Pi test set.
- Check A and Check B are real functions run on the example text in the browser. The Check A allowlist includes "Earth", and number words match digits ("five" = "5"), so the Master Doc example sentences pass.
- The Chapter 6 scripted quiz run uses its own three model candidates (one is dropped because its wrong option appears in the text, then a template question fills in). The learner screen uses the team's prepared example quiz.
- **Master Doc inconsistency to review:** under rule B4 ("wrong option must not appear in any easy-read sentence"), several example distractors fail (for example "The Sun", "The flower", "New roots"). They are shown verbatim as specified; the B-check demo uses different candidates.
- The learner "Preparing" screen steps through its four stages in about 3 seconds for the demo.
- The 3D Pi is drawn about 1.4x real size; proportions are approximate.

## Known limitations
- Basic-mode preview is crude by design (picks sentences by word frequency); some previews read awkwardly.
- In Chapter 5 the cards and tokens are 3D; the learner display is a CSS3D layer, so it can only be hidden (not depth-blended) when the Pi passes in front of it.
- No offline service worker (optional in the brief); the site is static and fast to reload.
- Tested in Chrome. Firefox and Safari should work but were not run here.
- First 3D frame needs a moment to compile shaders; the hero text appears immediately.

## Pictograms
About 30 original SVG icons (`public/pictograms`, generated by `scripts/gen-pictograms.mjs`). To use real ARASAAC PNGs, put `<lemma>.png` files into `src/assets/arasaac/`; they are preferred automatically, and the exact credit then appears on the About screen, in Credits and in the footer:
*Pictograms author: Sergio Palao. Origin: ARASAAC (http://www.arasaac.org). License: CC (BY-NC-SA). Owner: Government of Aragon (Spain).* Use is non-commercial. Do not modify ARASAAC files, and check their current terms first. No ARASAAC files are in this repository.

## Licences
See `LICENSES.md`.

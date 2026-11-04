# Design plan (Phase 0)

## Assumptions
- The master document wins on content and honesty rules; the brief wins on web implementation.
- Example outputs (Master Doc section 11) are used verbatim. Word counts, averages and reading grades are computed in code.
- The 3D model is procedural, proportions approximate (the Pi is drawn about 1.4x real size next to the 7-inch display for legibility).
- No external assets at runtime: fonts self-hosted, lighting from procedural light panels, pictograms are original SVGs.
- Bloom post-processing was left out. The glow is done with emissive materials and one point light, which keeps the 3D chunk small and works on weak GPUs.
- `detect-gpu` was replaced by a small heuristic (WebGL context test, core count, device memory, save-data) because detect-gpu downloads a benchmark file at runtime, which would break the "no third-party requests" rule.

## Concept: two worlds on one page
Dark studio (ink #0E1A2B, panel #162A44) for the hardware. Warm, bright, high-contrast light world for the barrier, results, impact, credits and the learner screen. The boldness is spent in one place: chapter 5, where the passage's words stream into the chip, the board pulses, the fan spins and sentence cards rise onto the display.

## Tokens
Colours: ink, panel, mist, sun #FFC933 (key word, primary attention), cobalt #2F5BEA (interaction), leaf (correct, always with a tick icon), coral (look again, always with an eye icon).
Strong variants (cobalt #1A36A0, leaf #095C39) carry white text at 7:1 or better; a unit test checks every learner colour pair.
Type: Lexend for UI and headings, Atkinson Hyperlegible on the learner screen. Scale: 0.875, 1, 1.15, 1.4, 1.85, 3 rem.

## Layout
```
Desktop                                   Mobile
+------+------------------------------+   +----------------------+
| rail | banner (honesty note)        |   | banner               |
| 0..11|------------------------------|   |----------------------|
|      |  3D stage       +----------+ |   |  3D stage            |
|      |  (device)       | chapter  | |   |----------------------|
|      |  caption card   | panel    | |   |  chapter bottom sheet|
+------+-----------------+----------+-+   | [Back][chapter v][Next]
```
Learner screen: pictogram left, sentence right (landscape); stacked in portrait. Dots, then Back / Next.

## Review against "common generated-page defaults"
First draft problems found and changed:
- Identical rounded cards with soft shadows everywhere: panels now differ by role (a paper-like passage card, a terminal, gauges, a comparison split); light chapters are open layouts, not card grids.
- Eyebrow labels, arrows on links, middle-dot meta strings: none used.
- Fade-and-slide on every section: removed. Motion is limited to camera moves, the run sequence, and responses to clicks.
- Numbered markers everywhere: numbers only on the six pipeline stages and hotspot IDs, which are real sequences or references.
- Neural-network / circuit gradient visuals: none. The device and the learner screen are the visuals.

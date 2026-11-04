// Generates the original Saral pictogram set (SVG, 128x128, consistent style).
// Run: node scripts/gen-pictograms.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const INK = "#0E1A2B", Y = "#FFC933", B = "#2F5BEA", G = "#23A26D", M = "#E8EEF7", C = "#F0644F";
const out = "public/pictograms";
mkdirSync(out, { recursive: true });

// outlined stroke: dark underlay + coloured top
const line = (d, color, w = 8) =>
  `<path d="${d}" stroke="${INK}" stroke-width="${w + 8}"/><path d="${d}" stroke="${color}" stroke-width="${w}"/>`;
const shape = (el, fill) => el.replace("/>", ` fill="${fill}"/>`);
const circ = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const path = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const rect = (x, y, w, h, fill, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const poly = (pts, fill) => `<polygon points="${pts}" fill="${fill}"/>`;
const bare = (d, color, w = 6) => `<path d="${d}" stroke="${color}" stroke-width="${w}"/>`;

const CLOUD = "M36 94 C20 94 14 70 34 64 C32 40 62 30 74 48 C92 38 112 56 100 74 C116 78 112 94 96 94 Z";
const DROP = "M64 16 C64 16 34 52 34 76 a30 30 0 0 0 60 0 C94 52 64 16 64 16Z";

const sun = () => {
  let rays = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
    rays += bare(`M${(64 + c * 32).toFixed(1)} ${(64 + s * 32).toFixed(1)} L${(64 + c * 46).toFixed(1)} ${(64 + s * 46).toFixed(1)}`, INK, 7);
  }
  return rays + circ(64, 64, 22, Y);
};

const flower = () => {
  let petals = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    petals += circ((64 + Math.cos(a) * 25).toFixed(1), (46 + Math.sin(a) * 25).toFixed(1), 15, M);
  }
  return line("M64 70 V116", G, 7) + petals + circ(64, 46, 13, Y);
};

const icons = {
  sun,
  water: () => path(DROP, B) + bare("M50 70 a16 16 0 0 0 10 18", M, 6),
  sea: () => rect(14, 26, 100, 76, M, 14) + [50, 68, 86].map((y) => bare(`M24 ${y} q10.5 -12 21 0 t21 0 t21 0 t21 0`, B, 6)).join(""),
  river: () => rect(14, 14, 100, 100, G, 16) + line("M44 10 C100 34 24 62 78 84 S74 112 92 124", B, 18),
  cloud: () => path(CLOUD, M),
  rain: () => `<g transform="translate(6 -14) scale(.88)">${path(CLOUD, M)}</g>` + ["M40 90 l-6 16", "M62 90 l-6 16", "M84 90 l-6 16"].map((d) => bare(d, B, 8)).join(""),
  sky: () => rect(14, 14, 100, 100, B, 16) + circ(90, 42, 13, Y) + path("M28 98 a11 11 0 0 1 4-21 a15 15 0 0 1 28-4 a12 12 0 0 1 5 25z", M),
  up: () => poly("64,16 102,58 78,58 78,112 50,112 50,58 26,58", Y),
  earth: () => circ(64, 64, 46, B) + path("M42 42 q16 -12 28 2 q8 16 -8 22 q-20 4 -20 -24z", G) + path("M72 80 q18 -6 20 10 q-6 14 -18 8 z", G),
  plant: () => bare("M64 88 V52", INK, 10) + path("M64 70 C44 70 36 56 38 44 C56 44 64 54 64 70Z", G) + path("M64 58 C84 58 92 44 90 32 C72 32 64 42 64 58Z", G) + poly("42,88 86,88 79,116 49,116", Y),
  seed: () => `<ellipse cx="64" cy="66" rx="30" ry="42" transform="rotate(22 64 66)" fill="${Y}"/>` + bare("M48 48 q5 -14 18 -18", M, 6) + bare("M62 100 q8 -4 12 -14", INK, 5),
  root: () => rect(14, 14, 100, 100, Y, 16) + rect(14, 14, 100, 20, G, 10) + ["M64 34 V76", "M64 52 L42 74", "M64 62 L88 84", "M64 76 L60 106"].map((d) => line(d, M, 6)).join(""),
  shoot: () => rect(14, 92, 100, 22, Y, 8) + line("M64 94 V46", G, 7) + path("M64 56 C46 56 38 46 40 34 C56 34 64 42 64 56Z", G) + path("M64 52 C82 52 90 42 88 30 C72 30 64 38 64 52Z", G),
  leaf: () => path("M30 98 C20 54 54 22 102 26 C106 72 76 106 30 98Z", G) + bare("M30 98 L82 44", M, 6),
  flower,
  soil: () => rect(14, 30, 100, 76, Y, 14) + [[34, 52], [62, 46], [90, 56], [48, 72], [78, 76], [30, 88], [100, 88], [64, 94]].map(([x, y]) => circ(x, y, 4.5, INK)).join("") + circ(92, 40, 7, M),
  light: () =>
    ["M12 44 H24", "M104 44 H116", "M24 14 l8 8", "M104 14 l-8 8"].map((d) => bare(d, INK, 7)).join("") +
    path("M64 14 C40 14 28 32 32 52 C34 62 42 68 46 78 H82 C86 68 94 62 96 52 C100 32 88 14 64 14Z", Y) +
    rect(46, 84, 36, 10, M, 3) + rect(52, 100, 24, 10, M, 3),
  air: () => line("M18 46 H76 a14 14 0 1 0 -14 -14", B, 7) + line("M18 68 H100 a14 14 0 1 1 -14 14", B, 7) + line("M18 90 H58", B, 7),
  village: () =>
    rect(12, 76, 36, 32, M, 2) + poly("8,78 30,52 52,78", B) +
    rect(60, 58, 54, 50, M, 2) + poly("54,60 87,26 120,60", B) + rect(78, 80, 18, 28, G, 2) + rect(22, 88, 12, 12, Y, 2),
  vote: () =>
    rect(46, 14, 36, 56, M, 3) + bare("M54 36 l7 8 l13 -15", G, 6) +
    rect(20, 62, 88, 52, B, 8) + bare("M40 76 H88", M, 7),
  leader: () => path("M24 116 C24 76 104 76 104 116 Z", B) + circ(64, 40, 20, Y) + circ(86, 96, 11, Y) + bare("M86 90 v12", INK, 4),
  road: () => poly("52,12 76,12 114,116 14,116", INK) + ["M64 24 V38", "M64 54 V74", "M64 90 V108"].map((d) => bare(d, M, 7)).join(""),
  streetlight: () => rect(34, 108, 30, 10, B, 3) + bare("M48 108 V30 Q48 18 62 18 H84", INK, 10) + poly("70,18 102,18 94,34 78,34", Y) + bare("M80 46 v12", Y, 6) + bare("M92 46 v12", Y, 6),
  question: () =>
    path("M18 20 H110 a8 8 0 0 1 8 8 V84 a8 8 0 0 1 -8 8 H62 L40 114 V92 H18 a8 8 0 0 1 -8 -8 V28 a8 8 0 0 1 8 -8Z", B) +
    bare("M48 50 C48 30 80 30 80 50 C80 64 64 64 64 76", M, 9) + circ(64, 90, 6, M),
  calendar: () =>
    rect(16, 24, 96, 90, M, 10) + rect(16, 24, 96, 26, B, 8) + bare("M40 12 V34", INK, 8) + bare("M88 12 V34", INK, 8) +
    [[30, 62], [54, 62], [78, 62], [30, 86], [54, 86]].map(([x, y]) => rect(x, y, 16, 14, M, 3)).join("") + rect(78, 86, 16, 14, Y, 3),
  tick: () => circ(64, 64, 48, G) + bare("M38 66 L56 84 L90 44", M, 11),
  cross: () => circ(64, 64, 48, C) + bare("M44 44 L84 84", M, 11) + bare("M84 44 L44 84", M, 11),
  book: () =>
    path("M64 34 C50 22 30 22 12 30 V100 C30 92 50 92 64 104Z", M) + path("M64 34 C78 22 98 22 116 30 V100 C98 92 78 92 64 104Z", M) +
    ["M24 46 H50", "M24 60 H50", "M24 74 H44", "M78 46 H104", "M78 60 H104", "M78 74 H98"].map((d) => bare(d, B, 5)).join(""),
  hand: () =>
    ["M44 66 V34", "M60 62 V24", "M76 62 V28", "M92 68 V40"].map((d) => line(d, Y, 12)).join("") +
    line("M44 86 L24 66", Y, 12) + rect(36, 60, 64, 52, Y, 18),
  snow: () => {
    let s = "";
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 2;
      const dx = Math.cos(a) * 46, dy = Math.sin(a) * 46;
      s += line(`M${(64 - dx).toFixed(1)} ${(64 - dy).toFixed(1)} L${(64 + dx).toFixed(1)} ${(64 + dy).toFixed(1)}`, B, 6);
    }
    return s + circ(64, 64, 9, M);
  },
};

const wrap = (name, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><title>${name}</title>${body}</svg>\n`;

const index = {};
for (const [name, fn] of Object.entries(icons)) {
  writeFileSync(`${out}/${name}.svg`, wrap(name, fn()));
  index[name] = `${name}.svg`;
}
const json = JSON.stringify(index, null, 2) + "\n";
writeFileSync(`${out}/index.json`, json); // published copy
writeFileSync("src/data/pictogramIndex.json", json); // bundled copy used by the app
console.log(Object.keys(icons).length, "pictograms");

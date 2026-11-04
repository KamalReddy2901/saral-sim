import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

/** Silkscreen texture for the PCB top: white lines and labels, drawn on a canvas (no image files). */
export function makeSilkscreen(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 672;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, c.width, c.height);
  const mm = 1024 / 85;
  g.strokeStyle = "rgba(255,255,255,.85)";
  g.fillStyle = "rgba(255,255,255,.9)";
  g.lineWidth = 3;
  const X = (x: number) => (x + 42.5) * mm;
  const Y = (z: number) => (z + 28) * mm;
  // component outlines
  const box = (x: number, z: number, w: number, h: number) => g.strokeRect(X(x - w / 2), Y(z - h / 2), w * mm, h * mm);
  box(-10, 2, 19, 19); box(14, -2, 18, 18); box(-33, -6, 15, 15); box(-28, 16, 10, 10);
  g.beginPath(); g.moveTo(X(-27.4), Y(-18.5)); g.lineTo(X(23.4), Y(-18.5)); g.stroke();
  g.font = "600 34px Lexend, sans-serif";
  g.fillText("SARAL PI", X(-22), Y(24));
  g.font = "500 22px Lexend, sans-serif";
  g.fillText("illustration, not to scale", X(-22), Y(27));
  g.fillText("GPIO", X(-34), Y(-22.5));
  g.fillText("ETH", X(26), Y(11));
  // our own small mark (a leaf in a hexagon), not the Raspberry Pi logo
  g.save();
  g.translate(X(24), Y(-10));
  g.beginPath();
  for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i + Math.PI / 6; g.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); }
  g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(-18, 18); g.quadraticCurveTo(-22, -18, 18, -20); g.quadraticCurveTo(20, 20, -18, 18); g.stroke();
  g.restore();
  // fine copper detail: traces and vias, deterministic so the board never changes between loads
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.strokeStyle = "rgba(120,210,150,.28)"; g.lineWidth = 2.4;
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 84 - 42, z = rnd() * 54 - 27, len = 3 + rnd() * 9;
    g.beginPath(); g.moveTo(X(x), Y(z));
    if (rnd() > 0.5) { g.lineTo(X(x + len), Y(z)); g.lineTo(X(x + len), Y(z + len * 0.4)); } else { g.lineTo(X(x), Y(z + len)); g.lineTo(X(x + len * 0.4), Y(z + len)); }
    g.stroke();
  }
  g.fillStyle = "rgba(232,185,74,.85)";
  for (let i = 0; i < 160; i++) {
    g.beginPath(); g.arc(X(rnd() * 82 - 41), Y(rnd() * 52 - 26), 0.42 * mm, 0, Math.PI * 2); g.fill();
  }
  // solder pads along the edge connectors
  for (let k = 0; k < 14; k++) { g.fillRect(X(-27 + k * 1.6), Y(26.4), 0.9 * mm, 1.4 * mm); }
  g.fillStyle = "rgba(255,255,255,.9)";
  // mounting hole rings
  for (const [hx, hz] of [[-39, -24.5], [-39, 24.5], [19, -24.5], [19, 24.5]] as const) {
    g.beginPath(); g.arc(X(hx), Y(hz), 2.9 * mm, 0, Math.PI * 2); g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  t.minFilter = LinearFilter;
  return t;
}

export interface CardContent { text: string; key: string; pictogramUrl: string | null }

/** Sentence card: white card, pictogram on the left, big text with the key word underlined. */
export function makeCardTexture(content: CardContent, onUpdate: () => void): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 640; c.height = 280;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  let img: HTMLImageElement | null = null;

  const draw = () => {
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = "#ffffff";
    g.beginPath(); g.roundRect(4, 4, c.width - 8, c.height - 8, 28); g.fill();
    g.lineWidth = 6; g.strokeStyle = "#0e1a2b"; g.stroke();
    let tx = 36;
    if (content.pictogramUrl) {
      if (img?.complete) g.drawImage(img, 28, 52, 176, 176);
      tx = 224;
    }
    g.fillStyle = "#0e1a2b";
    g.font = '700 38px "Atkinson Hyperlegible", Lexend, sans-serif';
    g.textBaseline = "alphabetic";
    const maxW = c.width - tx - 28;
    const words = content.text.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (g.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next;
    }
    if (cur) lines.push(cur);
    const lh = 50;
    let y = c.height / 2 - ((lines.length - 1) * lh) / 2 + 12;
    const keyRe = new RegExp(content.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    for (const line of lines) {
      const m = keyRe.exec(line);
      if (m) {
        const before = g.measureText(line.slice(0, m.index)).width;
        const kw = g.measureText(m[0]).width;
        g.fillStyle = "#ffc933";
        g.fillRect(tx + before - 4, y - 36, kw + 8, 46);
        g.fillStyle = "#0e1a2b";
      }
      g.fillText(line, tx, y);
      y += lh;
    }
    tex.needsUpdate = true;
    onUpdate();
  };

  if (content.pictogramUrl) {
    img = new Image();
    img.onload = draw;
    img.src = content.pictogramUrl;
  }
  void document.fonts?.load('700 38px "Atkinson Hyperlegible"').then(draw).catch(draw);
  draw();
  return tex;
}

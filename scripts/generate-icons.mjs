#!/usr/bin/env node
/**
 * Genereert de PWA-iconen uit dezelfde vorm als het logo in de app.
 *
 * Waarom een eigen scriptje: de build-omgeving heeft geen SVG-rasterizer en we
 * willen er geen dependency (sharp/resvg) bij halen voor drie plaatjes. Dit
 * tekent de vorm rechtstreeks — rondingen via supersampling, PNG via zlib uit
 * de standaardbibliotheek.
 *
 * Draaien:  node scripts/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const BG = [0x06, 0x06, 0x06];
const FG = [0xff, 0xe6, 0x00];

/** Vorm in een 512×512-canvas, gelijk aan public/icon.svg. */
const SHAPE = {
  corner: 112,
  stroke: 40,
  dot: { x: 256, y: 176, r: 46 },
  curves: [
    [96, 336, 176, 336, 176, 176, 256, 176],
    [256, 176, 336, 176, 336, 304, 416, 304],
  ],
};

/* ---------- rasteriseren ---------- */

function cubicAt(c, t) {
  const u = 1 - t;
  const x =
    u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6];
  const y =
    u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7];
  return [x, y];
}

/** Vult een schijf in het masker via rij-spans (snel, geen per-pixel wortel). */
function disc(mask, size, cx, cy, r) {
  const top = Math.max(0, Math.ceil(cy - r));
  const bottom = Math.min(size - 1, Math.floor(cy + r));
  for (let y = top; y <= bottom; y++) {
    const dy = y - cy;
    const half = Math.sqrt(Math.max(0, r * r - dy * dy));
    const x0 = Math.max(0, Math.ceil(cx - half));
    const x1 = Math.min(size - 1, Math.floor(cx + half));
    if (x1 >= x0) mask.fill(1, y * size + x0, y * size + x1 + 1);
  }
}

/** Afgeronde rechthoek over het hele canvas. */
function roundedRect(mask, size, radius) {
  for (let y = 0; y < size; y++) {
    let x0 = 0;
    let x1 = size - 1;
    const dyTop = radius - y;
    const dyBottom = y - (size - 1 - radius);
    const dy = Math.max(dyTop, dyBottom, 0);
    if (dy > 0) {
      const inset = radius - Math.sqrt(Math.max(0, radius * radius - dy * dy));
      x0 = Math.ceil(inset);
      x1 = size - 1 - Math.ceil(inset);
    }
    if (x1 >= x0) mask.fill(1, y * size + x0, y * size + x1 + 1);
  }
}

/**
 * Rendert het icoon op `size` pixels met `ss`× supersampling.
 * `scale` verkleint de vorm binnen het canvas (voor maskable-iconen).
 * `fullBleed` laat de achtergrond de hele vierkant vullen i.p.v. afgerond.
 */
function render(size, { ss = 4, scale = 1, fullBleed = false } = {}) {
  const big = size * ss;
  const unit = (big / 512) * scale;
  const offset = (big * (1 - scale)) / 2;
  const at = (v) => v * unit + offset;

  const bgMask = new Uint8Array(big * big);
  if (fullBleed) bgMask.fill(1);
  else roundedRect(bgMask, big, (SHAPE.corner / 512) * big);

  const fgMask = new Uint8Array(big * big);
  const radius = (SHAPE.stroke / 2) * unit;
  for (const c of SHAPE.curves) {
    // ongeveer één sample per pixel langs de curve: genoeg voor een gladde lijn
    const steps = Math.max(64, Math.ceil(2 * unit * 128));
    for (let i = 0; i <= steps; i++) {
      const [x, y] = cubicAt(c, i / steps);
      disc(fgMask, big, at(x), at(y), radius);
    }
  }
  disc(fgMask, big, at(SHAPE.dot.x), at(SHAPE.dot.y), SHAPE.dot.r * unit);

  // downsamplen naar de doelgrootte → nette randen zonder trapjes
  const rgba = Buffer.alloc(size * size * 4);
  const per = ss * ss;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bg = 0;
      let fg = 0;
      for (let sy = 0; sy < ss; sy++) {
        const row = (y * ss + sy) * big + x * ss;
        for (let sx = 0; sx < ss; sx++) {
          bg += bgMask[row + sx];
          fg += fgMask[row + sx];
        }
      }
      const alpha = bg / per;
      const fgCoverage = Math.min(fg / per, alpha);
      const bgCoverage = alpha - fgCoverage;
      const i = (y * size + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const mixed =
          alpha > 0 ? (FG[ch] * fgCoverage + BG[ch] * bgCoverage) / alpha : 0;
        rgba[i + ch] = Math.round(mixed);
      }
      rgba[i + 3] = Math.round(alpha * 255);
    }
  }
  return rgba;
}

/* ---------- PNG schrijven ---------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function toPng(rgba, size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bitdiepte
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- uitvoeren ---------- */

const targets = [
  { file: "icon-192.png", size: 192, options: {} },
  { file: "icon-512.png", size: 512, options: {} },
  { file: "apple-touch-icon.png", size: 180, options: {} },
  // maskable: Android snijdt er een vorm uit, dus de tekening blijft binnen
  // de veilige zone van 80% en de achtergrond loopt door tot de rand
  { file: "icon-maskable-512.png", size: 512, options: { scale: 0.7, fullBleed: true } },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const { file, size, options } of targets) {
  const png = toPng(render(size, options), size);
  writeFileSync(join(OUT_DIR, file), png);
  console.log(`${file.padEnd(24)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} kB`);
}

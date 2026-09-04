import test from "node:test";
import assert from "node:assert/strict";

import { parseFIT, looksLikeFIT } from "../fit.ts";

/** Bouwt een minimaal geldig FIT-bestand met recordberichten (lat/lon). */
function buildFIT(points: [number, number][], headerSize = 12): Buffer {
  const chunks: Buffer[] = [];

  // ---- file header (12 of 14 bytes; bij 14 zijn de CRC-bytes 0) ----
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(headerSize, 0); // headergrootte incl. magic
  header.writeUInt8(0x10, 2); // protocol 1.0
  header.writeUInt16LE(0x0f00, 3); // profile
  header.write(".FIT", 8, "ascii");
  chunks.push(header);

  // ---- definitiebericht local 0 voor global 20 (record) ----
  const fields: [number, number, number][] = [
    [FIELD_LAT, 4, 0x85], // sint32 little
    [FIELD_LON, 4, 0x85],
  ];
  // payload: reserved, arch, global num, n fields, velden (3 bytes elk), n dev-velden
  const defPayload = Buffer.alloc(5 + fields.length * 3 + 1);
  defPayload.writeUInt8(0, 0); // reserved
  defPayload.writeUInt8(0, 1); // arch = little endian
  defPayload.writeUInt16LE(GLOBAL_RECORD, 2);
  defPayload.writeUInt8(fields.length, 4);
  fields.forEach(([num, size, base], i) => {
    defPayload.writeUInt8(num, 5 + i * 3);
    defPayload.writeUInt8(size, 5 + i * 3 + 1);
    defPayload.writeUInt8(base, 5 + i * 3 + 2);
  });
  defPayload.writeUInt8(0, 5 + fields.length * 3); // 0 dev-velden
  const defMsg = Buffer.concat([Buffer.from([0x40]), defPayload]); // 0x40 = definition, local 0
  chunks.push(defMsg);

  // ---- databerichten ----
  const SEMI = 2147483648 / 180;
  for (const [lat, lng] of points) {
    const data = Buffer.alloc(8);
    data.writeInt32LE(Math.round(lat * SEMI), 0);
    data.writeInt32LE(Math.round(lng * SEMI), 4);
    chunks.push(Buffer.concat([Buffer.from([0x00]), data])); // data, local 0
  }

  return Buffer.concat(chunks);
}

const FIELD_LAT = 3;
const FIELD_LON = 4;
const GLOBAL_RECORD = 20;

/** Buffer → echte ArrayBuffer-copy (node typt .buffer als ArrayBufferLike). */
function toAB(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
}

test("fit:records worden gedecodeerd tot coördinaten", () => {
  const buf = buildFIT([
    [50.851, 5.691],
    [50.813, 5.726],
    [50.778, 5.722],
  ]);
  const pts = parseFIT(toAB(buf));
  assert.ok(pts, "parser geeft null");
  assert.equal(pts!.length, 3);
  assert.ok(Math.abs(pts![0].lat - 50.851) < 1e-5);
  assert.ok(Math.abs(pts![2].lng - 5.722) < 1e-5);
});

test("fit:looksLikeFIT herkent de magic", () => {
  const buf = buildFIT([[50.8, 5.7]]);
  assert.equal(looksLikeFIT(toAB(buf)), true);
  assert.equal(looksLikeFIT(new TextEncoder().encode("geen fit").buffer), false);
});

test("fit:onherkenbare input geeft null", () => {
  assert.equal(parseFIT(new ArrayBuffer(4)), null);
  const garbage = new TextEncoder().encode("hello world dit is geen fit");
  assert.equal(parseFIT(toAB(Buffer.from(garbage))), null);
});

test("fit:één punt is geen route (>= 2 vereist)", () => {
  const buf = buildFIT([[50.8, 5.7]]);
  const pts = parseFIT(toAB(buf));
  assert.equal(pts, null);
});

test("fit:14-byte header met CRC-velden wordt ook gelezen", () => {
  const buf = buildFIT([
    [50.851, 5.691],
    [50.813, 5.726],
  ], 14);
  const pts = parseFIT(toAB(buf));
  assert.ok(pts);
  assert.equal(pts.length, 2);
});

test("fit:gecomprimeerd tijdstempelbericht wordt veilig overgeslagen", () => {
  const buf = buildFIT([
    [50.851, 5.691],
    [50.813, 5.726],
  ]);
  // compressed timestamp header (0x80 | local 0) + 8 bytes payload
  const payload = Buffer.alloc(8);
  const compressed = Buffer.concat([Buffer.from([0x80]), payload]);
  const withCompressed = Buffer.concat([buf, compressed]);
  const pts = parseFIT(toAB(withCompressed));
  assert.ok(pts);
  assert.equal(pts.length, 2); // geen dubbele punten, geen crash
});

test("fit:afgebroken bestand crasht niet", () => {
  const buf = buildFIT([
    [50.851, 5.691],
    [50.813, 5.726],
  ]);
  for (const cut of [5, 13, 20, buf.length - 4]) {
    const r = parseFIT(toAB(buf.slice(0, Math.max(0, cut))));
    assert.ok(r === null || Array.isArray(r), `bij cut ${cut}`);
  }
});

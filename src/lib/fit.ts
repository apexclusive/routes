/**
 * Garmin FIT — minimaalte decoder voor records (lat/lon), genoeg om een
 * .fit-route te importeren.FIT is binair: berichten met een header, daarna
 * definitieberichten (layout) en databerichten (waarden).
 * Zonder dependencies, zonder aliases — testbaar in node.
 */

/** Schaal: semicircles → graden (2^31 = 180°). */
const SEMI = 180 / 2147483648;

interface FieldDef {
  defNum: number;
  size: number;
  baseType: number;
}

interface MsgDef {
  globalNum: number;
  arch: number; // 0 = little endian, 1 = big endian
  fields: FieldDef[];
  size: number; // totale datalengte
}

const GLOBAL_RECORD = 20;
const FIELD_LAT = 3;
const FIELD_LON = 4;

/**
 * Zet een .fit-buffer om naar coördinaten. Geeft null bij onherkenbaar
 * bestand; laat punten met ontbrekende GPS vallen.
 */
export function parseFIT(buffer: ArrayBuffer): { lat: number; lng: number }[] | null {
  if (buffer.byteLength < 12) return null;
  const v = new DataView(buffer);
  // magic ".FIT" op byte 8..11
  if (
    v.getUint8(8) !== 0x2e ||
    v.getUint8(9) !== 0x46 ||
    v.getUint8(10) !== 0x49 ||
    v.getUint8(11) !== 0x54
  ) {
    return null;
  }

  const headerSize = v.getUint8(0);
  let i = headerSize; // berichten starten na de file-header
  const defs = new Map<number, MsgDef>();
  const pts: { lat: number; lng: number }[] = [];

  try {
    while (i + 1 < buffer.byteLength) {
      const h = v.getUint8(i);
      i += 1;

      if (h & 0x80) {
        // gecomprimeerd tijdstempel-bericht: zelfde definitie, alleen doorschuiven
        const local = h & 0x03;
        const def = defs.get(local);
        if (!def) break;
        i += def.size;
        continue;
      }

      const local = h & 0x0f;

      if (h & 0x40) {
        // definitiebericht: 5 vaste bytes + 3 per veld
        if (i + 5 > buffer.byteLength) break;
        const arch = v.getUint8(i + 1);
        const globalNum =
          arch === 1
            ? v.getUint16(i + 2, false)
            : v.getUint16(i + 2, true);
        const nFields = v.getUint8(i + 4);
        const base = i + 5;
        if (base + nFields * 3 > buffer.byteLength) break;
        const fields: FieldDef[] = [];
        for (let f = 0; f < nFields; f++) {
          fields.push({
            defNum: v.getUint8(base + f * 3),
            size: v.getUint8(base + f * 3 + 1),
            baseType: v.getUint8(base + f * 3 + 2),
          });
        }
        defs.set(local, {
          globalNum,
          arch,
          fields,
          size: fields.reduce((s, f) => s + f.size, 0),
        });
        i = base + nFields * 3;
        // direct na de velden staat het aantal ontwikkelvelden (moderne FIT);
        // die bytes tellen mee met de berichtlengte, ook als het er nul zijn
        if (i < buffer.byteLength) {
          const nDev = v.getUint8(i);
          i += 1;
          if (nDev > 0) i += nDev * 3;
        }
        continue;
      }

      // databericht
      const def = defs.get(local);
      if (!def) break;
      if (def.globalNum === GLOBAL_RECORD) {
        let offset = i;
        let lat: number | null = null;
        let lng: number | null = null;
        for (const f of def.fields) {
          const val = readSint32(v, offset, f.size, def.arch === 1);
          if (f.defNum === FIELD_LAT && val !== null) lat = val;
          if (f.defNum === FIELD_LON && val !== null) lng = val;
          offset += f.size;
        }
        if (lat !== null && lng !== null && (lat !== 0 || lng !== 0)) {
          pts.push({ lat: lat * SEMI, lng: lng * SEMI });
        }
      }
      i += def.size;
    }
  } catch {
    return pts.length >= 2 ? pts : null;
  }

  return pts.length >= 2 ? pts : null;
}

function readSint32(
  v: DataView,
  offset: number,
  size: number,
  bigEndian: boolean
): number | null {
  try {
    if (size === 4) return v.getInt32(offset, !bigEndian);
    if (size === 1) return v.getInt8(offset);
    if (size === 2) return v.getInt16(offset, !bigEndian);
    if (size === 8) return Number(v.getBigInt64(offset, !bigEndian));
  } catch {
    return null;
  }
  return null;
}

/** Snelcheck: ziet dit eruit als een FIT-bestand (op de magic na 8 bytes)? */
export function looksLikeFIT(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 12) return false;
  const v = new DataView(buffer);
  return (
    v.getUint8(8) === 0x2e && v.getUint8(9) === 0x46 && v.getUint8(10) === 0x49 && v.getUint8(11) === 0x54
  );
}

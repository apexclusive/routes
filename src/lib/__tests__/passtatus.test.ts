import test from "node:test";
import assert from "node:assert/strict";
import { CLIMBS } from "../climbs.ts";
import {
  MAANDEN,
  PASSEN,
  STATUS_KLEUR,
  STATUS_LABEL,
  STATUS_UITLEG,
  besteMaand,
  passenOpHoogte,
  periodeLabel,
  statusInMaand,
  telOpen,
} from "../passtatus.ts";

test("elke pas verwijst naar een bestaande klim", () => {
  const ids = new Set(CLIMBS.map((c) => c.id));
  for (const p of PASSEN) {
    assert.ok(ids.has(p.climbId), `${p.naam}: klim-id "${p.climbId}" bestaat niet`);
  }
});

test("de hoogte klopt met de klimbibliotheek", () => {
  const byId = new Map(CLIMBS.map((c) => [c.id, c]));
  for (const p of PASSEN) {
    const c = byId.get(p.climbId);
    assert.ok(c);
    assert.equal(
      p.hoogteM,
      c.summitM,
      `${p.naam}: hoogte ${p.hoogteM} wijkt af van klimdata ${c.summitM}`
    );
  }
});

test("elke pas heeft een werkbare officiële bron", () => {
  for (const p of PASSEN) {
    assert.ok(p.bron.label.length > 3, `${p.naam}: bron zonder label`);
    assert.match(p.bron.url, /^https:\/\//, `${p.naam}: bron is geen https-url`);
  }
});

test("openings- en sluitmaand zijn plausibel", () => {
  for (const p of PASSEN) {
    assert.ok(p.openVanafMaand >= 1 && p.openVanafMaand <= 12, `${p.naam}: maand buiten bereik`);
    assert.ok(p.dichtVanafMaand >= 1 && p.dichtVanafMaand <= 12, `${p.naam}: maand buiten bereik`);
    assert.ok(
      p.dichtVanafMaand > p.openVanafMaand,
      `${p.naam}: sluit voordat hij opengaat`
    );
    // een alpenpas die in maart opengaat is een datafout
    assert.ok(p.openVanafMaand >= 4, `${p.naam}: onwaarschijnlijk vroege opening`);
  }
});

test("hoge passen gaan niet eerder open dan lage", () => {
  // de Susten (2224 m) ging in 2026 later open dan de Klausen (1948 m);
  // een pas boven 2400 m die in april opengaat klopt bijna nooit
  for (const p of PASSEN) {
    if (p.hoogteM > 2400) {
      assert.ok(
        p.openVanafMaand >= 5,
        `${p.naam} ligt op ${p.hoogteM} m maar zou in maand ${p.openVanafMaand} opengaan`
      );
    }
  }
});

test("statusInMaand markeert de randmaanden als risico", () => {
  const stelvio = PASSEN.find((p) => p.climbId === "stelvio");
  assert.ok(stelvio);
  // januari: dicht
  assert.equal(statusInMaand(stelvio, 1), "meestal-dicht");
  // juni is de openingsmaand en dus onbetrouwbaar
  assert.equal(statusInMaand(stelvio, 6), "randseizoen");
  // augustus is veilig
  assert.equal(statusInMaand(stelvio, 8), "meestal-open");
  // oktober en november liggen tegen de sluiting aan
  assert.equal(statusInMaand(stelvio, 10), "randseizoen");
  assert.equal(statusInMaand(stelvio, 11), "randseizoen");
});

test("midden in de winter staat geen enkele hoge pas op open", () => {
  for (const maand of [1, 2, 3]) {
    for (const p of PASSEN) {
      assert.notEqual(
        statusInMaand(p, maand),
        "meestal-open",
        `${p.naam} zou in ${MAANDEN[maand - 1]} open zijn`
      );
    }
  }
});

test("de zomer levert de meeste open passen op", () => {
  const beste = besteMaand();
  assert.ok(beste >= 7 && beste <= 9, `beste maand is ${MAANDEN[beste - 1]}, verwacht de zomer`);
  assert.ok(telOpen(beste) > telOpen(1), "de zomer moet meer open passen tellen dan januari");
  assert.equal(telOpen(1), 0, "in januari hoort niets open te staan");
});

test("elke status heeft een label, uitleg en kleur", () => {
  for (const s of ["meestal-open", "randseizoen", "meestal-dicht", "hele-jaar"] as const) {
    assert.ok(STATUS_LABEL[s], `${s} mist een label`);
    assert.ok(STATUS_UITLEG[s].length > 20, `${s} mist een bruikbare uitleg`);
    assert.ok(STATUS_KLEUR[s].includes("border"), `${s} mist een randkleur`);
  }
  // de randseizoen-uitleg moet mensen echt naar de bron sturen
  assert.match(STATUS_UITLEG.randseizoen, /check|controleer/i);
});

test("passenOpHoogte sorteert van hoog naar laag", () => {
  const lijst = passenOpHoogte();
  assert.equal(lijst.length, PASSEN.length);
  for (let i = 1; i < lijst.length; i++) {
    assert.ok(lijst[i - 1].hoogteM >= lijst[i].hoogteM, "hoogtes staan niet op volgorde");
  }
  assert.equal(lijst[0].climbId, "col-de-la-bonette", "de Bonette is de hoogste");
});

test("periodeLabel leest als een gewone zin", () => {
  const stelvio = PASSEN.find((p) => p.climbId === "stelvio");
  assert.ok(stelvio);
  assert.equal(periodeLabel(stelvio), "juni – november");
});

test("autovrije dagen staan alleen bij passen die ze echt kennen", () => {
  const metDagen = PASSEN.filter((p) => p.autovrij2026?.length);
  assert.ok(metDagen.length >= 3, "de Valtellina-passen kennen autovrije dagen");
  for (const p of metDagen) {
    for (const d of p.autovrij2026 ?? []) {
      assert.match(d, /2026/, `${p.naam}: autovrije dag zonder jaartal`);
      assert.match(d, /fietsers/i, `${p.naam}: onduidelijk voor wie de weg vrij is`);
    }
  }
});

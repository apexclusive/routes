#!/usr/bin/env node
/**
 * Ververst de brandstofprijzen in src/lib/tourkosten.ts.
 *
 * Waarom dit script bestaat: de prijzen stonden als handmatige tabel in de
 * code, en zulke tabellen verouderen stilletjes. Een raming die zegt dat
 * benzine 1,80 kost terwijl het 2,30 is, ondermijnt het vertrouwen in de hele
 * rekenmodule. Draai dit een paar keer per jaar:
 *
 *     node scripts/ververs-prijzen.mjs          # toont wat er zou wijzigen
 *     node scripts/ververs-prijzen.mjs --schrijf  # past het bestand aan
 *
 * Bron is de Weekly Oil Bulletin van de Europese Commissie, ontsloten via
 * fuel-prices.eu. Zwitserland zit niet in de EU-bulletin en houdt daarom zijn
 * handmatige waarde; het script laat dat expliciet zien in plaats van er een
 * verzonnen getal voor in de plaats te zetten.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HIER = dirname(fileURLToPath(import.meta.url));
const DOEL = join(HIER, "..", "src", "lib", "tourkosten.ts");
const BRON = "https://www.fuel-prices.eu/";

/** landcodes die in tourkosten.ts staan, met hun naam op de bronpagina */
const LANDEN = {
  NL: "Netherlands",
  BE: "Belgium",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  AT: "Austria",
  LU: "Luxembourg",
};

/** Zwitserland zit niet in het EU-bulletin. */
const BUITEN_EU = ["CH"];

const schrijven = process.argv.includes("--schrijf");

function log(...a) {
  console.log(...a);
}

/**
 * Haalt de landtabel op. De pagina-indeling kan veranderen, dus we falen
 * luidruchtig in plaats van stilletjes verkeerde cijfers weg te schrijven.
 */
async function haalPrijzen() {
  const res = await fetch(BRON, {
    headers: { "user-agent": "apex-routes-prijsverversing/1.0" },
  });
  if (!res.ok) throw new Error(`bron gaf HTTP ${res.status}`);
  const html = await res.text();

  const gevonden = {};
  for (const [code, naam] of Object.entries(LANDEN)) {
    // zoek de rij van het land en pak het eerste bedrag in euro erachter
    const rij = new RegExp(`${naam}[^€]{0,400}?€\\s*([0-9]+[.,][0-9]{2,3})`, "i");
    const m = html.match(rij);
    if (m) {
      const waarde = Number(m[1].replace(",", "."));
      if (waarde > 0.8 && waarde < 4) gevonden[code] = waarde;
    }
  }
  return gevonden;
}

function huidigeWaarden(bron) {
  const blok = bron.match(
    /export const BENZINE_EUR_PER_LITER[^{]*\{([\s\S]*?)\n\};/
  );
  if (!blok) throw new Error("BENZINE_EUR_PER_LITER niet gevonden in tourkosten.ts");
  const uit = {};
  for (const m of blok[1].matchAll(/([A-Z]{2}):\s*([0-9.]+)/g)) {
    uit[m[1]] = Number(m[2]);
  }
  return uit;
}

async function main() {
  const bron = await readFile(DOEL, "utf8");
  const huidig = huidigeWaarden(bron);

  let nieuw;
  try {
    nieuw = await haalPrijzen();
  } catch (err) {
    console.error(`Ophalen mislukt: ${err.message}`);
    console.error("De bestaande waarden blijven staan.");
    process.exit(1);
  }

  const missend = Object.keys(LANDEN).filter((c) => !(c in nieuw));
  if (missend.length > Object.keys(LANDEN).length / 2) {
    console.error(
      `Te weinig landen gevonden (${missend.join(", ")}). De bronpagina is waarschijnlijk veranderd — controleer het script voordat je iets wegschrijft.`
    );
    process.exit(1);
  }

  log(`Bron: ${BRON}`);
  log(`Peildatum: ${new Date().toISOString().slice(0, 10)}\n`);
  log("land   oud     nieuw   verschil");

  let gewijzigd = 0;
  let uit = bron;
  for (const code of [...Object.keys(LANDEN), ...BUITEN_EU]) {
    const oud = huidig[code];
    if (BUITEN_EU.includes(code) || !(code in nieuw)) {
      log(`${code}     ${oud?.toFixed(2) ?? "—"}    (handmatig, niet in de EU-bron)`);
      continue;
    }
    const val = Number(nieuw[code].toFixed(2));
    const delta = val - oud;
    const teken = delta > 0 ? "+" : "";
    log(
      `${code}     ${oud.toFixed(2)}    ${val.toFixed(2)}    ${teken}${delta.toFixed(2)}${
        Math.abs(delta) > 0.3 ? "  ← grote sprong, controleer dit" : ""
      }`
    );
    if (val !== oud) {
      gewijzigd++;
      uit = uit.replace(
        new RegExp(`(\\n\\s*${code}:\\s*)${oud}([,\\n])`),
        `$1${val.toFixed(2)}$2`
      );
    }
  }

  if (gewijzigd === 0) {
    log("\nAlles staat al bij.");
    return;
  }

  if (!schrijven) {
    log(`\n${gewijzigd} prijzen zouden wijzigen. Draai met --schrijf om het door te voeren.`);
    return;
  }

  // ook de peildatum in BRON bijwerken, anders klopt de bronvermelding niet meer
  const maanden = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
  ];
  const nu = new Date();
  uit = uit.replace(
    /peildatum [a-z]+ \d{4}/i,
    `peildatum ${maanden[nu.getMonth()]} ${nu.getFullYear()}`
  );

  await writeFile(DOEL, uit, "utf8");
  log(`\n${gewijzigd} prijzen bijgewerkt in ${DOEL}.`);
  log("Draai nu: npm test && npm run lint");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

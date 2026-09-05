# Apex Routes 🛣️

> De mooiste route, in seconden.

**Apex Routes** is een AI-routeplanner voor motor, auto, fiets en wandelen. Je
beschrijft in gewone taal wat je wilt rijden, en Apex Routes zet het om in één
doorlopende route over de echte wegen — met kaart, afstand, rijtijd,
slinger-score en exports naar Google Maps, Waze en GPX (TomTom / Calimoto / Kurviger).

## Snel starten

```bash
npm ci
cp .env.example .env   # optioneel voor lokaal; vereist voor productie-integraties
npm run dev
# open http://localhost:3000
```

Productie:

```bash
npm run build
npm start
```

Lint, typecheck en tests:

```bash
npm run lint
npm exec tsc -- --noEmit
npm test
```

De tests draaien op Node's ingebouwde testrunner (`node --test`) zonder extra
dependencies; daarvoor is Node 22.6+ nodig (type stripping). Dezelfde vier
stappen draaien in CI op elke pull request — zie `.github/workflows/ci.yml`.

## Wat je kunt

- 💬 **Chatten met de route-assistent** — typ bv. *"Rondrit door Zuid-Limburg, 100 km"*,
  *"Motor tocht van Maastricht naar Slenaken"* of gebruik de snelknoppen.
  Je locatie als startpunt? De assistent vraagt om toestemming en gebruikt echte geolocation.
- 🗺️ **Klikken op de kaart** om routepunten toe te voegen; de route wordt automatisch
  berekend over echte wegen. Punten verslepen of verwijderen kan via de puntenlijst.
- 📥 **Routes importeren** uit GPX, KML, TCX, GeoJSON én Garmin-FIT — overal
op de pagina te slepen (drag & drop) én via de knop; export weer als GPX.
- 🧭 **Turn-by-turn uit je GPX** — een geüploade track wordt via OSRM *map matching*
  op het echte wegenraster gelegd, omgezet naar een Nederlandse routebeschrijving
  (afslagen links/rechts, rotondes) én naar slimme navigatie-ankers voor Google Maps:
  maximaal 11 ankers die exact op de weg liggen bij de belangrijkste beslispunten —
  géén POI-ankers, dus geen "naartoe navigeren en omkeren". De GPX-export bevat de
  afslaginstructies als `<rte>`-punten voor OsmAnd, Kurviger, Calimoto, TomTom en Garmin.
- 🧭➡️🗺️ **Klik op een afslag** in de routebeschrijving en de kaart vliegt erheen.
  Bij geïmporteerde routes zie je de navigatie-ankers als genummerde stipjes op de
  lijn — precies de punten die Google Maps meekrijgt.
- ✏️ **Geïmporteerde tracks blijven heel** — een klik op de kaart of het verslepen
  van start/einde vernietigt de track niet, maar zet hem om naar bewerkbare
  ankerpunten (met duidelijke melding in de chat).
- 🤲 **Eerlijk over schattingen** — is de routing-dienst onbereikbaar, dan zie je
  een **≈ geschat**-markering in plaats van nep-precisie; de route werkt door,
  maar je weet dat het geen wegenraster-route is.
- 💾 **Routes bewaren en delen** — opslaan in je browser (geen account, geen
  server) en delen via een link waar de héle route in zit. De geometrie gaat als
  *encoded polyline* mee; past dat niet in de URL, dan bevat de link de
  routepunten en berekent de ontvanger de route opnieuw.
- ⛰️ **Hoogteprofiel en klimmeters** via de gratis
  [Open-Meteo Elevation API](https://open-meteo.com/en/docs/elevation-api) — met
  ruisonderdrukking, zodat GPS-gerommel geen fantoom-hoogtemeters oplevert.
- 🔀 **Optimale volgorde** — vanaf 4 punten herschikt de app de tussenpunten
  (nearest-neighbour + 2-opt) voor de kortste route. Start en eind blijven staan,
  en je kunt het in één klik terugdraaien.
- ⛽ **Tankstops & laadpalen onderweg** — één klik toont alle tankstations en
  laadpalen binnen 2 km van de route (live OpenStreetMap-data via Overpass),
  gesorteerd op afstand tot de routelijn.
- 🌤️ **Weer bij vertrek** — temperatuur en neerslag op de startplek
  (Open-Meteo, keyless) direct in de route-samenvatting.
- ↔️ **Rit-helpers** — route omkeren, lus sluiten (rondrit maken) en
  dubbele punten worden automatisch voorkomen.
- 🖨️ **Printen of als PDF bewaren** — alleen de samenvatting en de
  routebeschrijving, zonder kaart en knoppen.
- 📱 **Installeerbaar als app** (PWA) — op je beginscherm, fullscreen, met een
  service worker die de app-shell beschikbaar houdt als het netwerk wegvalt.
- 🛰️ **Kaart- én satellietweergave** (donker gefilterde Esri World Street Map + Esri World Imagery) met één klik, zonder API-sleutel in de browser.
- 🎬 **Demo-rit** — rij je route virtueel vooraf: rijdende marker die de camera volgt,
  afslagbanners ("over 300 m linksaf") en optioneel gesproken instructies (Web Speech).
- 🧭 **[Ontdek routes](/ontdek)** — top-10 per land (NL · BE · LU · DE), mooie ritten naar
  circuits (Zolder, Zandvoort, Assen, Spa, Nürburgring) en de rally's (StreetGasm, CC Rally,
  Limburgs Mooiste…) met bronvermelding: hun GPX sleep je zo de planner in.
- 💬 **Feedback-bord** — stemmen op de roadmap en eigen ideeën (lokaal + kopieerbaar).
- 📊 **Peilingen** — eerlijke apparaat-lokale keuze (geen verzonnen publiektotalen).
- 📖 **[Apex Advisor](/advies)** — bestemmingengidsen met geschiedenis (Mergellandroute
  1963, B500 uit 1930/1952), klimtabel NL (Cauberg 13,2%), APK/DOT-bandencheck,
  pech-alarmnummers (112/ANWB), hotel- en app-tips en de meetings-kalender.
- 🗂️ **Ritbank-forum** — categorieën (motor/auto/wandelen/fietsen), foto's bij
  berichten (verkleind, lokaal) en deel-links.
- 📅 **[Kalender](/kalender)** — filterbare event-agenda (baanrijden, MTB, marathons,
  wandelen, cyclo's, meets) met Nordschleife-Touristenfahrten-info + Apex Nieuws.
- 🪣 **Bucketlist** — twaalf droomritten afvinken (voortgangsring + confetti bij 100%),
  eigen items toevoegen, direct rij-knop.
- 🗺️ **NL per provincie + top-10** — twaalf hoogtepunten (o.a. Wilhelminaberg-trap,
  508 treden) en de must-have top-10; plus lucht-ervaringen (rondvlucht, zweefvliegen,
  ballonvaart).
- 📷 **Uitzichtpunten** naast tankstops/laadpalen in de POI-laag (OpenStreetMap/Overpass).
- 🎲 **Route Roulette** — niet kiezen maar draaien: wiel op de landing (of 🎲 in de
  chat) kiest regio + kilometers, en de assistent bouwt de route meteen. Elke draai
  is deelbaar via de seed.
- 🏆 **De Garage** — statistieken (km, regio's, kronkelfactor) en badges over al je
  opgeslagen routes; nieuwe badge = confetti. Alles lokaal, geen account.
- ✦ **Apex Pro (freemium)** — basis gratis en volledig bruikbaar; gratis gebruikers
  hebben per dag 3 AI-routes en 5 GPX-downloads, Pro is onbeperkt. Productie-aankopen
  lopen via een server-side Stripe Checkout-sessie en worden bij terugkomst geverifieerd.
- 🚗 **Voertuig kiezen** (auto / motor / fiets / wandelen) — de export naar Google Maps
  gebruikt het juiste reismodel (`driving` / `bicycling` / `walking`). Met een
  `ORS_API_KEY` krijgen fiets en wandelen echte routing in plaats van een schatting.
- 🚫 **Vermijd snelwegen** via instellingen (OSRM `exclude=highways`).
- 📏 **Slinger-score** die aangeeft hoe kronkelig je route is.
- 🔗 **Exporteren** naar Google Maps, Waze en GPX.
- ✨ **Geen account nodig** — opgeslagen routes en voorkeuren blijven lokaal in
  je browser; routingrequests lopen via begrensde server-API’s naar de ingestelde provider.
- 📴 **Offline-fallback** — zijn OSRM/Nominatim onbereikbaar, dan schat de app de
  route in (hemelsbrede lijn met wegenfactor) zodat de UI nooit leeg blijft.

> **Waarom niet élke bocht in Google Maps?** De gratis Google Maps URL-API accepteert
> max ±9 tussenankers. Echte eigen turn-by-turn in de Google Maps-app vereist hun
> betaalde Navigation SDK (native app). Apex Routes kiest daarom representatieve ankers
> voor Google en levert een standaard-GPX met routelijn en beschikbare afslagpunten.
> Navigatie-apps kunnen die GPX verschillend interpreteren; controleer de import.

## Meertalig, lidmaatschap & vindbaarheid (taak 11)
- **Talen**: NL (standaard) · EN · FR · DE — pill rechtsboven op de landing én alle gids-pagina's; voorkeur in `localStorage` (`apex-routes:lang`); chat-placeholder meertalig; gids-pagina's tonen buiten NL een "deze gids is nog Nederlands"-hint.
- **Lidmaatschap in drie lagen**: Basis gratis (3 AI-routes + 5 GPX-downloads/dag) · Supporter €2,99/maand (10 + 15 GPX-downloads) · Pro €5,99/maand · €39/jaar · €99 lifetime (alles onbeperkt). Checkout en periodieke statuscontrole lopen server-side via Stripe. Publieke demo-codes staan in productie uit, tenzij een preview ze expliciet activeert.
- **AI/Google-vindbaarheid**: `public/llms.txt` voor ChatGPT/Claude/Perplexity (wat de site doet, pagina's, data en bronnen), `src/app/sitemap.ts` met prioriteiten, `robots.ts` → sitemap, en JSON-LD `WebSite`-schema in `layout.tsx`.
- **App-keuzegids** (Advisor §09): welke navigatie-app waarvoor — auto → Google Maps/Waze, motor → Kurviger/Calimoto, fiets → Komoot/OsmAnd, wandelen → Komoot/AllTrails — met per profiel hoe Apex daarop aansluit (slimme ankers, GPX met afslagen).

## Forum, account & topo-kaart (taak 11+, "ga door tot je niets meer kunt bedenken")
- **Apex Forum** (`/forum`): community voor rijders/fietsers/wandelaars — 6 rubrieken, hartjes, foto's bij berichten, team-startdraaden. Lokaal-eerst (`localStorage` `apex-routes:forum`); een gesprek delen = link (volledig gesprek in de URL-hash, foto's blijven buiten de link). Verwerkt gedeelde links via `#f=…` met import-knop.
- **Lokaal profiel**: een optioneel naam/e-mailprofiel (`apex-routes:account`, geen wachtwoord) blijft in de browser en kan checkoutvelden vooraf invullen. Dit is nadrukkelijk geen gesynchroniseerd serveraccount.
- **Topo-kaartlaag**: derde stijl in de planner naast Kaart/Satelliet — Esri World Topo Map (sleutelvrij, terreinschaduw, attribution in de kaart) met automatische fallback. OpenTopoMap is geschrapt: die serveert bij drukte "API key required"-tegels.
- **Steun-boodschap** nu ook in de voetsters van Atlas, Advisor, Kalender en Ritbank (link naar `/#pricing`), en de slot-CTA draagt de regel "Geniet van de natuur en ga erop uit" in vier talen.

## 2026-look (visuele doorslag)
- **Bento-functies met fotografie**: zes kaarten (2 bred + 4 smal, perfect raster) met routescape-achtergronden, nummering 01–06, lucide-iconen in glas-chips en geanimeerde micro-visuals (typende chat-bubbels, zichzelf tekenende routelijn, pulserende tank-POI's, deellink+copy, app-chips, hoogteprofiel + weer).
- **Emoji-vrij en volwassen**: alle functionele icoontjes op landing, roulette, atlas, 404 en chips zijn nu lucide-iconen; 🎲→Dices, 📏/⛰️→Route/TrendingUp, 🗺️→MapPinned; de rouletterand kreeg ✦-markers.
- **Header**: sticky glass-nav met lucide-nav, gele accent-iconen, **mobiel hamburgermenu** (slide-over met alles: links, import, taal, CTA) en een **scroll-voortgangsbalk** bovenin.
- **Footer**: vijf kolommen (merk + steun-CTA, Plannen, Ontdekken, Community, Waarom Apex), topo-hoogtelijnen-achtergrond, bronvermelding (OpenStreetMap · Esri · Open-Meteo) en taalwisselaar.
- **CSS-laag** (`globals.css`): `.photo-card` (zoom + veil-gradient + rand-gloed), `.route-draw`, `.poi-dot`, `.typing-dot`, `.topo-lines`, `.scroll-progress` — allemaal met `prefers-reduced-motion`-vangnet.

## NIGHTDRIVE v4 — het site-brede thema
- **Filmische basis**: asfalt-zwart (`#050507`) met een warme gouden gloed bovenin en koele diepte onderin (fixed radial tint), goud-shimmer in gradient-tekst, strakkere kop-typografie (`-0.035em`).
- **Knoppen & glas v2**: `btn-brand` is nu een gegoldegradient (`#ffe600→#ffb300`) met binnen-hooglicht en lift bij hover; `glass` heeft haarline-bovenlicht en saturatie; `btn-ghost` krijgt gouden rand bij hover.
- **Één nav-vorm overal**: zwevende `.site-nav` (afgerond, schaduw, hairline) op de landing én alle vijf de gids-pagina's — plus een **gouden scroll-voortgangsbalk** op elke pagina (`ScrollProgress`, reduced-motion-proof).
- **Koplamp-effect** in de hero: een langzaam vegende lichtbundel (`mix-blend-mode: screen`).
- **Mono-eyebrow** (`.eyebrow`) als signatuurlabel; scrollbar, selectie en focus in thema; alle animaties achter `prefers-reduced-motion` afgezet.

## APEX GRID v5 — scherpe, technische jas
- **Radii-systeem**: nergens meer zachte pilvormen — kaarten/panels 12px, knoppen/chips/invoer 8px, mini-chips 6px; cirkels alleen waar het echt cirkels zijn (roulettewiel, stippen, avatar). Sweep over 20 componentbestanden + CSS-tokens (`.glass`, `.site-nav`, `.lux-card`, `.btn-*`, `.pro-chip`).
- **Overflow-fix**: foto-achtergronden blijven nu netjes binnen hun kader (`.photo-card { overflow: hidden }`), ook bij de zoom bij hover.
- **Signatuur-accenten**: gouden viewfinder-hoekmarkeringen bij hover (`.corner-frame` op bento-kaarten en het kaartpaneel), dunne racing-streep bovenaan de Pro-kaart (`.stripe-accent`) en hairline-sectiescheiders met ruit-marker (`.rule-mark`).

## Instrumenten-dial + toolpagina's (v6.1)
- **Route Roulette is een echt instrument**: tachometer-dial (metalén buitenring, 50 schaalstrepen, regio-labels in mono langs de schaal, sector-leds die oplichten bij de uitslag) met een naald met tegengewicht die realistisch uitdempt — dezelfde spin-logica.
- **/checklist**: interactieve vertrek-checklist per voertuig (motor/auto/fiets/wandelen): 4 secties, ~25 items met hints, voortgangsbalk, vinkjes bewaard in de browser (`apex-routes:checklist:*`), 100% = "geniet van de natuur en ga erop uit".
- **/gpx**: toolpagina over routebestanden — formaat-herkenner (GPX/KML/TCX/FIT/GeoJSON), export-matrix per app (Maps-ankers, Waze, Kurviger, OsmAnd, Komoot, Garmin) en FAQ (waarom 11 ankers, mobiel importeren).
- **Dode elementen levend**: de drie stappen-kaarten op de landing zijn nu klikbare CTA's (open app / app-keuzegids) met arrow-chips en corner-frame; forum krijgt een eigen community-band op de landing (in 4 talen) met rubriek-chips.
- **Fixes**: dubbele rasterweg (grid-bg-laag verwijderd, body-raster blijft), `.hl` highlight is nu een dunne markeer-streep onder de tekst i.p.v. een dikke balk.

## Planner-jas ronde 2 (v6.2)
- **Samenvatting**: mono-labels en mono-waarden op afstand/rijtijd, weer-chip met lucide-weericoon (zon/regen/mist/sneeuw/bliksem naar Open-Meteo-code) i.p.v. emoji.
- **Routebeschrijving**: genummerde mono-indeces, km-chips die bij hover geel oplichten, chevron-inklap i.p.v. pijltjes-tekens.
- **Garage-badges**: lucide-iconen in vierkante chips (Flag/Medal/Trophy/Library/Globe/Wind/Wrench) i.p.v. emoji's — gegrendelde badges gedempt.
- Planner volledig emoji-vrij (voertuig-dropdown, POI-knop, waypoint-chips).

## Bento-ronde kalmeren (v6.3) — audit A-Z
- **Features compact**: 3×3-raster met gelijke kaarten; foto's zijn nu kleine 72px-thumbnails die bij het onderwerp horen (apps/navigatie-kaart heeft geen foto — de app-chips zijn het beeld; circuit-foto is daar geschrapt). Geen full-bleed achtergronden meer.
- **Elke kaart werkt**: alle zes functie-kaarten zijn echte links (planner openen · Ritbank · GPX-gids) met CTA + pijl — niets lijkt nog klikbaar zonder het te zijn.
- SpotlightCard/photo-bg volledig verwijderd (ongebruikt na de compacte zetting).

## Perfectie-sweep top-tot-bodem (v6.4)
- **Typografie-schaal**: 138 halve pixelgroottes gesnapt naar een strakke schaal (10/11/12/13/14/15/16/17) over álle componenten; mono-data (km, timers, procenten) heeft nu `tabular-nums` — cijfers springen niet meer.
- **Eén ink-systeem**: pagina-achtergronden unified naar `#050507` (STARTGRID-ink) met één raised-surface `#0e0e11`; body én leaflet-container volgen.
- **Logische volgorde** op de landing: hero → kaart → features → stappen → roulette → tellers → poll → forum → pricing → CTA (eerst wát het doet, dán het spel); sectienummering 01/02/03 doorgetrokken.
- **Dode code eruit**: photo-card/photo-bg/photo-veil/wheel-glow CSS volledig geschrapt, pro-card-klas weg, spotlight-card blijft (in gebruik op Advisor); rasters/paddings gelijkgetrokken (gap-3, p-6).
- sw v14; 170/170 tests, build 12 pagina's groen.

## Gelijkvloersing alle pagina's (v6.5)
- **Mono-eyebrow overal**: elke pagina opent nu met het signatuurlabel — ATLAS / · ADVIES / · KALENDER / · RITBANK / · FORUM / · TOOL / · PLAN / — en de negen Advisor-sectielabels gebruiken dezelfde `.eyebrow`-stijl.
- **Eén kaartenritme**: alle kaart-roosters op gids-pagina's draaien op gap-3 (zelfde dichtheid als de landing); hero-badges uniform 12px.
- **Standaard hover-lift**: elke lux-card tilt 2px bij hover (uit bij prefers-reduced-motion) — één consistent aanraaksignaal.
- Formats-regel onder de landings-CTA's is nu een data-ticker (mono, hoofdletters).
- sw v16; 170/170 tests, build 12 pagina's groen.

## Verbeteringen ronde 7 (v6.6)
- **OG-share-image** (`public/og.jpg`, 1200×630): merkkaart met gouden routelijn — WhatsApp/Forums/social previews tonen nu een echte kaart i.p.v. niets (openGraph + twitter metadata).
- **Escape-toets** sluit het lidmaatschapsvenster, het forumpaneel en het mobiele menu.
- **Emoji-arm 100%**: laatste resten (forum-leegtoestand, account/regelcadeau in het dialoogvenster, ♥/👑 actieve tier) zijn lucide-iconen.
- **Planner "Mijn routes"-paneel**: eyebrow-kop + monokaartjes (afstand · datum).
- **Eerste verfrissing**: hero-afbeelding van de Advisor krijgt `priority` (snellere LCP).
- sw v17; 170/170 tests, build 12 pagina's groen.

## Perfectie-lus 5× (v6.7)
1. **Performance**: Next image-formats avif+webp; de vijf CSS-thumbnails zijn aparte 280px-WebP's (6–17 KB i.p.v. 150–280 KB, ~90% lichter).
2. **Planner meertalig**: PLANNER-dict (4 talen, 21 strings) — kaartstijlen, acties, samenvatting, weer en "Mijn routes" volgen de taalknop.
3. **Structured data**: FAQPage-schema op /gpx (4 vragen) en WebApplication-schema site-breed — rijkere Google-snippets.
4. **Toegankelijkheid**: skip-links op alle 8 pagina's (`#apex-main`), `<html lang>` schakelt live mee met de taalknop.
5. **Cleanup**: CSS-klassen-audit — alles in gebruik, nul dode regels; sw v18.

## Ronde 8: agenda-export, PWA-shortcuts, sneltoets, E2E (v6.8)
- **iCal-export** (`lib/ical.ts` + 6 tests): elke kalender-event krijgt een "In mijn agenda"-knop — .ics met midmaand-herinnering, periode/toegang/URL in de omschrijving, bronvermelding naar de organisator.
- **PWA-shortcuts**: lang-indrukken op het icoon geeft direct Planner · Vertrek-checklist · Forum · Kalender.
- **Pro-sneltoets**: `/` focust de chat (niet terwijl je typt); chat is een `role="log"` met `aria-live` — screen readers horen antwoorden.
- **Playwright E2E** (`npm run e2e`, 6 tests): home+nav, taalwissel incl. html-lang, planner+/-sneltoets, checklist-persistentie, forum-draad, FAQ. Browser vereist `npx playwright install chromium` (in deze sandbox geblokkeerd; suite is klaar voor CI/lokaal).
- *(Onderweg sandbox-incident: .git teruggedraaid naar basis — volledige werk hersteld en als commit 5bd82f8 veiliggesteld.)*
- sw v19; 176/176 unit-tests, build groen.

## Ronde 9: header-ordening + bewezen import/navigatie-keten (v6.9)
- **Header**: alle nav-knoppen op elke pagina zijn nu exact even groot (h-10 · px-3.5 · 13px) — inclusief Pro-chip, taalwisselaar, hamburger en "Naar de planner"-knop (ook het label overal gelijkgetrokken).
- **Chat**: `/`-sneltoets-hint als mono-kbd-chip in het veld (verdwijnt zodra je typt/focust).
- **Keten bewezen** (`lib/__tests__/routeflow.test.ts`, 9 tests): alle 7 bestandsformaten geaccepteerd en foute geweigerd; GeoJSON/FeatureCollection-parsing en garbage->null; Nederlandse turn-by-turn ("Sla linksaf naar de Kerkstraat", autoweg-onderscheid "naar A2", "Keer om") met cumulatieve afstanden en depart-filter; ankers max 11 met start/eind; Google Maps-URL met api=1, origin/destination, pipe-waypoints, dir_action=navigate en travelmode per voertuig. routing.ts/navigation.ts importeren type-only + relatief zodat de keten ook buiten Next te testen is.
- sw v20; 185/185 tests, build groen.

## Ronde 10: volledig emoji-vrij (v6.10)
- **Zoeksweep over de hele codebase**: 321 emoji-restanten gevonden en verwijderd — chat/wizard-antwoorden, snelle antwoorden, forum-categorieen, kalender-vlaggen (landcode staat al bij de plaats), regio-chips, roulettethema's, parser-bevestigingen, footer-regels in 4 talen, steun-regels, errorpagina, POI-markers.
- **Vervanging door lucide-icoontjes of pure typografie**: voertuigkaarten (Car/Motorbike/Bike/Footprints/Smartphone), garage (Motorbike), errorpagina (Route), AI-chip (Zap), drop-overlay (FileUp); slingerschaal nu mono `≈ ≈≈ ≈≈≈`; kaart-POI's krijgen inline lijn-SVG's (lucide-stijl) i.p.v. emoji.
- Overgehouden symbolen zijn bewust typografisch (vinkje, ster, ✦) — geen enkele kleurrijke emoji meer op de site; POI-iconen zijn nu ook scherper op alle platformen.
- Onderweg: Landing-footer-links naar `next/link` (2 lint-warnings weg) en inspringing van wizard/planner intact gehouden na de sweep.
- sw v21; 185/185 tests, lint 0 warnings, build groen.

## Ronde 11: stops-lijst, forum-zoekveld, FIT-edge-cases (v6.11)
- **Stops langs de route** (planner): zodra de POI-laag aanstaat verschijnt een leesbare data-lijst — dichtstbijzijnde eerst, per stop de soort (Tanken/Laden/Uitzicht met lucide-lijnicoon) en de afstand tot de route in mono-cijfers; klik op een regel en de kaart vliegt erheen. Meertalig (PLANNER +5 strings x4).
- **Forum-zoekveld**: live zoeken over titels, regio's en berichten, gecombineerd met de bestaande rubriekfilters; lege-staat onderscheidt "niets gevonden" van "nog leeg".
- **STARTGRID-audit**: pil-hoekjes (rounded-full) op forum-filterknoppen vervangen door 4px-hoeken; overige ronde vormen zijn legitiem (avatar's, wielen, spinners, progress).
- **FIT-tests +3** (188 totaal): 14-byte header met CRC-velden, gecomprimeerde tijdstempelberichten worden veilig overgeslagen, afgebroken bestanden crashen nooit.
- sw v22; 188/188 tests, lint 0 warnings, build groen.

## Ronde 12: eigen checklist-items + kalender-detail (v6.12)
- **Eigen items op de vertrek-checklist**: nieuwe sectie onder de standaardsecties — voeg toe wat jij nooit wil vergeten (max 12, Enter of knop), vink ze aan als gewone items, verwijderen met de X. Bewaard per voertuig in de browser (apex-routes:checklist-custom:{voertuig}), telt mee in de voortgangsbalk. Lib + 3 tests (ronde 191).
- **Kalender**: lege-status bij filters zonder resultaten ("niets in deze combinatie") en de huidige maand krijgt een gele markering in de maandband.
- **E2E uitgebreid**: checklist-test dekt nu ook een eigen item toevoegen én bewaren na verversen (6 flows, draait lokaal/CI).
- sw v23; 191/191 tests, lint 0, build groen.

## Ronde 13: ritbank-zoekveld, kalender-nu-sprong, kwaliteits-audits (v6.13)
- **Ritbank-zoekveld**: live zoeken in ritverslagen (rijder + tekst) gecombineerd met de categorie-filter.
- **Kalender-nu-knop**: springt naar de huidige maand en scrollt de maandband netjes mee (CalendarClock-icoon).
- **STARTGRID**: laatste grote hoekradius overtredingen weg (Ritbank 22px/18px-kaarten naar 4px).
- **Audits schoon**: alle extern links hebben rel=noopener, 0 console.log, 0 TODO/FIXME, 0 any, icon-knoppen hebben labels, geen img zonder alt (11 kandidaten bleken vals alarm).
- sw v24; 191/191 tests, lint 0, build groen.

## Ronde 14: breadcrumb-schema + laadstaat (v6.14)
- **BreadcrumbList-JSON-LD** op alle 6 toolpagina's (lib/schema.ts + 2 tests): Home > Ontdek/App-advies/Kalender/Ritbank/Forum/Vertrek-checklist — betere structuursnappen voor Google en AI-assistenten.
- **Route-level loading.tsx**: STARTGRID-laadstaat (logo + gele spinner) i.p.v. een leeg scherm tijdens code-splitsing.
- Audits bevestigd: security-headers, per-pagina metadata, complete sitemap, gebrandede 404 en offline-fallback waren al in orde.
- sw v25; 193/193 tests, lint 0, build groen.

## Ronde 16: POI-retry, Escape op zoekvelden, pijltjes in stops-lijst (v6.16)
- **POI-ophalen robuuster**: bij een netwerkstoring of 500 van de Overpass-proxy wordt het automatisch opnieuw geprobeerd (2 pogingen, 1,2 s ertussen) — getest met stubbed fetch (2 tests, totaal 195).
- **Escape wis de zoekvelden** van forum en ritbank.
- **Pijltjestoetsen** navigeren door de stops-lijst in de planner (AnchorUp/Down, focust de knoppen, wrap-around).
- Chat-taalwissel geaudit: oude antwoorden blijven NL (by design — de chat is NL, de UI 4 talen); alleen labels schakelen live mee.
- sw v27; 195/195 tests, lint 0, build groen.

## Ronde 17: best-of-the-best features overgenomen (v6.17)
Research bij de topsites (Kurviger, Calimoto, REVER, Komoot, RideWithGPS) en de sterkste ontbrekende features nagebouwd:
- **Rondrit-generator** (Calimoto's troef, bij reviewers het verschil met Kurviger): knop *Rondrit* in de planner + km-chips (50-300) genereert een lus vanaf je startpunt — 6-10 ankers op een cirkel met jitter (deterministische seed, lib/loopgen.ts), daarna legt de routing-engine alles op echte wegen. Sleep ankers om bij te schaven.
- **Tankbereik-advies** (touring-praktijk): motor ~250 km, auto ~650 km — boven 90% van het bereik verschijnt een waarschuwing in de samenvatting met de tankstop-laag ernaast (lib/fuelrange.ts, meertalig).
- Pariteit bevestigd met de top: highway-vermijding (Kurviger), GPX-export met turn-by-turn, POI-laag, hoogteprofiel, weer, community (REVER), meertalig.
- 9 nieuwe tests (loopgeometrie, determinisme, bereikgrenzen); totaal 204. sw v28.

## Ronde 18: rit-opname + kronkel-stijl in de roulette (v6.18)
- **Rit opnemen** (REVER/Calimoto-tracking, maar lokaal en gratis): knop op de Ritbank start een GPS-opname — live km + mm:ss, ruisfilter (accuracy > 75 m en stappen < 5 m vallen weg), stoppen zet het verslag klaar ("12,4 km in 43 min") om op het prikbord te plakken. Netjes afgehandeld bij geweigerde locatie of geen signaal.
- **Kronkel-stijl in de Route Roulette** (Kurviger/Calimoto's curvy-voorkeur): elke regio heeft nu een kronkelfactor 1-10; kies Rustig (<= 5) / Mix / Kronkel (>= 7) vóór het draaien — Zeeland-valt-nooit-bij-Kronkel en Alpen-nooit-bij-Rustig, statistisch getest (20 seeds per stijl).
- 3 nieuwe tests (totaal 207); llms.txt bijgewerkt. sw v29; lint 0, build groen.

## Ronde 19: Apex Kalender compleet herbouwd (v6.20)
- **3x meer data (20 → 52 events)**: het volledige Belgisch rallykampioenschap (Haspengouw t/m Spa Rally) + 7 Nederlandse rally's (ELE, GTC, Hellendoorn, Twente...), 11 MTB-marathons (Roc d'Ardenne, Bartje 200, Veldslag om Norg, Hammerstone, Red Rock Challenge LU...), ING Night Marathon (LU), Brussels Motor Show, Motorbeurs Utrecht en de kerstcross van Zolder — bronnen (autosport.be, achtmaalserallyclub.nl, marathonmtb.be, mtbmarathon.nl) in elk event vermeld.
- **Landen-filter**: Nederland · België · Luxemburg · Duitsland · Frankrijk, met aantallen per chip.
- **Chronologische orde**: events staan nu gegroepeerd per maand (jan → dec) met maandkoppen en tellingen i.p.v. door elkaar.
- **Geen dode filters meer**: elke maand heeft events (dec = winterstop met de kerstcross) en mountainbike+oktober geeft er 3 — statistically getest (212/212).
- Nieuwe categorie Rally's (Megaphone-icoon); tellerbalk toont actieve filters; sw v30.

## Ronde 20: kalender 2026+2027 met toeschouwer-agenda (v6.21)
- **80 deelnemer-events 2026** (was 52): Duitse marathons (Hamburg, Frankfurt, Köln, München), NL-loops (CPC, Dam tot Dam, Zevenheuvelen, Eindhoven), 20 km Brussel, Rad am Ring en Cyclassics — alles particulier inschrijfbaar.
- **Nieuwe sectie "Kaartjes & pro-racing" (17 toeschouwer-events)**: F1 Spa (17-19 jul) en Zandvoort (21-23 aug sprint), MotoGP Assen/Sachsenring, WSBK, EWC 8h Spa, 24h Spa (25-28 jun), WEC 6h, ADAC 24h Nürburgring, Truck GP, Oldtimer GP, Bikers' Festival, 24h Zolder, Deutschland Tour, wielerklassiekers (RVV, LBL, Waalse Pijl, Gent-Wevelgem) en de Zesdaagse — met kaartjes-links; eigen ticketverkoop op de roadmap.
- **Jaar-tab 2026/2027**: 2027 spiegelt de jaarlijkse events (unieke ids, eerlijke "data via bron"-disclaimer); iCal gebruikt het juiste jaar.
- Totaal 216/216 tests; sw v31.
## Ronde 21: live-feeds — de kalender vernieuwt zichzelf (v6.22)
- **Automatische feed-koppeling** (`lib/eventsfeed.ts` + `GET /api/events`): de kalender haalt openbare iCal-abonnementen op (F1 2026, WEC 2026, WRC 2026 — geverifieerde publieke ICS-bronnen) en vernieuwt zichzelf elke 30 minuten via ISR-cache. Geen handmatige updates meer.
- **Afgelastingen direct zichtbaar**: STATUS:CANCELLED uit de feed wordt een rode "Afgelast — via feed"-badge met doorgestreepte titel (weer, organisator, kalenderwijzigingen).
- **Robuust**: per-feed time-out (6 s) en foutafhandeling — een onbereikbare bron krijgt een amber "onbereikbaar"-chip, de basisagenda 2026/2027 blijft altijd gelden. iCal-parser (unfolding, datum-/datetime-formaat, locatie, URL) puur en getest (5 tests, 221 totaal).
- Uitbreidbaar: nieuwe feed = 1 regel in EVENT_FEEDS (MotoGC/NL-BE-organisatoren volgen zodra ze een publiek ICS hebben).
## Ronde 22: zwaarte-indicatie, feed-cron, kalender-zoekveld (v6.23)
- **Zwaarte (Komoot-stijl)**: lib/difficulty.ts zet klimmers tegenover afstand met strengere drempels voor fiets/wandelen (10 hm/km = glooiend voor de auto, heuvelachtig voor de racefiets) — chip in de routesamenvatting met totaal hm en hm/km, 4 talen, 4 tests.
- **vercel.json cron**: /api/events elke 30 minuten aangeroepen — de live-feeds blijven vers ook zonder bezoekers.
- **Kalender-zoekveld**: live zoeken op eventnaam en plaats (Escape wist), over zowel de deelnemers- als de kaartjes-agenda.
- 225/225 tests; sw v33.
## Ronde 23: agenda in één klik (v6.24)
- **"Alles naar mijn agenda"**: de hele (gefilterde) kalenderselectie — deelnemers én kaartjes-events — als één .ics-bundel (buildIcsBundle: één VCALENDAR, unieke UIDs, +1 test → 226).
- sw v34.
## Ronde 24: A/B-varianten + deel-afbeelding (v6.25)
- **Vergelijk varianten** (Kurviger-stijl): bij auto/motor rekent de planner stilletjes een alternatief met omgedraaide snelweg-voorkeur — kaart toont km + "vermijdt/gebruikt snelwegen" en knop "Rij variant B" past hem direct toe.
- **Deel-afbeelding** (REVER-stijl): social-card 1200x630 in STARTGRID-stijl (blueprint-raster, gele routelijn met gloed, start/eind-markers, km + kronkel-score + branding) als PNG-download; geometrie-normalisatie puur en getest (lib/sharecard.ts, 3 tests, 229 totaal).
- sw v35; lint 0, build groen.
## Ronde 25: verdienmodel uitgebouwd (v6.26)
- **Per-plan checkout (historisch, inmiddels aangescherpt)**: de eerste versie gebruikte statische Stripe-links. De huidige implementatie maakt uitsluitend server-side Checkout Sessions die aan een anonieme installatie zijn gekoppeld; zo wordt nooit betaald zonder verifieerbaar entitlement.
- **Hotel-affiliate**: knop "Hotel voor deze rit" in de planner zoekt op Booking.com bij de eindbestemming; met `NEXT_PUBLIC_BOOKING_AID` in Vercel rijdt de partner-id automatisch mee (getest).
- **Conversie-drivers**: deel-afbeelding toont bij de gratis laag een subtiele regel ("Supporters delen zonder deze regel") en bij Pro een PRO-chip; Ritbank-posts van leden krijgen een PRO-chip naast de naam.
- Inkomstenstromen nu: lidmaatschappen (3 tiers + proefmaand), hotelcommissie, kaartjes-doorverwijzing (kalender, roadmap: eigen verkoop), later partner-events/witte-label.
- 232/232 tests; sw v36.
## Ronde 26: klimbibliotheek + partnerpagina (v6.27)
- **/klimmen**: 15 beklimmingen NL/BE/DE (Cauberg 785 m/7,8%/13,2% geverifieerd, Camerig langste, Koppenberg, Muur, Schauinsland...) met mono-statistieken (lengte/gem/max/hm), land- en oppervlaktefilters, kassei/keien-badges en "Plan rit over deze klim" (kopieert de opdracht en opent de planner). Bronvermelding + indicatief-disclaimer; 3 tests (235) op dataconsistentie (max >= gem, hm-bandbreedte, landen bezet).
- **/adverteren**: partnerpagina met drie pakketten (event-promotie, seizoenspartner, hotelcommissie) — de directe verkoopdeur naast Stripe en affiliate.
- SEO: sitemap + llms.txt + breadcrumb-schema + footer-links op de landing (4 talen). sw v37.
## Ronde 27: Alpen-cols, Vlaamse kasseien, partner-aanvraagformulier (v6.28)
- **/klimmen nu 28 beklimmingen** (was 15): de grote Alpen-cols — Alpe d'Huez (13,8 km/8,1%/1135 hm, geverifieerd), Galibier, Tourmalet, Izoard, Madeleine, Stelvio, Mortirolo, Furka, Grossglockner en Timmelsjoch (tolwegen eerlijk vermeld) — plus Oude Kwaremont, Taaienberg en Kruisberg voor de Vlaamse kasseienbibliotheek. Land-chips: NL/BE/DE/FR/IT/CH/AT. Alpen = hoogste reis-intent (hotelboekingen, Pro-lidmaatschap).
- **Partner-aanvraagformulier** op /adverteren (zero-backend): bedrijf/e-mail/pakket/bericht opent een kant-en-klare mailto naar partners@apexclusive.nl, met kopieer-fallback; buildPartnerMailto puur getest.
- EventCountry uitgebreid met IT/CH/AT (kalender-UI ongewijzigd); 4 nieuwe tests (238): Alpen-cols aanwezig, tolwegen vermeld, kasseibibliotheek compleet, mailto-encoding. sw v38.
## Ronde 28: col-detailpagina's — 28 statische klimpagina's (v6.29)
- **/klimmen/[id]**: elke klim krijgt een eigen pagina (SEO-longtail: "Alpe d'Huez profiel", "Koppenberg percentage") met generateStaticParams + generateMetadata + breadcrumb-schema: stats-tiles, zwaarte-balk t.o.v. de zwaarste col (Timmelsjoch 2029 hm), tolweg-badge, "Plan rit over deze klim", **hotel-knop per klim** (bookingSearchUrl met sponsored-rel) en kruislinks naar landgenoten.
- Bibliotheek-kaarten klikbaar naar detail; hero-tekst nu "Van de Cauberg tot de Stelvio" (28 klimmen, Benelux + Alpen); +1 test op unieke/URL-safe id's (239).
- sitemap: 28 per-klim-URL's (prio 0,7); llms.txt vermeldt detailpagina's. sw v39.
## Ronde 29: ritten-bibliotheek + Rit van de week op de landing (v6.30)
- **/ritten**: 10 samengestelde dagritten (Mergellandroute, Ardennen-Ourthe, kasseienklassieker Vlaamse Ardennen, Eifel/Nordschleife, Sauerland, Moezel, Route des Crêtes — 89 km kamweg geverifieerd —, Schwarzwaldhochstraße B500, Stelvio-meesterwerk, Grossglockner) met km/rijtijd/hoogtepunten, land- en tag-filters (motor/auto/fiets/kassei/panorama), klim-chips naar de bibliotheek, plan-knop (kopieert prompt naar planner) en hotel-knop per rit (sponsored). 4 tests op consistentie en klim-verwijzingen (243).
- **Rit van de week op de landing**: roteert automatisch per week (timestamp-modulus, geen handmatig onderhoud — voldoet aan de automatiseringseis) in 4 talen; plan-knop scrollt naar de planner, hotel-knop direct ernaast. +footer-link "Ritten". sitemap/llms.txt bijgewerkt; sw v40.
## Ronde 30: site-breed hamburger-menu + rit-detailpagina's + delen & OG-kaarten (v6.31)
- **SiteMenu overal**: audit wees uit dat elk paginatopje wel logo→home had, maar op mobiel alle links verdwenen (hidden sm:flex) en /adverteren geen nav had. Nieuw gedeeld hamburger-menu (lib/nav.ts als één bron van waarheid, 3 tests) met alle 11 secties in 3 groepen, geinjecteerd in 10 navs + nieuwe partners-nav; actieve pagina gemarkeerd.
- **/ritten/[id]**: 10 statische rit-detailpagina's (km/rijtijd/klimmen-tiles, hoogtepunten, klim-chips, plan + verblijf + deel-knop, kruislinks; echte 404 bij onbekende id via dynamicParams=false). Ritten-kaarttitels klikbaar.
- **Mond-tot-mond**: ShareButton (Web Share API + WhatsApp/X/e-mail/kopieerlink; buildShareUrls puur +3 tests) op rit- én klimdetail; automatische OG-preview-kaarten (next/og, 1200×630, merkhuisstijl) per rit en klim — gedeelde links zien er nu uit als adverts. Belangrijke catch: lib/share.ts bleek de bestaande route-deelmodule (polyline/encode) — volledig hersteld en social-functies toegevoegd (249/249).
- sitemap +10 rit-URL's; llms.txt; sw v41.
## Ronde 31: seizoensdata, FAQ-met-schema, downloadbare deelkaart (v6.32)
- **Seizoensdata** voor alle 28 klimmen en 10 ritten (indicatief): wintergesloten Alpenpassen (Galibier, Tourmalet, Stelvio, Grossglockner, Timmelsjoch...), kasseien-waarschuwingen, Moezel-wijnoogst-drukte. Zichtbaar als chip (klim) en tile "Beste periode" (rit) — data die bezoekers nergens anders in één oogopslag vinden.
- **Veelgestelde vragen + FAQPage-schema** op alle 38 detailpagina's: volledig data-gedrive­n gegenereerd (lib/faq.ts: steilheid, lengte/hm, oppervlakte, tol, opening, overnachten) — geen handmatig onderhoud, 4 nieuwe tests (253) bewaken vorm en volledigheid. Vouwbare <details>-sectie in merkhuisstijl; JSON-LD maakt ze kandidaat voor rich snippets in Google.
- **Deelkaart-knop** op rit- en klimdetail: genereert client-side een 1080×1080 PNG in merkhuisstijl (raster, gele gloed, stats-blokjes, "PLAN DEZE RIT"-badge) — downloadbaar voor Instagram/WhatsApp-status: mond-tot-mond met het merk erop. sw v42.
## Ronde 32: klimdata verdubbeld + objectieve zwaartescore (v6.33)
- **43 beklimmingen (was 28)**: 15 nieuwe cols op geverifieerde cijfers — **Mont Ventoux** (21,5 km/7,5%/1600 hm vanaf Bédoin), **Cime de la Bonette** (hoogste asfaltweg van Europa, 2802 m), **Col de l'Iseran** (hoogste bergpas van de Alpen), **Cormet de Roselend**, de Dolomieten (**Passo Giau** 9,8 km @ 9,5%, **Pordoi**, **Sella** — cijfers uit de organisatiedata van de Maratona dles Dolomites), **Passo Gavia**, de Zwitserse pasklassiekers (**Grimsel**, **Susten**, **Klausen**, **Nufenen**) en drie Benelux-muren die ontbraken: **Mur de Huy** (finish Waalse Pijl), **Kemmelberg** en de **Keutenberg** met zijn 22%-bordje. Bronnen: climbfinder en organisatiedata.
- **Twee nieuwe datavelden op elke klim**: tophoogte boven zeeniveau (`summitM`) en coördinaten van de top (`lat`/`lon`) — nodig voor de zwaartescore en bruikbaar voor toekomstige kaartweergave.
- **FIETS-index als zwaartemaat** (`lib/climbscore.ts`): de internationaal gebruikte formule van tijdschrift Fiets — `H²/(D×10) + (T−1000)/1000` — plus een eerlijk gemarkeerde Apex-toeslag voor kasseien en keien. Geijkt aan de gepubliceerde referentiewaarden (Mont Ventoux ≈ 12,8, Alpe d'Huez ≈ 10, Cauberg 0,4); een test bewaakt die ijking zodat de formule niet stilletjes kan wegdrijven. Vijf zwaarteklassen van *instap* tot *buitencategorie*, plus indicatieve klimtijden per niveau uit de VAM (600/950/1500 hm per uur).
- **Nieuwe pagina /klimmen/ranglijst**: alle 43 klimmen objectief gerangschikt, met een balk per rij die de score visualiseert, land-filter met tellingen, zwaarteklasse-badges, klimtijd en een plan-knop per regel. **ItemList-JSON-LD** over de top 25 — ranglijsten zijn bij Google kandidaat voor rich results, en "zwaarste beklimmingen" is precies de zoekvraag die deze doelgroep stelt.
- **Klimbibliotheek uitgebreid**: score + ranglijstpositie + zwaarteklasse op elke kaart, een zwaarte-filter en vier sorteeropties (zwaarte, steilste stuk, langste, alfabetisch) in plaats van de vaste sortering op maximumpercentage.
- **Klim-detailpagina**: het blok "Zwaarte in context" toont nu de echte index met klasse-badge, positie in de ranglijst (klikbaar) en drie klimtijden, in plaats van een kale procentbalk t.o.v. de hoogste col.
- **FAQ +2 vragen per klim** ("Hoe zwaar is de ... vergeleken met andere klimmen?" en "Hoe lang doe je over de ...?") — volledig data-gedreven, dus 43 × 2 nieuwe antwoorden in de FAQPage-schema zonder handmatig onderhoud.
- 304/304 tests (10 nieuwe: FIETS-ijking, kwadratische steilheidsweging, kasseitoeslag, klassegrenzen, ranglijst-integriteit, klimtijden, tophoogtes en coördinaten-bounding-box), lint 0, build groen. sitemap +1, sw v46.

## Ronde 33: thema-schakelaar met drie paletten (v6.34)
- **Universele schakelaar** (maan/zon/edelsteen/monitor) in de navigatiebalk van **alle 18 pagina's** — ook op `/adverteren`, dat bij de vorige nav-audit als enige geen navigatie bleek te hebben. Bewust *niet* achter `hidden sm:flex`: het thema is juist op een telefoon relevant. Eén klik wisselt door, het pijltje opent de lijst met omschrijvingen.
- **Drie thema's** in plaats van twee, zodat de merkidentiteit niet achter een schakelaar verdwijnt: **Startgrid** (het bestaande zwart/geel, standaard), **Smaragd** (`#0d1612` / `#16241d`, tekst `#f3f4f6`, accent `#10b981` — exact de gevraagde luxe palette) en **Licht**.
- **Systeem- en geheugenintegratie**: keuze in `localStorage` (`apex-routes:theme`), standaard "Systeem" dat live meeloopt met `prefers-color-scheme` — ook als je het tijdens het browsen omzet. Een tweede tabblad wisselt mee via het `storage`-event.
- **Geen witte flits**: een blokkerend inline-script in de `<head>` zet `data-theme` vóór de eerste paint. Een test draait dat script in een nagebootste browser en vergelijkt de uitkomst met `resolveTheme()` voor alle 8 combinaties, zodat de twee implementaties niet uit elkaar kunnen lopen.
- **Techniek**: geen enkele `dark:`-variant nodig. Tailwind v4 zet alle kleuren om naar `var(--color-*)`, dus de app wordt volledig herthematiseerd door die tokens per `[data-theme]` te herdefiniëren — inclusief het omkeren van de slate-schaal in de lichte modus, waar `white/5`-overlays juist subtiel donker moeten worden. Alle ~50 hardgecodeerde merkkleuren in `globals.css` en de componenten zijn vervangen door tokens; alleen de canvas-deelkaarten en OG-afbeeldingen blijven bewust merkzwart.
- **Kaarttegels per thema**: het invert-filter op de Esri-stratenkaart gaat uit in de lichte modus en wordt groener in Smaragd.
- **Bug gevonden en gerepareerd**: het merkpalet klapt bewust *alle* accentkleuren (emerald, orange, rose) naar geel. Daardoor waren de zwaarteklassen uit ronde 32 in de praktijk allemaal even geel. Ze hebben nu een eigen expliciete schaal (`.zwaarte-*`) die per thema kantelt.
- **Toegankelijkheid getest, niet aangenomen**: `themecontrast.test.ts` leest de echte kleuren uit `globals.css` en rekent het WCAG-contrast uit. Die test vond meteen een echt probleem — wit op de goudknop van het lichte thema haalde maar 3,82:1; het accent is daarop verdonkerd naar `#8a6600`. Alle thema's halen nu AA.
- **Plaatsingstest**: `themeplacement.test.ts` scant de broncode en faalt als een pagina met een navigatiebalk de schakelaar mist of hem achter een breakpoint verstopt — geverifieerd door hem tijdelijk te slopen.
- 322/322 tests (+9 thema, +6 contrast, +3 plaatsing), lint 0, build groen. sw v47; manifest-snelkoppeling naar de klimranglijst.

## Productie-integraties

De kernplanner werkt zonder commerciële sleutels. Voor een productie-uitrol staan alle
variabelen gedocumenteerd in [`.env.example`](.env.example). Vul vóór verkoop ook de
juridische exploitantgegevens (`LEGAL_*`) in; die verschijnen op de juridische
pagina’s. `/herroepen` biedt consumenten een online herroepingsfunctie zonder account.

- **Stripe**: `STRIPE_SECRET_KEY`, vier `STRIPE_PRICE_*`-ids en
  `STRIPE_WEBHOOK_SECRET`. Registreer `/api/billing/webhook` voor
  `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `charge.refunded`,
  `charge.dispute.created`, `invoice.payment_failed`,
  `customer.subscription.updated` en `customer.subscription.deleted`.
  Prijsselectie maakt server-side Checkout Sessions; de browser activeert nooit een
  plan zonder serververificatie en controleert de abonnementsstatus periodiek opnieuw.
  Productie-checkout blijft bewust dicht zolang `LEGAL_NAME`, `LEGAL_ADDRESS`,
  `LEGAL_REGISTRATION`, Resend en het webhooksecret ontbreken: er wordt geen geld
  aangenomen voordat identiteit, ontvangstbevestiging en lifecycle-opvolging werken.
- **E-mail**: `RESEND_API_KEY`, een geverifieerde `RESEND_FROM` en ontvangers voor
  partner-, feedback-, billing- en herroepingsmails (`WITHDRAWAL_EMAIL_TO`). Zonder
  Resend toont de UI een expliciete mailto-fallback; een aanvraag wordt nooit als
  verzonden voorgesteld als dat niet zo is. Voor productie is Resend nodig om na een
  online herroeping direct een ontvangstbevestiging per e-mail te leveren.
- **Analytics**: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` laadt optioneel cookieloze
  funnelmeting. Maak in Plausible custom goals voor `Planner gestart`,
  `Route berekend`, `Route geëxporteerd`, `Checkout gestart`, `Aankoop bevestigd`
  (met revenue), `Affiliate klik` en
  `Partnerlead verstuurd`. Vrije routeopdrachten, coördinaten, namen en e-mail gaan
  niet mee als analytics-eigenschap.
- **Affiliate**: gebruik uitsluitend je toegekende Booking.com `aid` en
  GetYourGuide Partner-ID. Contextuele links bevatten altijd een zichtbare
  commissie-disclosure en `rel="sponsored"`.

De ingebouwde burstlimiter beschermt één warme serverinstantie. Gebruik bij
horizontaal geschaald productieverkeer een gedeelde limiter (bijvoorbeeld Redis/KV)
voor wereldwijd consistente quota.

## Techniek

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) design system (zwart + geel accent)
- [Framer Motion](https://www.framer.com/motion/) voor animaties
- [Leaflet](https://leafletjs.com) voor de kaart
- [lucide-react](https://lucide.dev) iconen

### Routing & geocoding

De app gebruikt openbare OpenStreetMap-diensten via server-side API-routes
(`/api/route`, `/api/geocode`, `/api/reverse`):

- antwoorden worden gecached (in-memory, met TTL) en Nominatim-calls gaan door
  een limiter van max. ~1 request/seconde — conform de
  [usage policy](https://operations.osmfoundation.org/policies/nominatim/);
- invoer wordt gevalideerd (coördinaten, profiel, max. 25 punten);
- de publieke OSRM-demo ondersteunt alléén `driving`; voor fiets/wandelen valt
  de client automatisch terug op een realistische schatting.

Voor productieverkeer raden we een eigen routing-backend aan (eigen OSRM /
Valhalla / GraphHopper) — zie `.env.example`.

#### Echte fiets- en wandelrouting (optioneel)

Zet `ORS_API_KEY` en `/api/route` gebruikt voor fiets en wandelen
[OpenRouteService](https://openrouteservice.org) (`cycling-regular` /
`foot-walking`) in plaats van de schatting. Een gratis account geeft ~2.000
requests per dag. Het antwoord wordt omgezet naar het OSRM-formaat, dus de
Nederlandse routebeschrijving en de rest van de app werken ongewijzigd door.

Zónder key verandert er niets: fiets en wandelen vallen terug op de bestaande
schatting, auto en motor lopen sowieso via OSRM.

> De standaard-host is `api.heigit.org`; `api.openrouteservice.org` is sinds
> april 2026 deprecated en heeft inmiddels een verlaagde quota.

#### Hoogteprofiel

`/api/elevation` bemonstert de route tot maximaal 100 punten en vraagt de
hoogtes op bij Open-Meteo — gratis en zonder key. Is de dienst onbereikbaar,
dan verdwijnt alleen het profiel; de route blijft gewoon staan.

### Optionele AI-laag

Zet `OPENAI_API_KEY` (of een andere OpenAI-compatibele API) aan en `/api/parse`
verrijkt de vrije-tekst parsering. Zonder key valt alles netjes terug op de
ingebouwde Nederlandse regex-parser.

## Structuur

```
src/
  app/            # layout, page-entry, API-routes, design system
                  #   /api: geocode, reverse, route, match, elevation, parse
  components/     # PlannerApp, Landing, RoutePlanner, ElevationProfile,
                  #   InstallPrompt, chat/*, map/PremiumMap
  lib/
    parser.ts     # NL vrije-tekst parser (voertuig, plaatsen, afstand, stijl)
    routing.ts    # OSRM/Nominatim-clients, map matching, GPX, import, exports
    navigation.ts # NL-routebeschrijving + slimme Google Maps-navigatie-ankers
    ors.ts        # OpenRouteService → OSRM-formaat (fiets/wandelen)
    elevation.ts  # bemonstering, klim-/daalmeters, SVG-profiel
    optimize.ts   # volgorde-optimalisatie (nearest-neighbour + 2-opt)
    storage.ts    # opgeslagen routes in localStorage
    share.ts      # deel-links (encoded polyline in de URL-hash)
    wizard.ts     # conversationele flow + routebouwer
    server/       # upstream cache + rate-limiter (server-kant)
    __tests__/    # unit-tests (node:test)
  types.ts        # gedeelde types
public/           # PWA-manifest, service worker, iconen
scripts/          # generate-icons.mjs — PWA-iconen zonder extra dependencies
```

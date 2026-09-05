import test from "node:test";
import assert from "node:assert/strict";
import {
  parseAttribution,
  isFreshAttribution,
  sanitizeAnalyticsProps,
} from "../analytics.ts";

test("analytics:UTM-attributie en alleen referrer-host worden gelezen", () => {
  const item = parseAttribution(
    "?utm_source=nieuwsbrief&utm_medium=email&utm_campaign=herfst",
    "https://example.com/pad?persoon=verborgen",
    1_000
  );
  assert.deepEqual(item, {
    source: "nieuwsbrief",
    medium: "email",
    campaign: "herfst",
    content: undefined,
    referrer: "example.com",
    capturedAt: 1_000,
  });
});

test("analytics:lege attributie levert null", () => {
  assert.equal(parseAttribution("?plan=Eifel", ""), null);
});

test("analytics:attributie verloopt na dertig dagen", () => {
  const now = 40 * 86_400_000;
  assert.equal(isFreshAttribution({ capturedAt: now - 29 * 86_400_000 }, now), true);
  assert.equal(isFreshAttribution({ capturedAt: now - 31 * 86_400_000 }, now), false);
  assert.equal(isFreshAttribution({ capturedAt: "gisteren" }, now), false);
});

test("analytics:props laten alleen veilige korte dimensies door", () => {
  const clean = sanitizeAnalyticsProps({
    source: "x".repeat(100),
    count: 3,
    active: true,
    empty: "",
    "foute-key!": "nee",
  });
  assert.equal(String(clean.source).length, 80);
  assert.deepEqual({ ...clean, source: undefined }, { source: undefined, count: 3, active: true });
});

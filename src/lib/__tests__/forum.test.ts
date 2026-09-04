import test from "node:test";
import assert from "node:assert/strict";
import {
  makeThread,
  withPost,
  sortThreads,
  tidyThreads,
  relTime,
  encodeThread,
  decodeThreadHash,
  toggleLike,
  mergeShared,
  SEED_THREADS,
  isValidCategory,
} from "../forum.ts";

const NOW = 1_700_000_000_000;

test("forum:makeThread valideert categorie, titel, auteur en bericht", () => {
  const t = makeThread("motor", "  Mooiste B-wegen   Zuid-Limburg ", "Sam", "Tips?", "Limburg", NOW);
  assert.ok(t);
  assert.equal(t.category, "motor");
  assert.equal(t.title, "Mooiste B-wegen Zuid-Limburg");
  assert.equal(t.region, "Limburg");
  assert.equal(t.posts.length, 1);

  assert.equal(makeThread("vliegtuig", "Titel", "Sam", "hoi", "", NOW), null);
  assert.equal(makeThread("motor", "ab", "Sam", "hoi", "", NOW), null);
  assert.equal(makeThread("motor", "Titel", "S", "hoi", "", NOW), null);
  assert.equal(makeThread("motor", "Titel", "Sam", "   ", "", NOW), null);
});

test("forum:withPost voegt een reactie toe en tikt de activiteit bij", () => {
  const t = makeThread("apps", "Welke app?", "Sam", "Kurviger of Maps?", "", NOW)!;
  const next = withPost(t, "Noor", "Allebei!", NOW + 5000);
  assert.ok(next);
  assert.equal(next.posts.length, 2);
  assert.equal(next.lastAt, NOW + 5000);
  assert.equal(withPost(t, "N", "kort", NOW), null);
});

test("forum:sortThreads zet eigen actieve draaden boven team-draaden", () => {
  const a = makeThread("motor", "Draad A", "Sam", "hoi", "", NOW)!;
  const b = makeThread("auto", "Draad B", "Kim", "hoi", "", NOW + 1000)!;
  const sorted = sortThreads([SEED_THREADS[0], a, b]);
  assert.equal(sorted[0].title, "Draad B");
  assert.equal(sorted[1].title, "Draad A");
  assert.equal(sorted[2].team, true);
});

test("forum:tidyThreads filtert kapotte entries weg", () => {
  const keep = makeThread("fiets", "Geldig", "Sam", "hoi", "", NOW)!;
  const rest = tidyThreads([keep, { id: "kapot" }, null, "tekst"]);
  assert.equal(rest.length, 1);
  assert.equal(rest[0].id, keep.id);
});

test("forum:relTime formateert menselijk", () => {
  assert.equal(relTime(NOW, NOW), "zojuist");
  assert.equal(relTime(NOW - 5 * 60_000, NOW), "5 min geleden");
  assert.equal(relTime(NOW - 3 * 3_600_000, NOW), "3 uur geleden");
  assert.equal(relTime(NOW - 2 * 86_400_000, NOW), "2 dagen geleden");
  assert.equal(relTime(NOW - 70 * 86_400_000, NOW), "2 maanden geleden");
});

test("forum:URL-codec rondtrip zonder foto's", () => {
  const t = makeThread("wandelen", "Cauberg-trap", "Sam", "508 treden gedaan", "Zuid-Limburg", NOW)!;
  const metFoto: typeof t = {
    ...t,
    posts: [...t.posts, { id: "p2", author: "Kim", body: "Mooi!", at: NOW, photo: "data:image/jpeg;base64,GIJZJG" }],
  };
  const hash = encodeThread(metFoto);
  assert.ok(hash.startsWith("#f="));
  assert.ok(!hash.includes("data:image"), "foto's horen niet in de link");
  const terug = decodeThreadHash(hash);
  assert.ok(terug);
  assert.equal(terug.title, "Cauberg-trap");
  assert.equal(terug.posts.length, 2);
  assert.equal(terug.posts[1].photo, undefined);
  assert.equal(decodeThreadHash("#f=@@@@") ?? null, null);
  assert.equal(decodeThreadHash("#geen-forum"), null);
});

test("forum:toggleLike heen én terug", () => {
  const t = makeThread("auto", "B500", "Sam", "Rijden!", "", NOW)!;
  const een = toggleLike(t, []);
  assert.deepEqual(een.liked, [t.id]);
  assert.equal(een.likes, 1);
  const twee = toggleLike({ ...t, likes: een.likes }, een.liked);
  assert.deepEqual(twee.liked, []);
  assert.equal(twee.likes, 0);
});

test("forum:mergeShared voegt alleen nieuwe draaden toe", () => {
  const t = makeThread("motor", "Eifel", "Sam", "Tips?", "", NOW)!;
  assert.equal(mergeShared([t], t).length, 1);
  assert.equal(mergeShared([t], { ...t, id: "anders" }).length, 2);
});

test("forum:zes categorieen en drie team-draaden als vangnet", () => {
  for (const c of ["motor", "auto", "fiets", "wandelen", "apps", "feedback"]) {
    assert.ok(isValidCategory(c));
  }
  assert.equal(isValidCategory("scooter"), false);
  assert.ok(SEED_THREADS.length >= 3);
  assert.ok(SEED_THREADS.every((t) => t.team));
});

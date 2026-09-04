/**
 * Apex Forum — de praathoek voor rijders, fietsers en wandelaars.
 *
 * Zonder backend is het forum *lokaal-eerst*: gesprekken leven in je browser
 * en een gesprek delen kan via een link (het hele gesprek zit in de URL-hash,
 * net als gedeelde routes). Zo bestaat er vandaag al community — en migreert
 * het model 1-op-1 naar een server zodra die er is.
 */

export type ForumCategory =
  | "motor"
  | "auto"
  | "fiets"
  | "wandelen"
  | "apps"
  | "feedback";

export interface ForumPost {
  id: string;
  author: string;
  body: string;
  at: number;
  /** optionele verkleinde foto (data-url, blijft in deze browser) */
  photo?: string;
}

export interface ForumThread {
  id: string;
  category: ForumCategory;
  title: string;
  /** optionele regio, bijv. "Zuid-Limburg" of "Ardennen" */
  region?: string;
  posts: ForumPost[];
  createdAt: number;
  /** laatste activiteit — sorteersleutel */
  lastAt: number;
  likes: number;
  /** startdraad van het Apex-team */
  team?: boolean;
}

export const FORUM_KEY = "apex-routes:forum";
export const FORUM_LIKES_KEY = "apex-routes:forum-likes";

export const CATEGORY_LABELS: Record<ForumCategory, { label: string }> = {
  motor: { label: "Motor" },
  auto: { label: "Auto & cabrio" },
  fiets: { label: "Fiets" },
  wandelen: { label: "Wandelen" },
  apps: { label: "Apps & navigatie" },
  feedback: { label: "Ideeën & feedback" },
};

export const FORUM_RULES = [
  "Wees aardig — iedereen is hier voor hetzelfde: mooie routes.",
  "Geen spoilers van betalende evenementenroutes; verwijs naar de organisator.",
  "Foto's mogen, zolang ze van jou zijn en de weg centraal staat.",
];

/* ---------- pure helpers ---------- */

function makeId(prefix: string, now: number): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${now.toString(36)}-${rand}`;
}

export function tidyTitle(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function tidyBody(raw: string): string {
  return raw.trim().slice(0, 2000);
}

export function tidyAuthor(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function isValidCategory(value: string): value is ForumCategory {
  return value in CATEGORY_LABELS;
}

/** Nieuw gesprek aanmaken (puur); null bij ongeldige invoer. */
export function makeThread(
  category: string,
  title: string,
  author: string,
  body: string,
  region: string,
  now = Date.now(),
): ForumThread | null {
  if (!isValidCategory(category)) return null;
  const t = tidyTitle(title);
  const a = tidyAuthor(author);
  const b = tidyBody(body);
  if (t.length < 3 || a.length < 2 || b.length < 1) return null;
  return {
    id: makeId("th", now),
    category,
    title: t,
    region: region.trim().slice(0, 40) || undefined,
    posts: [{ id: makeId("p", now), author: a, body: b, at: now }],
    createdAt: now,
    lastAt: now,
    likes: 0,
  };
}

/** Reactie toevoegen (puur); geeft een kopie terug of null. */
export function withPost(
  thread: ForumThread,
  author: string,
  body: string,
  now = Date.now(),
): ForumThread | null {
  const a = tidyAuthor(author);
  const b = tidyBody(body);
  if (a.length < 2 || b.length < 1) return null;
  return {
    ...thread,
    posts: [...thread.posts, { id: makeId("p", now), author: a, body: b, at: now }],
    lastAt: now,
  };
}

/** Meest actieve gesprekken bovenaan; team-draaden zakken onder eigen werk. */
export function sortThreads(threads: ForumThread[]): ForumThread[] {
  return [...threads].sort((x, y) => {
    if (!!x.team !== !!y.team) return x.team ? 1 : -1;
    return y.lastAt - x.lastAt;
  });
}

/** Databescherming: filter kapotte objecten uit opgehaalde data. */
export function tidyThreads(value: unknown): ForumThread[] {
  if (!Array.isArray(value)) return [];
  return value.filter((t): t is ForumThread => {
    if (!t || typeof t !== "object") return false;
    const th = t as Partial<ForumThread>;
    return (
      typeof th.id === "string" &&
      typeof th.title === "string" &&
      isValidCategory(String(th.category)) &&
      Array.isArray(th.posts) &&
      th.posts.length > 0 &&
      typeof th.lastAt === "number"
    );
  });
}

/** Relatieve tijd in het Nederlands ("zojuist", "3 uur geleden", …). */
export function relTime(at: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return "zojuist";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min geleden`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} uur geleden`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} dag${d === 1 ? "" : "en"} geleden`;
  const mo = Math.round(d / 30);
  return `${mo} maand${mo === 1 ? "" : "en"} geleden`;
}

/* ---------- URL-delen (base64url, zonder afhankelijkheden) ---------- */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Gesprek → hash-fragment (zonder foto's: die maken de link te zwaar). */
export function encodeThread(thread: ForumThread): string {
  const lean = {
    v: 1,
    c: thread.category,
    t: thread.title,
    r: thread.region,
    p: thread.posts.map((p) => [p.author, p.body, p.at] as const),
    l: thread.likes,
    team: thread.team || undefined,
  };
  return `#f=${toBase64Url(JSON.stringify(lean))}`;
}

/** Hash-fragment → gesprek; null als het niet klopt. */
export function decodeThreadHash(hash: string): ForumThread | null {
  try {
    if (!hash.startsWith("#f=")) return null;
    const lean = JSON.parse(fromBase64Url(hash.slice(3))) as {
      v: number;
      c: string;
      t: string;
      r?: string;
      p: (string | number)[][];
      l?: number;
      team?: boolean;
    };
    if (lean.v !== 1 || !isValidCategory(lean.c)) return null;
    const posts: ForumPost[] = lean.p
      .filter((p) => typeof p[0] === "string" && typeof p[1] === "string")
      .map((p, i) => ({
        id: `shared-${i}`,
        author: String(p[0]).slice(0, 40),
        body: String(p[1]).slice(0, 2000),
        at: Number(p[2]) || 0,
      }));
    if (posts.length === 0) return null;
    const first = posts[0].at;
    const last = posts[posts.length - 1].at;
    return {
      id: `shared-${toBase64Url(lean.t).slice(0, 10)}`,
      category: lean.c,
      title: String(lean.t).slice(0, 80),
      region: lean.r ? String(lean.r).slice(0, 40) : undefined,
      posts,
      createdAt: first,
      lastAt: last,
      likes: Number(lean.l) || 0,
      team: lean.team || undefined,
    };
  } catch {
    return null;
  }
}

/* ---------- startdraaden van het team (alties aanwezig) ---------- */

export const SEED_THREADS: ForumThread[] = [
  {
    id: "team-welkom",
    category: "feedback",
    title: "Welkom op het Apex Forum — wat wil jij hier terugzien?",
    region: "Overal",
    posts: [
      {
        id: "team-welkom-p1",
        author: "Apex-team",
        body:
          "Dit is de praathoek van Apex Routes. Deel je beste routes, stel vragen over navigatie-apps of zeg wat je van de planner vindt — we lezen alles en bouwen door. Beter goed gejat dan slecht bedacht: jouw tip kan zomaar de volgende functie worden.",
        at: 0,
      },
    ],
    createdAt: 0,
    lastAt: 0,
    likes: 0,
    team: true,
  },
  {
    id: "team-fotos",
    category: "wandelen",
    title: "Foto's van jouw mooiste kilometers — show je route",
    posts: [
      {
        id: "team-fotos-p1",
        author: "Apex-team",
        body:
          "Zit je net boven op de Cauberg of ergens op de Posbank? Deel je foto (knop bij het reageren) en vertel waar hij genomen is. Geniet van de natuur en ga erop uit — en neem de volgende rijder mee via dit forum.",
        at: 0,
      },
    ],
    createdAt: 0,
    lastAt: 0,
    likes: 0,
    team: true,
  },
  {
    id: "team-apps",
    category: "apps",
    title: "Welke navigatie-app gebruik jij onderweg — en waarom?",
    posts: [
      {
        id: "team-apps-p1",
        author: "Apex-team",
        body:
          "In de auto zweren we bij Google Maps (slimme ankers, geen U-turns), op de motor bij Kurviger. Maar nieuwsgierig naar jullie ervaringen met Waze, Calimoto, Komoot en OsmAnd in het buitenland. Welke app wint waar?",
        at: 0,
      },
    ],
    createdAt: 0,
    lastAt: 0,
    likes: 0,
    team: true,
  },
];

/* ---------- opslag (alleen in de browser) ---------- */

export function loadThreads(): ForumThread[] {
  if (typeof localStorage === "undefined") return [...SEED_THREADS];
  try {
    const raw = localStorage.getItem(FORUM_KEY);
    const stored = raw ? tidyThreads(JSON.parse(raw)) : [];
    // team-draaden altijd beschikbaar; eigen draaden uit de opslag
    const own = stored.filter((t) => !t.team);
    const seeds = SEED_THREADS.map(
      (seed) => stored.find((t) => t.id === seed.id) ?? seed,
    );
    return [...own, ...seeds];
  } catch {
    return [...SEED_THREADS];
  }
}

export function saveThreads(threads: ForumThread[]): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(FORUM_KEY, JSON.stringify(threads));
    return true;
  } catch {
    return false;
  }
}

/** Quota vol? Probeer opnieuw zonder foto's (zoals het prikbord). */
export function saveThreadsDroppingPhotos(threads: ForumThread[]): boolean {
  if (saveThreads(threads)) return true;
  const lean = threads.map((t) => ({
    ...t,
    posts: t.posts.map(({ photo, ...rest }) => rest),
  }));
  return saveThreads(lean);
}

export function loadLikedIds(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(FORUM_LIKES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Hartje omzetten (puur op lijst-niveau) — geeft nieuwe lijst + nieuw aantal. */
export function toggleLike(
  thread: ForumThread,
  liked: string[],
): { liked: string[]; likes: number } {
  const has = liked.includes(thread.id);
  return {
    liked: has ? liked.filter((id) => id !== thread.id) : [...liked, thread.id],
    likes: Math.max(0, thread.likes + (has ? -1 : 1)),
  };
}

/** Hartje-toggle inclusief opslag; geeft de nieuwe threads-lijst. */
export function likeThread(
  threads: ForumThread[],
  id: string,
): ForumThread[] | null {
  const liked = loadLikedIds();
  const thread = threads.find((t) => t.id === id);
  if (!thread) return null;
  const next = toggleLike(thread, liked);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(FORUM_LIKES_KEY, JSON.stringify(next.liked));
    }
  } catch {
    /* hartje is niet cruciaal */
  }
  return threads.map((t) => (t.id === id ? { ...t, likes: next.likes } : t));
}

/** Gedeeld gesprek binnenhalen: toevoegen als het nog niet bestaat. */
export function mergeShared(threads: ForumThread[], shared: ForumThread): ForumThread[] {
  if (threads.some((t) => t.id === shared.id)) return threads;
  return [shared, ...threads];
}

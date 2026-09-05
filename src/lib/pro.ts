/**
 * Apex-lidmaatschappen — eerlijk freemium mét een middenmoot:
 *   Basis (gratis) → Supporter (klein maandelijks) → Pro (onbeperkt).
 * Betaalde plannen verruimen limieten en helpen de operationele kosten dragen.
 * Pure logica eerst (goed testbaar), browser-opslag eromheen.
 */

export type UsageKind = "aiRoutes" | "exports";
export type ProPlan = "supporter" | "month" | "year" | "life";
export type Tier = "free" | "supporter" | "pro";

export interface ProState {
  active: boolean;
  plan: ProPlan;
  code: string;
  activatedAt: number;
  /** proefmaand: actief tot deze timestamp (ms) */
  trialUntil?: number;
  source?: "code" | "stripe";
  /** Checkout-sessie voor periodieke statuscontrole, nooit een betaalkaartgegeven. */
  sessionId?: string;
  verifiedAt?: number;
}

export interface UsageState {
  /** lokale datum "yyyy-mm-dd" — limieten resetten om middernacht */
  date: string;
  aiRoutes: number;
  exports: number;
}

export const PRO_KEY = "apex-routes:pro";
export const USAGE_KEY = "apex-routes:usage";

export const TRIAL_DAYS = 30;

/** Daglimieten per laag. Pro = onbeperkt (∞). */
export const TIER_LIMITS: Record<Tier, Record<UsageKind, number>> = {
  free: { aiRoutes: 3, exports: 5 },
  supporter: { aiRoutes: 10, exports: 15 },
  pro: { aiRoutes: Number.POSITIVE_INFINITY, exports: Number.POSITIVE_INFINITY },
};

/** Behoud de oude naam als alias voor bestaande code. */
export const FREE_LIMITS = TIER_LIMITS.free;

export const PRO_PLANS: { id: ProPlan; label: string; price: string; note: string }[] = [
  { id: "supporter", label: "Supporter", price: "€2,99", note: "per maand · ruimere daglimieten" },
  { id: "month", label: "Maand", price: "€5,99", note: "per maand · flexibel opzegbaar" },
  { id: "year", label: "Jaar", price: "€39", note: "€3,25 p/m · bespaar €32,88 (46%)" },
  { id: "life", label: "Lifetime", price: "€99", note: "eenmalig · apparaatmigratie via support" },
];

export const PRO_BENEFITS: string[] = [
  "Onbeperkt AI-routes en GPX-downloads per dag",
  "Deelkaarten in hoge resolutie zonder gratis-laagregel",
  "Print/PDF-routeboek zonder Basis-footer",
  "Voorrang bij nieuwe Pro-routefuncties",
  "Je helpt routingcapaciteit, datakwaliteit en routeresearch financieren",
];

export const SUPPORTER_BENEFITS: string[] = [
  "10 AI-routes en 15 GPX-downloads per dag",
  "Deelkaarten zonder gratis-laagregel",
  "Zichtbare Supporter-status op dit apparaat",
  "Je helpt datakwaliteit en route-research financieren",
];

/** Publieke demo-codes bestaan nooit stilzwijgend in een productiebuild. */
export const DEMO_CODES_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_CODES === "true";

/* ---------- pure logica ---------- */

const CODE_PATTERNS: { pattern: RegExp; plan: ProPlan; trial?: boolean }[] = [
  { pattern: /^APEX-?PROEF(1|-?MAAND)?$/i, plan: "month", trial: true },
  { pattern: /^APE?X-?SUPPORT(ER)?$/i, plan: "supporter" },
  { pattern: /^APEX-?PRO-?MAAND$/i, plan: "month" },
  { pattern: /^APEX-?PRO-?(LEVEN|LIFETIME)$/i, plan: "life" },
  { pattern: /^APEX-?PRO-?(JAAR|YEAR|20\d{2})?$/i, plan: "year" },
];

export interface CodeCheck {
  plan: ProPlan | null;
  trial: boolean;
}

/** Geldige codes: APEXPRO(-JAAR/-MAAND/-LEVEN), APEXSUPPORT(ER), APEXPROEF(MAAND). */
export function checkCode(code: string): CodeCheck {
  if (!DEMO_CODES_ENABLED) return { plan: null, trial: false };
  const c = code.trim().toUpperCase();
  for (const { pattern, plan, trial } of CODE_PATTERNS) {
    if (pattern.test(c)) return { plan, trial: Boolean(trial) };
  }
  return { plan: null, trial: false };
}

export function planForCode(code: string): ProPlan | null {
  return checkCode(code).plan;
}

export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Verhoogt het dagteller — reset automatisch bij een nieuwe datum. */
export function bumpUsage(
  state: UsageState | null,
  kind: UsageKind,
  date: string
): UsageState {
  if (!state || state.date !== date) {
    return { date, aiRoutes: kind === "aiRoutes" ? 1 : 0, exports: kind === "exports" ? 1 : 0 };
  }
  return { ...state, [kind]: (state[kind] ?? 0) + 1 };
}

/** Welke laag hoort bij deze status? (proef telt als actieve maand.) */
export function tierOf(state: ProState | null | undefined): Tier {
  if (!state?.active) return "free";
  if (state.plan === "supporter") return "supporter";
  return "pro";
}

/** Resterende proefdagen (afgerond naar beneden); 0 als geen proef. */
export function trialDaysLeft(state: ProState | null | undefined, now: number = Date.now()): number {
  if (!state?.trialUntil) return 0;
  return Math.max(0, Math.ceil((state.trialUntil - now) / 86400000));
}

/** Resterend vandaag volgens de laag. */
export function remainingToday(
  kind: UsageKind,
  state: UsageState | null,
  pro: ProState | null | undefined
): number {
  const tier = tierOf(pro);
  const limit = TIER_LIMITS[tier][kind];
  if (!Number.isFinite(limit)) return Number.POSITIVE_INFINITY;
  const date = todayKey();
  if (!state || state.date !== date) return limit;
  return Math.max(0, limit - (state[kind] ?? 0));
}

export function canUse(
  kind: UsageKind,
  state: UsageState | null,
  pro: ProState | null | undefined
): boolean {
  return remainingToday(kind, state, pro) > 0;
}

/* ---------- browser-opslag ---------- */

function readJson(key: string): unknown {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // privémodus/quota — pro blijft dan gewoon inactief
  }
}

const VALID_PLANS = new Set(PRO_PLANS.map((p) => p.id));
const VALID_SESSION_ID = /^cs_[a-zA-Z0-9_]{8,196}$/;

export function getProState(): ProState {
  const raw = readJson(PRO_KEY) as Partial<ProState> | null;
  if (raw && typeof raw.active === "boolean" && typeof raw.code === "string") {
    const plan = VALID_PLANS.has(raw.plan as ProPlan) ? (raw.plan as ProPlan) : "year";
    const stripeSessionId =
      raw.source === "stripe" &&
      typeof raw.sessionId === "string" &&
      VALID_SESSION_ID.test(raw.sessionId)
        ? raw.sessionId
        : undefined;
    if (raw.active !== true) {
      if (stripeSessionId) {
        return {
          active: false,
          plan,
          code: "",
          activatedAt: typeof raw.activatedAt === "number" ? raw.activatedAt : 0,
          source: "stripe",
          sessionId: stripeSessionId,
          verifiedAt: typeof raw.verifiedAt === "number" ? raw.verifiedAt : undefined,
        };
      }
      return { active: false, plan, code: "", activatedAt: 0 };
    }
    // Publieke/demo-codes mogen nooit via handmatig aangepaste browseropslag
    // terugkeren in productie. Stripe-status vereist minimaal een geldige,
    // begrensde Checkout-sessie en wordt periodiek server-side herbevestigd.
    if (
      (raw.source === "stripe" && !stripeSessionId) ||
      (raw.source !== "stripe" && !DEMO_CODES_ENABLED)
    ) {
      return { active: false, plan, code: "", activatedAt: 0 };
    }
    const trialUntil = typeof raw.trialUntil === "number" ? raw.trialUntil : undefined;
    // verlopen proefmaand = niet meer actief
    if (trialUntil !== undefined && trialUntil < Date.now()) {
      return { active: false, plan, code: "", activatedAt: 0 };
    }
    return {
      active: true,
      plan,
      code: raw.code,
      activatedAt: raw.activatedAt ?? Date.now(),
      trialUntil,
      source: raw.source === "stripe" ? "stripe" : "code",
      sessionId: stripeSessionId,
      verifiedAt:
        raw.source === "stripe" && typeof raw.verifiedAt === "number"
          ? raw.verifiedAt
          : undefined,
    };
  }
  return { active: false, plan: "year", code: "", activatedAt: 0 };
}

export function getUsage(): UsageState | null {
  const raw = readJson(USAGE_KEY) as Partial<UsageState> | null;
  if (
    raw &&
    typeof raw.date === "string" &&
    typeof raw.aiRoutes === "number" &&
    typeof raw.exports === "number"
  ) {
    return { date: raw.date, aiRoutes: raw.aiRoutes, exports: raw.exports };
  }
  return null;
}

/** Telt één gebruik mee en geeft de nieuwe state terug. */
export function recordUse(kind: UsageKind): UsageState {
  const next = bumpUsage(getUsage(), kind, todayKey());
  writeJson(USAGE_KEY, next);
  return next;
}

export function activatePro(code: string): { ok: boolean; plan: ProPlan | null; trial: boolean } {
  const { plan, trial } = checkCode(code);
  if (!plan) return { ok: false, plan: null, trial: false };
  const state: ProState = {
    active: true,
    plan,
    code: code.trim().toUpperCase(),
    activatedAt: Date.now(),
    trialUntil: trial ? Date.now() + TRIAL_DAYS * 86400000 : undefined,
    source: "code",
  };
  writeJson(PRO_KEY, state);
  return { ok: true, plan, trial };
}

export function activateVerifiedPlan(entitlement: {
  plan: ProPlan;
  sessionId: string;
  verifiedAt: number;
}): ProState {
  const existing = getProState();
  const state: ProState = {
    active: true,
    plan: entitlement.plan,
    code: "",
    activatedAt:
      existing.source === "stripe" && existing.sessionId === entitlement.sessionId
        ? existing.activatedAt
        : entitlement.verifiedAt,
    source: "stripe",
    sessionId: entitlement.sessionId,
    verifiedAt: entitlement.verifiedAt,
  };
  writeJson(PRO_KEY, state);
  return state;
}

export function suspendVerifiedPlan(): ProState {
  const existing = getProState();
  if (existing.source !== "stripe" || !existing.sessionId) {
    deactivatePro();
    return getProState();
  }
  const state: ProState = { ...existing, active: false, code: "", verifiedAt: Date.now() };
  writeJson(PRO_KEY, state);
  return state;
}

export function deactivatePro(): void {
  writeJson(PRO_KEY, { active: false, plan: "year", code: "", activatedAt: 0 });
}

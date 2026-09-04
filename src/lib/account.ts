/**
 * Apex-account: licht, lokaal en eerlijk. Er is nog geen backend, dus een
 * account bestaat (nog) alleen in deze browser — het verankert de proefmaand
 * en voorvult je naam op het forum en prikbord. Zodra de backend er is, kan
 * dit naadloos naar een server-account migreren (zelfde velden).
 */

export interface Account {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export const ACCOUNT_KEY = "apex-routes:account";

/** Netto gefilterde naam (geen spaties rondom, max 40 tekens). */
export function tidyName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 40);
}

/** Grove e-mailcheck — diep valideren kan pas server-side. */
export function tidyEmail(raw: string): string {
  return raw.trim().toLowerCase().slice(0, 80);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Is dit object een geldig account (tegen databeschadiging)? */
export function isAccount(value: unknown): value is Account {
  if (!value || typeof value !== "object") return false;
  const a = value as Partial<Account>;
  return (
    typeof a.id === "string" &&
    a.id.length > 0 &&
    typeof a.name === "string" &&
    a.name.length >= 2 &&
    typeof a.email === "string" &&
    isValidEmail(a.email) &&
    typeof a.createdAt === "number"
  );
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Maakt een account aan (puur): naam minstens 2 tekens, e-mail geldig.
 * Geeft null bij ongeldige invoer.
 */
export function createAccount(
  name: string,
  email: string,
  now = Date.now(),
): Account | null {
  const cleanName = tidyName(name);
  const cleanEmail = tidyEmail(email);
  if (cleanName.length < 2 || !isValidEmail(cleanEmail)) return null;
  return { id: makeId(), name: cleanName, email: cleanEmail, createdAt: now };
}

/* ---------- opslag (alleen in de browser) ---------- */

export function getAccount(): Account | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAccount(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAccount(account: Account): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    return true;
  } catch {
    return false;
  }
}

/** Uitloggen: account van dit apparaat verwijderen (aborteert geen abonnement). */
export function signOut(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    /* negeren */
  }
}

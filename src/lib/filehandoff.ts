/**
 * Bestands- en promptoverdracht binnen de app.
 *
 * Bestanden leven bewust alleen in het geheugen (een File hoort niet in
 * localStorage). Planner-opdrachten krijgen daarnaast twee duurzame routes:
 * sessionStorage voor navigatie binnen dezelfde tab én een deelbare `?plan=`
 * URL. Daardoor werkt "Plan deze rit" ook na een harde paginanavigatie en kan
 * een planner-link rechtstreeks vanuit zoekresultaten of een bericht openen.
 */

interface PendingRouteFile {
  name: string;
  file: File;
}

let pending: PendingRouteFile | null = null;

export const PENDING_ROUTE_EVENT = "apex:pending-route";

export function setPendingRouteFile(file: File): void {
  pending = { name: file.name, file };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PENDING_ROUTE_EVENT));
  }
}

/** Is er al een bestand in de wachtrij? */
export function hasPendingRouteFile(): boolean {
  return pending !== null;
}

export function consumePendingRouteFile(): PendingRouteFile | null {
  const p = pending;
  pending = null;
  return p;
}

/* ---------- prompt-overdracht (roulette, atlas, ritten en klimmen) ---------- */

let pendingPrompt: string | null = null;

export const PENDING_PROMPT_EVENT = "apex:pending-prompt";
export const PENDING_PROMPT_KEY = "apex-routes:pending-prompt";
export const PLAN_QUERY_PARAM = "plan";
export const MAX_PROMPT_LENGTH = 500;

/** Schoont een externe planner-opdracht op en begrenst de URL/API-invoer. */
export function cleanPlannerPrompt(value: unknown): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, MAX_PROMPT_LENGTH)
    : "";
}

/** Bouwt een echte, deelbare one-click link naar de planner. */
export function plannerUrl(prompt: string): string {
  const clean = cleanPlannerPrompt(prompt);
  if (!clean) return "/?rit=1";
  const params = new URLSearchParams({ [PLAN_QUERY_PARAM]: clean });
  return `/?${params.toString()}`;
}

/** Leest uitsluitend de expliciete `plan`-parameter uit een querystring. */
export function promptFromSearch(search: string): string {
  try {
    const value = new URLSearchParams(search).get(PLAN_QUERY_PARAM);
    return cleanPlannerPrompt(value);
  } catch {
    return "";
  }
}

export function setPendingPrompt(text: string): void {
  const clean = cleanPlannerPrompt(text);
  if (!clean) return;
  pendingPrompt = clean;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(PENDING_PROMPT_KEY, clean);
    } catch {
      // Opslag kan in privémodus geblokkeerd zijn; de modulebuffer/URL blijft werken.
    }
    window.dispatchEvent(new CustomEvent(PENDING_PROMPT_EVENT));
  }
}

export function consumePendingPrompt(): string | null {
  let value = pendingPrompt;
  pendingPrompt = null;

  if (typeof window !== "undefined") {
    try {
      value ||= cleanPlannerPrompt(window.sessionStorage.getItem(PENDING_PROMPT_KEY));
      window.sessionStorage.removeItem(PENDING_PROMPT_KEY);
    } catch {
      // De modulebuffer is dan de fallback.
    }
  }
  return value || null;
}

/** window.launchQueue (PWA file handling): bestand vanuit het OS openen. */
interface LaunchParams {
  files?: { name?: string; getFile: () => Promise<File> }[];
}

export function registerFileLaunchHandler(onFile: (file: File) => void): void {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    launchQueue?: { setConsumer: (cb: (params: LaunchParams) => void) => void };
  };
  if (!w.launchQueue?.setConsumer) return;
  w.launchQueue.setConsumer((params) => {
    const handle = params.files?.[0];
    if (!handle) return;
    void handle
      .getFile()
      .then((file) => onFile(file))
      .catch(() => undefined);
  });
}

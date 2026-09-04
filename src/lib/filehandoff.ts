/**
 * Bestands-overdracht binnen de app: een routebestand dat op de landing wordt
 * gekozen (of via de PWA "openen met" binnenkomt) moet door de planner worden
 * verwerkt zodra die mount. Simpele module-buffer + event, geen state-bureau.
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

/* ---------- prompt-overdracht (bijv. Route Roulette op de landing) ---------- */

let pendingPrompt: string | null = null;

export const PENDING_PROMPT_EVENT = "apex:pending-prompt";

export function setPendingPrompt(text: string): void {
  pendingPrompt = text;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PENDING_PROMPT_EVENT));
  }
}

export function consumePendingPrompt(): string | null {
  const p = pendingPrompt;
  pendingPrompt = null;
  return p;
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

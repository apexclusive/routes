"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/** Chrome's install-event; niet in de standaard TypeScript-DOM-typen. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "apex-routes:install-dismissed";

/**
 * Registreert de service worker en biedt — heel terughoudend — aan om de app
 * te installeren. Geen pop-up en geen herhaling: wie wegklikt, ziet het niet
 * meer terug. Browsers zonder install-event (o.a. Safari) zien niets.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      // na 'load' registreren zodat het de eerste render niet vertraagt
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // meteen controleren op een nieuwere versie (kill-switch tegen
            // een oude, geblokkeerde kaart-versie die nog in een tabblad hangt)
            void reg.update();
            if (reg.waiting) reg.waiting.postMessage("SKIP_WAITING");
          })
          .catch(() => {
            /* geen service worker → de app werkt gewoon, alleen niet offline */
          });
        // eenmalig herladen wanneer een nieuwe versie het overneemt, zodat
        // niemand met oude assets blijft rondrijden
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!navigator.serviceWorker.controller) return;
          try {
            if (sessionStorage.getItem("apex-sw-reloaded") === "1") return;
            sessionStorage.setItem("apex-sw-reloaded", "1");
          } catch {
            return;
          }
          window.location.reload();
        });
      };
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* privémodus: dan tonen we het gewoon */
    }
    if (dismissed) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setDeferred(null));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* niets aan te doen */
    }
    setDeferred(null);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[1000] glass rounded px-3 py-2.5 flex items-center gap-3 max-w-[calc(100%-2rem)] print:hidden">
      <span className="text-sm text-slate-200">
        Apex Routes op je beginscherm?
      </span>
      <button
        onClick={async () => {
          const event = deferred;
          setDeferred(null);
          await event.prompt();
          await event.userChoice;
        }}
        className="btn-brand px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        Installeer
      </button>
      <button
        onClick={dismiss}
        title="Niet meer tonen"
        aria-label="Installatie-suggestie sluiten"
        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

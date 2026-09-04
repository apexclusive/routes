"use client";

import { Route } from "lucide-react";

/**
 * App-brede errorvangst: een crash in de kaart of een route bouwen moet geen
 * wit scherm opleveren, maar een nette melding met een poging-knop.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-dvh w-full bg-[#050507] text-white flex items-center justify-center p-6">
      <div className="glass rounded p-8 max-w-md text-center">
        <Route className="w-10 h-10 mx-auto mb-4 text-yellow-400" aria-hidden />
        <h1 className="font-display font-bold text-xl mb-2">
          Vastgelopen in de bocht
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Er ging iets mis bij het tekenen van je route. Je gegevens blijven
          bewaard — probeer het opnieuw.
          {error.digest && (
            <span className="block mt-2 text-[11px] text-slate-600">
              melding: {error.digest}
            </span>
          )}
        </p>
        <button onClick={reset} className="btn-brand px-5 py-2.5 rounded font-semibold text-sm">
          Opnieuw proberen
        </button>
      </div>
    </div>
  );
}

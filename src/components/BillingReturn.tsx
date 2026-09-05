"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import {
  clearPendingCheckout,
  getPendingCheckout,
  rememberPendingCheckout,
  verifyCheckoutStatus,
  type VerifiedEntitlement,
} from "@/lib/billing";
import { activateVerifiedPlan, getProState, suspendVerifiedPlan } from "@/lib/pro";
import { trackEvent } from "@/lib/analytics";

const PLAN_REVENUE = { supporter: 2.99, month: 5.99, year: 39, life: 99 } as const;

/** Verifieert de Stripe-return server-side en activeert daarna pas lokaal Pro. */
export default function BillingReturn() {
  const [notice, setNotice] = useState<{
    kind: "loading" | "pending" | "success" | "cancelled" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("billing");
    const sessionId = params.get("session_id") || "";
    let alive = true;
    let timer = 0;

    const activate = (
      entitlement: VerifiedEntitlement,
      announce: boolean,
      conversion: boolean
    ) => {
      const pro = activateVerifiedPlan(entitlement);
      window.dispatchEvent(new CustomEvent("apex:pro-change", { detail: pro }));
      if (announce) {
        setNotice({
          kind: "success",
          text: `${entitlement.plan === "supporter" ? "Supporter" : "Apex Pro"} is actief. Bedankt!`,
        });
      }
      if (conversion) {
        trackEvent(
          "Aankoop bevestigd",
          { plan: entitlement.plan },
          {
            amount: entitlement.amount ?? PLAN_REVENUE[entitlement.plan],
            currency: entitlement.currency || "EUR",
          }
        );
      }
    };

    if (!state) {
      const current = getProState();
      const pendingSession = getPendingCheckout();
      const checkingPending = Boolean(pendingSession);
      const storedSessionId = pendingSession ||
        (current.source === "stripe" ? current.sessionId || "" : "");
      let checkingSessionIsActive = Boolean(
        current.active && current.source === "stripe" && current.sessionId === storedSessionId
      );
      if (!storedSessionId) return;

      const interval = 12 * 60 * 60 * 1000;
      const check = async () => {
        const result = await verifyCheckoutStatus(storedSessionId);
        if (!alive) return;
        if (result.entitlement) {
          const wasPending = getPendingCheckout() === storedSessionId;
          clearPendingCheckout(storedSessionId);
          activate(result.entitlement, wasPending, wasPending);
          checkingSessionIsActive = true;
          timer = window.setTimeout(check, interval);
        } else if (result.inactive) {
          clearPendingCheckout(storedSessionId);
          if (checkingSessionIsActive) {
            const inactive = suspendVerifiedPlan();
            window.dispatchEvent(new CustomEvent("apex:pro-change", { detail: inactive }));
            setNotice({
              kind: "cancelled",
              text: "Je betaalde periode is afgelopen. Apex staat weer op Basis; je routes blijven bewaard.",
            });
          }
        } else {
          if (checkingPending && result.pending) {
            setNotice({
              kind: "pending",
              text: "Je betaling wordt nog verwerkt. Apex controleert de status automatisch; je hoeft niet opnieuw te betalen.",
            });
          }
          // Een pending betaling maximaal eens per vijf minuten; bij een
          // netwerkstoring na een uur. Zo blijven we ruim onder de API-limiet.
          timer = window.setTimeout(check, result.pending ? 5 * 60_000 : 60 * 60_000);
        }
      };
      const wait = checkingPending
        ? 0
        : current.active
          ? Math.max(0, interval - (Date.now() - (current.verifiedAt || 0)))
          : 0;
      timer = window.setTimeout(check, wait);
      return () => {
        alive = false;
        window.clearTimeout(timer);
      };
    }

    const cleanUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("billing");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    };

    if (state === "cancelled") {
      clearPendingCheckout();
      queueMicrotask(() =>
        setNotice({ kind: "cancelled", text: "Betaling geannuleerd — er is niets afgeschreven." })
      );
      trackEvent("Checkout geannuleerd");
      cleanUrl();
      return;
    }
    if (state !== "success" || !sessionId) {
      cleanUrl();
      return;
    }

    rememberPendingCheckout(sessionId);
    queueMicrotask(() =>
      setNotice({ kind: "loading", text: "Betaling veilig controleren…" })
    );

    const checkReturnedPayment = async (attempt = 0) => {
      const result = await verifyCheckoutStatus(sessionId);
      if (!alive) return;
      const entitlement = result.entitlement;
      if (entitlement) {
        clearPendingCheckout(sessionId);
        cleanUrl();
        activate(entitlement, true, true);
        return;
      }
      if (result.inactive) {
        clearPendingCheckout(sessionId);
        cleanUrl();
        setNotice({
          kind: "error",
          text: "Deze betaling kon niet worden bevestigd. Neem contact op met het betaalbewijs.",
        });
        trackEvent("Checkout verificatie mislukt", { retryable: false });
        return;
      }

      setNotice({
        kind: result.pending ? "pending" : "error",
        text: result.pending
          ? "Je betaling wordt nog verwerkt. Apex controleert automatisch opnieuw; betaal niet nog een keer."
          : "Stripe is tijdelijk niet bereikbaar. Je betaling is niet kwijt; Apex probeert automatisch opnieuw.",
      });
      trackEvent("Checkout verificatie uitgesteld", {
        pending: result.pending,
        attempt: Math.min(attempt + 1, 10),
      });
      const delay = attempt < 3 ? 30_000 : 5 * 60_000;
      timer = window.setTimeout(() => void checkReturnedPayment(attempt + 1), delay);
    };
    void checkReturnedPayment();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  if (!notice) return null;
  return (
    <div
      className={`fixed z-[1100] top-4 left-1/2 -translate-x-1/2 w-[min(30rem,calc(100vw-2rem))] glass rounded border p-4 shadow-2xl shadow-black/60 flex items-center gap-3 ${
        notice.kind === "success"
          ? "border-yellow-400/50"
          : notice.kind === "error"
            ? "border-red-400/40"
            : "border-white/15"
      }`}
      role="status"
      aria-live="polite"
    >
      <span className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
        notice.kind === "success" ? "bg-yellow-400 text-black" : "bg-white/10 text-slate-300"
      }`}>
        {notice.kind === "loading" || notice.kind === "pending" ? (
          <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden />
        ) : notice.kind === "success" ? (
          <Check className="w-4 h-4" strokeWidth={3} aria-hidden />
        ) : (
          <X className="w-4 h-4" aria-hidden />
        )}
      </span>
      <p className="text-[13px] text-slate-200 leading-snug flex-1">{notice.text}</p>
      {notice.kind !== "loading" && (
        <button
          onClick={() => setNotice(null)}
          className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center shrink-0"
          aria-label="Melding sluiten"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

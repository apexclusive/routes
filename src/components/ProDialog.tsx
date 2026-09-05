"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Check, Heart, User, Gift, LoaderCircle, ShieldCheck } from "lucide-react";
import { beginCheckout, openBillingPortal } from "@/lib/billing";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import {
  PRO_PLANS,
  PRO_BENEFITS,
  SUPPORTER_BENEFITS,
  DEMO_CODES_ENABLED,
  TIER_LIMITS,
  activatePro,
  deactivatePro,
  getProState,
  tierOf,
  trialDaysLeft,
  checkCode,
  type ProState,
  type ProPlan,
} from "@/lib/pro";
import {
  createAccount,
  getAccount,
  saveAccount,
  signOut,
  tidyName,
  tidyEmail,
  type Account,
} from "@/lib/account";

/**
 * Apex-lidmaatschap: Basis → Supporter → Pro. Een server-side gecreëerde
 * Stripe Checkout-sessie wordt na terugkomst geverifieerd voordat de laag
 * actief wordt. Demo-codes bestaan uitsluitend in expliciete previewmodus.
 */
export default function ProDialog({
  open,
  onClose,
  onProChange,
}: {
  open: boolean;
  onClose: () => void;
  onProChange?: (state: ProState) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  // override na eigen acties; anders live uit de opslag lezen
  const [override, setOverride] = useState<ProState | null>(null);
  // registratie bij de proefmaand
  const [account, setAccount] = useState<Account | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regErr, setRegErr] = useState("");
  const state = override ?? getProState();
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const r = requestAnimationFrame(() => {
      setAccount(getAccount());
      dialogRef.current?.querySelector<HTMLElement>("[data-dialog-close]")?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);
  const tier = tierOf(state);
  const trial = trialDaysLeft(state);
  const [pendingPlan, setPendingPlan] = useState<ProPlan | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  const sync = (next: ProState) => {
    setOverride(next);
    onProChange?.(next);
  };

  const tryActivate = () => {
    const check = checkCode(code);
    if (!check.plan) {
      setError("Ongeldige code. Formaat: APEXSUPPORT, APEXPRO, APEXPROEF…");
      return;
    }
    // proefmaand: eerst even registreren — zo blijft de proef aan jou gebonden
    if (check.trial && !account) {
      setPendingCode(code.trim().toUpperCase());
      setError("");
      setCode("");
      return;
    }
    const result = activatePro(code);
    if (!result.ok) {
      setError("Ongeldige code. Formaat: APEXSUPPORT, APEXPRO, APEXPROEF…");
      return;
    }
    setError("");
    setCode("");
    sync(getProState());
  };

  /** Registratie afronden en dan de proefmaand starten. */
  const confirmRegistration = () => {
    if (!pendingCode) return;
    const acc = createAccount(regName, regEmail);
    if (!acc) {
      setRegErr("Vul een naam (2+ tekens) en een geldig e-mailadres in.");
      return;
    }
    saveAccount(acc);
    setAccount(acc);
    const result = activatePro(pendingCode);
    setPendingCode(null);
    setRegName("");
    setRegEmail("");
    setRegErr("");
    if (!result.ok) {
      setError("Code kon niet worden geactiveerd — probeer het nog eens.");
      return;
    }
    sync(getProState());
  };

  const turnOff = () => {
    deactivatePro();
    sync(getProState());
  };

  const startCheckout = async (plan: ProPlan) => {
    if (pendingPlan) return;
    setPendingPlan(plan);
    setCheckoutError("");
    trackEvent("Checkout gestart", { plan, location: "pro-dialog" });
    try {
      const result = await beginCheckout(plan, account?.email);
      window.location.assign(result.url);
    } catch (err) {
      setPendingPlan(null);
      setCheckoutError(
        err instanceof Error ? err.message : "Betalen kon niet worden gestart."
      );
    }
  };

  const manageSubscription = async () => {
    if (!state.sessionId || portalLoading) return;
    setPortalLoading(true);
    setCheckoutError("");
    trackEvent("Abonnement beheren geopend", { plan: state.plan });
    try {
      window.location.assign(await openBillingPortal(state.sessionId));
    } catch (err) {
      setPortalLoading(false);
      setCheckoutError(
        err instanceof Error ? err.message : "Abonnementsbeheer kon niet worden geopend."
      );
    }
  };

  const tierLabel =
    tier === "pro"
      ? "Pro"
      : tier === "supporter"
        ? "Supporter"
        : "Basis";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Apex-lidmaatschap"
            className="glass w-full max-w-xl rounded border border-white/10 p-6 sm:p-8 max-h-[88dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-yellow-400 text-black flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">Steun de kaart</h2>
                  <p className="text-[13px] text-slate-400">
                    Basis gratis · Supporter €2,99/mnd · Pro vanaf €3,25/mnd
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                data-dialog-close
                className="p-2 hover:bg-white/10 rounded transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state.active ? (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="text-5xl mb-3 flex items-center justify-center"
                >
                  {tier === "supporter" ? (
                    <Heart className="w-10 h-10 text-red-400 fill-current" />
                  ) : (
                    <Crown className="w-10 h-10 text-yellow-400" />
                  )}
                </motion.div>
                <p className="font-display font-bold text-lg text-yellow-400">
                  {tierLabel} is actief{trial > 0 ? ` — proef, nog ${trial} dag${trial === 1 ? "" : "en"}` : ""}
                </p>
                <p className="text-sm text-slate-400 mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
                  {tier === "supporter"
                    ? "Bedankt! Jouw steun helpt routingcapaciteit, datakwaliteit en grondig routeonderzoek betalen."
                    : "Alle limieten zijn opgeheven. Bedankt — jij helpt de planner snel en de routeresearch scherp te houden."}
                </p>
                <p className="text-[12px] text-slate-500 mb-5">
                  Vandaag nog: {Number.isFinite(TIER_LIMITS[tier].aiRoutes) ? `${TIER_LIMITS[tier].aiRoutes} AI-routes / ${TIER_LIMITS[tier].exports} GPX-downloads` : "onbeperkt"}
                </p>
                {account && (
                  <p className="text-[12px] text-slate-400 mb-4">
                    <User className="w-3.5 h-3.5 inline text-yellow-400/80" /> {account.name} · {account.email}{" "}
                    <button
                      onClick={() => {
                        signOut();
                        setAccount(null);
                      }}
                      className="underline underline-offset-2 hover:text-yellow-400 ml-1"
                    >
                      Uitloggen
                    </button>
                    <span className="block text-slate-600 mt-0.5">
                      Je account blijft (nog) in deze browser — synchronisatie
                      komt met de server.
                    </span>
                  </p>
                )}
                {state.source === "stripe" ? (
                  state.plan === "life" ? (
                    <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                      Eenmalig betaald en veilig geverifieerd via Stripe
                    </p>
                  ) : (
                    <button
                      onClick={() => void manageSubscription()}
                      disabled={portalLoading}
                      className="btn-ghost px-4 py-2 rounded text-sm inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {portalLoading ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden /> : <ShieldCheck className="w-4 h-4" aria-hidden />}
                      {portalLoading ? "Beheer openen…" : "Abonnement en facturen beheren"}
                    </button>
                  )
                ) : (
                  <button
                    onClick={turnOff}
                    className="btn-ghost px-4 py-2 rounded text-sm"
                  >
                    Deactiveren (op deze browser)
                  </button>
                )}
                {state.source === "stripe" && (
                  <p className="mt-3 text-[11px] text-slate-600">
                    Consument binnen de bedenktijd?{" "}
                    <Link href="/herroepen" className="underline hover:text-yellow-300">
                      Aankoop online herroepen
                    </Link>
                  </p>
                )}
                {checkoutError && (
                  <p className="text-[12px] text-red-300 mt-3" role="alert">{checkoutError}</p>
                )}
              </div>
            ) : (
              <>
                {state.source === "stripe" && state.sessionId && (
                  <div className="glass rounded border border-amber-400/30 bg-amber-400/[0.05] p-4 mb-4">
                    <p className="text-[13px] font-semibold text-amber-200">Dit betaalde recht is nu niet actief</p>
                    <p className="text-[12px] text-slate-400 mt-1 mb-3 leading-relaxed">
                      Je routes blijven staan. Controleer je betaalstatus of kies opnieuw een plan.
                    </p>
                    {state.plan !== "life" ? (
                      <button
                        onClick={() => void manageSubscription()}
                        disabled={portalLoading}
                        className="btn-ghost px-3.5 py-2 text-[12px] inline-flex items-center gap-2 disabled:opacity-60"
                      >
                        {portalLoading && <LoaderCircle className="w-3.5 h-3.5 animate-spin" aria-hidden />}
                        Betaling en abonnement beheren
                      </button>
                    ) : (
                      <a href="mailto:partners@apexclusive.nl" className="text-[12px] text-yellow-300 underline underline-offset-2">
                        Lifetime-toegang laten herstellen
                      </a>
                    )}
                  </div>
                )}

                {/* steun-boodschap */}
                <div className="glass rounded border border-yellow-400/25 p-4 mb-5">
                  <p className="text-[13px] text-slate-300 leading-relaxed">
                    <b className="text-yellow-300">Waar je steun bij helpt:</b>{" "}
                    routing- en AI-capaciteit, monitoring, datakwaliteit en tijd
                    voor grondig routeonderzoek. Beter voor jou, en beter voor
                    iedereen die gratis plant.
                  </p>
                </div>

                {/* plannen */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {PRO_PLANS.map((p) => (
                    <div
                      key={p.id}
                      className={`glass rounded border p-3 text-center ${
                        p.id === "year" ? "border-yellow-400/50 relative" : "border-white/10"
                      }`}
                    >
                      {p.id === "year" && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          46% VOORDEEL
                        </span>
                      )}
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 flex items-center justify-center gap-1">
                        {p.id === "supporter" && <Heart className="w-3 h-3 text-yellow-400" />}
                        {p.label}
                      </p>
                      <p className="font-display font-bold text-lg mt-1">{p.price}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {p.note}
                      </p>
                      <button
                        onClick={() => void startCheckout(p.id)}
                        disabled={Boolean(pendingPlan)}
                        className="mt-2 w-full px-2.5 py-1.5 rounded text-[11px] font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {pendingPlan === p.id && <LoaderCircle className="w-3 h-3 animate-spin" aria-hidden />}
                        {pendingPlan === p.id ? "Openen…" : `Kies ${p.label}`}
                      </button>
                    </div>
                  ))}
                </div>
                {checkoutError && (
                  <p className="text-[12px] text-red-300 glass rounded border border-red-400/25 p-3 -mt-2 mb-4" role="alert">
                    {checkoutError}{" "}
                    <a href="mailto:partners@apexclusive.nl" className="underline hover:text-white">
                      Neem contact op
                    </a>
                    .
                  </p>
                )}
                <div className="text-[10px] text-slate-600 text-center -mt-2 mb-5 leading-relaxed">
                  <p className="flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" aria-hidden />
                    Veilige checkout via Stripe · promotiecodes worden in de checkout toegepast
                  </p>
                  <p className="mt-1">
                    Bekijk vóór betaling de{" "}
                    <Link href="/voorwaarden" className="underline hover:text-yellow-300">voorwaarden</Link>,{" "}
                    <Link href="/privacy" className="underline hover:text-yellow-300">privacyuitleg</Link> en{" "}
                    <Link href="/herroepen" className="underline hover:text-yellow-300">bedenktijd</Link>.
                  </p>
                </div>

                {/* voordelen: supporter + pro */}
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-yellow-400/90 font-bold mb-2 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Supporter
                    </p>
                    <ul className="space-y-1.5">
                      {SUPPORTER_BENEFITS.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-[13px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-yellow-400/90 font-bold mb-2 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Pro
                    </p>
                    <ul className="space-y-1.5">
                      {PRO_BENEFITS.slice(0, 4).map((b) => (
                        <li key={b} className="flex items-start gap-2 text-[13px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {DEMO_CODES_ENABLED && (
                  <div className="glass rounded border border-white/10 p-3.5 mb-4 flex items-center gap-3">
                    <Gift className="w-5 h-5 text-yellow-300 shrink-0" aria-hidden />
                    <p className="text-[13px] text-slate-300 leading-snug">
                      <b>Previewmodus:</b> test 30 dagen Pro met code{" "}
                      <code className="bg-yellow-400/15 text-yellow-300 px-1.5 py-0.5 rounded font-bold">
                        APEXPROEF
                      </code>
                      . Demo-codes worden niet geaccepteerd in productie.
                    </p>
                  </div>
                )}

                {DEMO_CODES_ENABLED && (
                  <>
                {/* registratie bij proefmaand */}
                {pendingCode && (
                  <div className="glass rounded border border-yellow-400/30 p-4 mb-4">
                    <p className="text-[13px] font-semibold text-yellow-300 mb-1">
                      Even registreren voor je proefmaand
                    </p>
                    <p className="text-[12px] text-slate-400 mb-3 leading-relaxed">
                      Zo blijft de proef aan jou gekoppeld (en staat je naam
                      klaar op het forum). Geen wachtwoord, geen spam — je
                      account blijft voorlopig in deze browser.
                    </p>
                    <div className="space-y-2">
                      <input
                        value={regName}
                        onChange={(e) => setRegName(tidyName(e.target.value))}
                        placeholder="Je naam"
                        aria-label="Je naam"
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm outline-none focus:border-yellow-500/60"
                      />
                      <input
                        value={regEmail}
                        onChange={(e) => setRegEmail(tidyEmail(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && confirmRegistration()}
                        placeholder="E-mailadres"
                        aria-label="E-mailadres"
                        type="email"
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm outline-none focus:border-yellow-500/60"
                      />
                      {regErr && (
                        <p className="text-[12px] text-red-400">{regErr}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={confirmRegistration}
                          className="btn-brand flex-1 px-4 py-2.5 rounded text-sm font-semibold"
                        >
                          Proefmaand starten
                        </button>
                        <button
                          onClick={() => {
                            setPendingCode(null);
                            setRegErr("");
                          }}
                          className="btn-ghost px-4 py-2.5 rounded text-sm"
                        >
                          Terug
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* code */}
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && tryActivate()}
                    placeholder="Activatiecode (bijv. APEXPROEF)"
                    aria-label="Activatiecode"
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-4 py-3 text-sm outline-none focus:border-yellow-500/60 uppercase"
                  />
                  <button
                    onClick={tryActivate}
                    className="btn-brand px-4 rounded text-sm font-semibold shrink-0"
                  >
                    Activeren
                  </button>
                </div>
                {error && <p className="text-[12px] text-red-400 mt-2">{error}</p>}
                  </>
                )}

                <p className="text-[11px] text-slate-600 mt-4 text-center">
                  De gratis versie blijft volledig werken — elke vorm van steun is
                  vrijwillig en helpt de planner en data beter te maken.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

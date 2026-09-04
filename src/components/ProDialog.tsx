"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Check, Sparkles, Heart, User, Gift } from "lucide-react";
import { checkoutUrl, anyCheckoutConfigured } from "@/lib/monetize";
import { useEffect } from "react";
import {
  PRO_PLANS,
  PRO_BENEFITS,
  SUPPORTER_BENEFITS,
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
 * Apex-lidmaatschap: Basis (gratis) → Supporter → Pro, met proefmaand.
 * Steun wordt geformuleerd als wat het is: inkoop van betere data voor
 * iedereen. Betalen via Stripe-link (NEXT_PUBLIC_STRIPE_LINK); zonder
 * sleutel werkt de activatiecode-flow (demo's: APEXSUPPORT, APEXPRO,
 * APEXPROEF).
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
    const r = requestAnimationFrame(() => setAccount(getAccount()));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  const tier = tierOf(state);
  const trial = trialDaysLeft(state);
  const [pendingPlan, setPendingPlan] = useState<ProPlan | null>(null);

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
                    Basis gratis · Supporter €2,99 · Pro onbeperkt
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
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
                    ? "Bedankt! Jouw steun laat ons betere kaart- en routedata inkopen en dieper researchen welke routes er écht toe doen."
                    : "Alle limieten zijn opgeheven. Bedankt — jij maakt diepere route-research mogelijk."}
                </p>
                <p className="text-[12px] text-slate-500 mb-5">
                  Vandaag nog: {Number.isFinite(TIER_LIMITS[tier].aiRoutes) ? `${TIER_LIMITS[tier].aiRoutes} AI-routes / ${TIER_LIMITS[tier].exports} exports` : "onbeperkt"}
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
                <button
                  onClick={turnOff}
                  className="btn-ghost px-4 py-2 rounded text-sm"
                >
                  Deactiveren (op deze browser)
                </button>
              </div>
            ) : (
              <>
                {/* steun-boodschap */}
                <div className="glass rounded border border-yellow-400/25 p-4 mb-5">
                  <p className="text-[13px] text-slate-300 leading-relaxed">
                    <b className="text-yellow-300">Waar je steun heen gaat:</b> we
                    kopen er de beste data mee in — actueel kaartmateriaal,
                    hoogte- en routekwaliteitssets — en we nemen de tijd om
                    routes en tips écht te rijden en te checken. Beter voor jou,
                    beter voor iedereen die gratis plannet.
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
                          POPULAIR
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
                      {checkoutUrl(p.id) && (
                        <a
                          href={checkoutUrl(p.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setPendingPlan(p.id);
                          }}
                          className="mt-2 block px-2.5 py-1.5 rounded text-[11px] font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-colors"
                        >
                          Betaal {p.price.split("/")[0].split("·")[0].trim()}
                        </a>
                      )}
                    </div>
                  ))}
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

                {/* proefmaand */}
                <div className="glass rounded border border-white/10 p-3.5 mb-4 flex items-center gap-3">
                  <Gift className="w-5 h-5 text-yellow-300 shrink-0" aria-hidden />
                  <p className="text-[13px] text-slate-300 leading-snug">
                    <b>Eerste maand gratis proberen?</b> Gebruik code{" "}
                    <code className="bg-yellow-400/15 text-yellow-300 px-1.5 py-0.5 rounded font-bold">
                      APEXPROEF
                    </code>{" "}
                    — volledig Pro, 30 dagen, daarna gewoon Basis als je niets doet.
                  </p>
                </div>

                {/* betalen */}
                {!anyCheckoutConfigured() && (
                  <p className="text-[12px] text-slate-500 glass rounded border border-white/10 p-3 mb-3 leading-relaxed">
                    Betalen loopt via Stripe zodra de betaallink is geconfigureerd
                    (<code>NEXT_PUBLIC_STRIPE_LINK</code>). Tot die tijd werken de
                    activatiecodes — demo&apos;s:{" "}
                    <b className="text-yellow-400">APEXSUPPORT</b> ·{" "}
                    <b className="text-yellow-400">APEXPRO</b> ·{" "}
                    <b className="text-yellow-400">APEXPROEF</b>.
                  </p>
                )}

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

                <p className="text-[11px] text-slate-600 mt-4 text-center">
                  De gratis versie blijft volledig werken — elke vorm van steun is
                  vrijwillig en gaat rechtstreeks in betere data.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

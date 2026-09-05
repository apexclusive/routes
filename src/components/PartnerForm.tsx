"use client";

import { useState } from "react";
import { AlertCircle, Check, Copy, LoaderCircle, Send } from "lucide-react";
import {
  buildPartnerMailto,
  PARTNER_PACKAGES,
  validatePartnerLead,
} from "@/lib/monetize";
import { trackEvent } from "@/lib/analytics";

/** Lead-capture via de mail-API, met mailto als betrouwbare zero-backend fallback. */
export default function PartnerForm() {
  const [bedrijf, setBedrijf] = useState("");
  const [email, setEmail] = useState("");
  const [pakket, setPakket] = useState<(typeof PARTNER_PACKAGES)[number]>("Event-promotie");
  const [bericht, setBericht] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [trackedStart, setTrackedStart] = useState(false);

  const lead = validatePartnerLead({ bedrijf, email, pakket, bericht });
  const geldig = Boolean(lead);

  const verzend = async () => {
    if (!lead || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, website }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        fallback?: string;
        error?: string;
      } | null;
      if (response.ok && result?.ok) {
        setStatus("sent");
        trackEvent("Partnerlead verstuurd", { pakket });
        return;
      }
      if (result?.fallback === "mailto") {
        trackEvent("Partnerlead mail fallback", { pakket });
        window.location.href = buildPartnerMailto(bedrijf, email, pakket, bericht);
        setStatus("idle");
        return;
      }
      throw new Error(result?.error || "Versturen is niet gelukt.");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Versturen is niet gelukt.");
    }
  };

  const kopieer = async () => {
    if (!lead) return;
    const text = [
      `Bedrijf: ${lead.bedrijf}`,
      `E-mail: ${lead.email}`,
      `Pakket: ${lead.pakket}`,
      "",
      lead.bericht,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Kopiëren is door je browser geblokkeerd.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="glass rounded border border-yellow-400/30 p-7 text-center" role="status">
        <span className="w-12 h-12 rounded bg-yellow-400 text-black mx-auto mb-4 flex items-center justify-center">
          <Check className="w-6 h-6" strokeWidth={3} aria-hidden />
        </span>
        <h2 className="font-display font-bold text-xl">Aanvraag ontvangen</h2>
        <p className="text-[13px] text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Bedankt, {bedrijf}. We reageren op {email} met de mediakit en een
          voorstel dat bij {pakket.toLowerCase()} past.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="btn-ghost px-4 py-2.5 rounded text-[13px] font-semibold mt-5"
        >
          Nog een aanvraag
        </button>
      </div>
    );
  }

  return (
    <form
      className="glass rounded border border-white/10 p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void verzend();
      }}
      onFocusCapture={() => {
        if (trackedStart) return;
        setTrackedStart(true);
        trackEvent("Partnerformulier gestart", { pakket });
      }}
    >
      <h2 className="font-display font-bold text-[18px] mb-1">Vraag direct de mediakit aan</h2>
      <p className="text-[12px] text-slate-500 mb-5">
        Geen omweg: je aanvraag gaat rechtstreeks naar het partnerteam. Als de
        mailservice niet beschikbaar is, opent automatisch een ingevulde e-mail.
      </p>

      <div className="hidden" aria-hidden>
        <label>
          Website
          <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
        <input
          value={bedrijf}
          onChange={(event) => setBedrijf(event.target.value)}
          placeholder="Bedrijf of event"
          aria-label="Bedrijf of event"
          autoComplete="organization"
          maxLength={100}
          className="h-11 bg-white/5 border border-white/10 rounded px-3 text-[13px] outline-none focus:border-yellow-500/60"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="Zakelijk e-mailadres"
          aria-label="E-mailadres"
          autoComplete="email"
          maxLength={160}
          className="h-11 bg-white/5 border border-white/10 rounded px-3 text-[13px] outline-none focus:border-yellow-500/60"
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2.5" role="group" aria-label="Kies een pakket">
        {PARTNER_PACKAGES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPakket(option)}
            aria-pressed={pakket === option}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold border transition-colors ${
              pakket === option
                ? "bg-yellow-400 text-black border-yellow-400"
                : "border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <textarea
        value={bericht}
        onChange={(event) => setBericht(event.target.value)}
        placeholder="Welk event of aanbod, welke periode en wat wil je bereiken?"
        aria-label="Bericht"
        maxLength={2_000}
        rows={4}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-[13px] outline-none focus:border-yellow-500/60 resize-y mb-3"
      />

      {status === "error" && (
        <p className="text-[12px] text-red-300 flex items-center gap-1.5 mb-3" role="alert">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!geldig || status === "sending"}
          data-track="Partnerformulier verzendpoging"
          data-track-package={pakket}
          className="btn-brand px-4 py-2.5 rounded text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-40"
        >
          {status === "sending" ? (
            <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Send className="w-4 h-4" aria-hidden />
          )}
          {status === "sending" ? "Veilig versturen…" : "Verstuur aanvraag"}
        </button>
        <button
          type="button"
          onClick={() => void kopieer()}
          disabled={!geldig}
          className="px-4 py-2.5 rounded text-[13px] font-semibold glass border border-white/10 hover:border-yellow-400/50 flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          {copied ? <Check className="w-4 h-4 text-yellow-400" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
          {copied ? "Gekopieerd" : "Kopieer aanvraag"}
        </button>
        {!geldig && (
          <span className="text-[11px] text-slate-500 self-center">
            Bedrijf en geldig e-mailadres nodig
          </span>
        )}
      </div>
    </form>
  );
}

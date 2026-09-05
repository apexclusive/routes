"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, LoaderCircle, RotateCcw } from "lucide-react";
import { getAccount } from "@/lib/account";
import { getProState } from "@/lib/pro";
import { validateWithdrawalRequest, withdrawalMailto } from "@/lib/withdrawal";

function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `withdrawal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

export default function WithdrawalForm() {
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState(true);
  const [receiptId, setReceiptId] = useState("");
  const [copied, setCopied] = useState(false);
  const requestId = useRef("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const account = getAccount();
      const pro = getProState();
      if (account?.email) setEmail(account.email);
      if (pro.source === "stripe" && pro.sessionId) setSessionId(pro.sessionId);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const valid = Boolean(
    validateWithdrawalRequest({
      email,
      reference,
      sessionId,
      requestId: "withdrawal_form_validation_2026",
    })
  );

  const submit = async () => {
    if (!valid || status === "sending") return;
    if (!requestId.current) requestId.current = newRequestId();
    const currentRequestId = requestId.current;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reference,
          sessionId,
          requestId: currentRequestId,
          website,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        fallback?: string;
        error?: string;
        submittedAt?: string;
        requestId?: string;
        confirmationEmail?: boolean;
      } | null;
      if (response.ok && result?.ok) {
        setSubmittedAt(result.submittedAt || new Date().toISOString());
        setReceiptId(result.requestId || currentRequestId);
        setConfirmationEmail(result.confirmationEmail !== false);
        setStatus("sent");
        return;
      }
      if (result?.fallback === "mailto") {
        window.location.href = withdrawalMailto(email, reference);
        setStatus("error");
        setMessage(
          "Je mailprogramma is geopend als reserve. Verstuur die e-mail om je herroeping vast te leggen."
        );
        return;
      }
      throw new Error(result?.error || "Het verzoek kon niet worden verstuurd.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Het verzoek kon niet worden verstuurd."
      );
    }
  };

  const copyFallback = async () => {
    const text = [
      "Hierbij herroep ik mijn online aankoop van Apex Routes.",
      `E-mail bij betaling: ${email}`,
      `Orderreferentie: ${reference || "niet bekend"}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setStatus("error");
      setMessage("Kopiëren is door je browser geblokkeerd.");
    }
  };

  if (status === "sent") {
    return (
      <div className="glass rounded border border-yellow-400/35 p-6 sm:p-7" role="status">
        <span className="w-11 h-11 rounded bg-yellow-400 text-black flex items-center justify-center mb-4">
          <Check className="w-5 h-5" strokeWidth={3} aria-hidden />
        </span>
        <h2 className="font-display font-bold text-xl">Herroeping ontvangen</h2>
        <p className="text-[13px] text-slate-400 leading-relaxed mt-2">
          We hebben je verklaring vastgelegd op {new Date(submittedAt).toLocaleString("nl-NL")}.
          {confirmationEmail ? (
            <> Een ontvangstbevestiging is verstuurd naar <span className="text-slate-200">{email}</span>. Bewaar die e-mail.</>
          ) : (
            <> De e-mailbevestiging kon niet worden afgeleverd; bewaar daarom de datum en het verzoek-ID hieronder.</>
          )}{" "}
          Het team controleert de aankoop en bevestigt de verwerking.
        </p>
        <p className="text-[11px] text-slate-600 font-mono mt-4 break-all">
          VERZOEK-ID · {receiptId}
        </p>
      </div>
    );
  }

  return (
    <form
      className="glass rounded border border-white/10 p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="flex items-start gap-3 mb-5">
        <span className="w-10 h-10 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
          <RotateCcw className="w-5 h-5 text-yellow-300" aria-hidden />
        </span>
        <div>
          <h2 className="font-display font-bold text-lg">Herroep je online aankoop</h2>
          <p className="text-[12px] text-slate-500 leading-relaxed mt-1">
            Met verzenden verklaar je ondubbelzinnig dat je de overeenkomst wilt herroepen.
            Een reden is niet nodig.
          </p>
        </div>
      </div>

      <div className="hidden" aria-hidden>
        <label>Website<input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="block mb-3">
        <span className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
          E-mail bij de betaling
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          maxLength={160}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full h-11 bg-white/5 border border-white/10 rounded px-3 text-[13px] outline-none focus:border-yellow-400/60"
        />
      </label>

      <label className="block mb-4">
        <span className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
          Order- of factuurreferentie <span className="normal-case tracking-normal">(optioneel)</span>
        </span>
        <input
          maxLength={100}
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="Bijvoorbeeld uit je Stripe-betalingsbewijs"
          className="w-full h-11 bg-white/5 border border-white/10 rounded px-3 text-[13px] outline-none focus:border-yellow-400/60"
        />
      </label>

      {sessionId && (
        <p className="text-[11px] text-slate-600 mb-4">
          De betalingsreferentie van dit apparaat wordt beveiligd meegestuurd om je aankoop sneller te vinden.
        </p>
      )}
      {status === "error" && (
        <p className="text-[12px] text-red-300 mb-3" role="alert">{message}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!valid || status === "sending"}
          className="btn-brand px-4 py-2.5 rounded text-[13px] font-semibold flex items-center gap-2 disabled:opacity-40"
        >
          {status === "sending" ? (
            <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <RotateCcw className="w-4 h-4" aria-hidden />
          )}
          {status === "sending" ? "Versturen en bevestigen…" : "Aankoop herroepen"}
        </button>
        <button
          type="button"
          onClick={() => void copyFallback()}
          disabled={!email.trim()}
          className="btn-ghost px-4 py-2.5 rounded text-[13px] flex items-center gap-2 disabled:opacity-40"
        >
          {copied ? <Check className="w-4 h-4 text-yellow-400" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
          {copied ? "Tekst gekopieerd" : "Kopieer als reserve"}
        </button>
      </div>
      <p className="text-[10px] text-slate-600 leading-relaxed mt-4">
        We gebruiken deze gegevens alleen om je aankoop te vinden, het verzoek te verwerken en de ontvangst te bevestigen.
        Werkt het formulier niet, dan kun je ook{" "}
        <a href={withdrawalMailto(email, reference)} className="underline hover:text-yellow-300">
          dezelfde verklaring per e-mail sturen
        </a>.
      </p>
    </form>
  );
}

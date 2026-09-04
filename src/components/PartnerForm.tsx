"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { buildPartnerMailto } from "@/lib/monetize";

const PAKKETTEN = [
  "Event-promotie",
  "Partner van het seizoen",
  "Hotel- & horecapartner",
  "Anders / maatwerk",
] as const;

/** Zero-backend lead-capture: vult een mailto naar partners@apexclusive.nl. */
export default function PartnerForm() {
  const [bedrijf, setBedrijf] = useState("");
  const [email, setEmail] = useState("");
  const [pakket, setPakket] = useState<(typeof PAKKETTEN)[number]>("Event-promotie");
  const [bericht, setBericht] = useState("");
  const [copied, setCopied] = useState(false);

  const geldig = bedrijf.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);

  const verzend = () => {
    if (!geldig) return;
    window.location.href = buildPartnerMailto(bedrijf, email, pakket, bericht);
  };

  const kopieer = async () => {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(buildPartnerMailto(bedrijf, email, pakket, bericht)));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // klembord geblokkeerd — mailto werkt nog steeds
    }
  };

  return (
    <div className="glass rounded border border-white/10 p-5">
      <h2 className="font-display font-bold text-[16px] mb-1">Vraag direct de mediakit aan</h2>
      <p className="text-[12px] text-slate-500 mb-4">
        Vul in wat relevant is — je mailprogramma opent met een kant-en-klaar
        bericht aan partners@apexclusive.nl.
      </p>
      <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
        <input
          value={bedrijf}
          onChange={(e) => setBedrijf(e.target.value)}
          placeholder="Bedrijf of event"
          aria-label="Bedrijf of event"
          className="h-10 bg-white/5 border border-white/10 rounded px-3 text-[13px] outline-none focus:border-yellow-500/60"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="E-mailadres"
          aria-label="E-mailadres"
          className="h-10 bg-white/5 border border-white/10 rounded px-3 text-[13px] outline-none focus:border-yellow-500/60"
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {PAKKETTEN.map((p) => (
          <button
            key={p}
            onClick={() => setPakket(p)}
            aria-pressed={pakket === p}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold border transition-colors ${
              pakket === p
                ? "bg-yellow-400 text-black border-yellow-400"
                : "border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <textarea
        value={bericht}
        onChange={(e) => setBericht(e.target.value)}
        placeholder="Kort je plannen: welk event, welke periode, wat wil je bereiken?"
        aria-label="Bericht"
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-[13px] outline-none focus:border-yellow-500/60 resize-none mb-3"
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={verzend}
          disabled={!geldig}
          className="btn-brand px-4 py-2.5 rounded text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-40"
        >
          <Send className="w-4 h-4" aria-hidden />
          Verstuur aanvraag
        </button>
        <button
          onClick={() => void kopieer()}
          className="px-4 py-2.5 rounded text-[13px] font-semibold glass border border-white/10 hover:border-yellow-400/50 flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-yellow-400" aria-hidden /> : null}
          {copied ? "Gekopieerd" : "Kopieer als tekst"}
        </button>
        {!geldig && (
          <span className="text-[11px] text-slate-500 self-center">
            Bedrijf en geldig e-mailadres nodig
          </span>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import ThemeSwitch from "./ThemeSwitch";
import SkipLink from "./SkipLink";

export default function LegalShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const legal = {
    name: process.env.LEGAL_NAME?.trim(),
    address: process.env.LEGAL_ADDRESS?.trim(),
    registration: process.env.LEGAL_REGISTRATION?.trim(),
    vat: process.env.LEGAL_VAT_ID?.trim(),
  };
  const hasLegalIdentity = Object.values(legal).some(Boolean);

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[38rem] h-[38rem] bg-[#ffe600]/[0.08] top-[-180px] right-[-120px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">Apex Routes</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <SiteMenu />
          <Link href="/prijzen" className="btn-ghost h-10 px-3.5 rounded font-semibold text-[13px] flex items-center">
            Prijzen
          </Link>
          <Link href="/?rit=1" className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:flex items-center">
            Open planner
          </Link>
        </div>
      </nav>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 py-14 sm:py-20 max-w-3xl mx-auto">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">{title}</h1>
        <p className="text-[15px] text-slate-400 leading-relaxed mb-4 max-w-2xl">{intro}</p>
        <p className="text-[11px] text-slate-600 font-mono mb-10">LAATST BIJGEWERKT · 4 SEPTEMBER 2026</p>
        <div className="space-y-3 legal-copy">{children}</div>
        {hasLegalIdentity && (
          <aside className="mt-3 glass rounded border border-white/10 p-5 text-[12px] text-slate-500 leading-relaxed" aria-label="Exploitantgegevens">
            <p className="eyebrow mb-2">EXPLOITANT</p>
            {legal.name && <p className="text-slate-300 font-semibold">{legal.name}</p>}
            {legal.address && <p>{legal.address}</p>}
            {legal.registration && <p>Handelsregister: {legal.registration}</p>}
            {legal.vat && <p>BTW: {legal.vat}</p>}
          </aside>
        )}
        <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-wrap gap-4 text-[12px] text-slate-500">
          <Link href="/privacy" className="hover:text-yellow-300">Privacy</Link>
          <Link href="/voorwaarden" className="hover:text-yellow-300">Voorwaarden</Link>
          <Link href="/herroepen" className="hover:text-yellow-300">Aankoop herroepen</Link>
          <Link href="/prijzen" className="hover:text-yellow-300">Prijzen</Link>
          <a href="mailto:partners@apexclusive.nl" className="hover:text-yellow-300">Contact</a>
        </div>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass rounded border border-white/10 p-5 sm:p-6">
      <h2 className="font-display font-bold text-[17px] mb-2">{title}</h2>
      <div className="text-[13px] text-slate-400 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
